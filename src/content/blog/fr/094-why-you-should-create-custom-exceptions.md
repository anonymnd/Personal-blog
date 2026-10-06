---
title: "Pourquoi vous devriez créer des exceptions personnalisées"
description: "Apprenez à remplacer les erreurs système génériques par des exceptions métier pour améliorer la lisibilité du code et la gestion des erreurs API."
pubDate: 2026-10-10T13:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Un utilisateur tente d'approuver une demande, mais celle-ci est déjà clôturée. Si vous lancez une `RuntimeException` générique, votre gestionnaire d'erreurs global ne sait pas s'il s'agit d'une panne de base de données, d'un pointeur nul ou d'une violation de règle métier. Vous finissez par envoyer une erreur 'Internal Server Error' vague, ce qui est inutile pour le débogage et mauvais pour l'expérience utilisateur.

## Le problème des exceptions génériques
L'utilisation de `IllegalArgumentException` ou `RuntimeException` pour tout créer un 'bruit sémantique'. Quand on voit `throw new RuntimeException("État invalide")`, on ne sait pas quelle règle métier a été enfreinte sans lire le message texte. De plus, capturer une exception générique est risqué car vous pourriez masquer accidentellement une panne système critique en voulant gérer une simple validation métier.

## Définir des exceptions spécifiques au domaine
Les exceptions personnalisées permettent de catégoriser les erreurs. Au lieu d'une erreur vague, vous créez une classe comme `RequestAlreadyClosedException`. Cela indique précisément le problème. Dans un environnement Jakarta EE, ce sont généralement des exceptions non vérifiées qui héritent de `RuntimeException` pour ne pas encombrer les signatures de méthodes.

## Exemple concret : Approbation d'achat
Voici comment implémenter une exception personnalisée pour un flux d'achat :

```java
public class RequestAlreadyClosedException extends RuntimeException {
    public RequestAlreadyClosedException(Long id) {
        super("La demande d'achat " + id + " est déjà clôturée et ne peut être approuvée.");
    }
}

// Dans la couche Service
public void approveRequest(Long requestId) {
    PurchaseRequest request = repository.findById(requestId);
    if ("CLOSED".equals(request.getStatus())) {
        throw new RequestAlreadyClosedException(requestId);
    }
    request.setStatus("APPROVED");
}
```
Résultat : L'application distingue désormais un échec technique (base de données hors ligne) d'un échec métier (demande clôturée). Un `@ControllerAdvice` peut désormais capturer spécifiquement `RequestAlreadyClosedException` et retourner un code `400 Bad Request` au lieu d'un `500 Internal Server Error`.

## Erreur courante : Trop compter sur @Valid
Certains développeurs pensent que `@Valid` ou `@NotBlank` remplace les exceptions personnalisées. Si `@NotBlank` vérifie qu'une chaîne n'est pas vide, il ne peut pas vérifier si une demande d'achat est dans l'état correct pour être approuvée. La validation d'entrée gère la 'forme' des données ; les exceptions personnalisées gèrent la 'logique' métier.

## Exercice pratique
Créez une exception personnalisée nommée `InsufficientFundsException` pour une application d'achats lorsqu'un acheteur tente de commander un article qui dépasse le budget restant.

**Vérification :** Votre classe doit étendre `RuntimeException` et accepter le montant du budget en paramètre du constructeur pour fournir un message d'erreur détaillé.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
