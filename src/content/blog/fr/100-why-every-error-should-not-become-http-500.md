---
title: "Pourquoi chaque erreur ne doit pas devenir une HTTP 500"
description: "Apprenez à distinguer les erreurs client des pannes serveur pour améliorer la fiabilité et la sécurité de vos API."
pubDate: 2026-10-10T19:48:00.000Z
translationKey: 100-why-every-error-should-not-become-http-500
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Un demandeur soumet une requête, mais oublie de remplir la quantité. Si votre serveur plante et renvoie une erreur générique 'Internal Server Error 500', l'utilisateur ne sait pas quoi corriger, et vos logs sont pollués par des alertes qui ressemblent à des pannes critiques.

## La signification du code HTTP 500
L'erreur HTTP 500 est un filet de sécurité pour les défaillances serveur imprévues, comme une perte de connexion à la base de données. Utiliser un code 500 pour une simple erreur de saisie masque la cause réelle et empêche vos outils de monitoring de différencier un bug du code d'une erreur de manipulation utilisateur.

## Validation vs Éligibilité Métier
Toutes les erreurs ne se valent pas. La validation de la forme des données (ex: `@NotBlank` pour vérifier qu'un champ n'est pas vide) doit renvoyer un 400 Bad Request. En revanche, l'éligibilité métier—comme un manager tentant d'approuver une demande déjà clôturée—est une erreur de domaine qui devrait renvoyer un 422 Unprocessable Entity ou un 409 Conflict.

## Exemple concret : Demande d'achat
Lors de la soumission d'une demande, si l'utilisateur saisit un prix négatif, la validation `@Positive` se déclenche. Si l'utilisateur n'a pas le budget suffisant, c'est la logique métier qui intervient.

```java
// Extrait illustratif d'un gestionnaire d'exceptions
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorDto> handleValidation(MethodArgumentNotValidException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto("Entrée invalide"));
}

@ExceptionHandler(InsufficientBudgetException.class)
public ResponseEntity<ErrorDto> handleBudget(InsufficientBudgetException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new ErrorDto(ex.getMessage()));
}
```
Résultat : L'utilisateur reçoit un 400 pour les fautes de frappe et un 422 pour les problèmes de budget, tandis que le serveur ne logue des 500 que pour les crashs réels.

## Erreur courante : L'exposition des Stack Traces
Certains développeurs laissent la page d'erreur par défaut afficher toute la trace Java (stack trace) au client. C'est une faille de sécurité qui révèle la structure de vos packages. Mappez toujours vos exceptions vers un DTO propre contenant uniquement un message et un identifiant de corrélation.

## Exercice pratique
Quel code de statut renvoyer si un acheteur tente de commander un article qui vient d'être supprimé par un autre admin (concurrence) ?

**Réponse :** HTTP 409 Conflict, car la requête est syntaxiquement correcte mais entre en conflit avec l'état actuel du serveur.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
