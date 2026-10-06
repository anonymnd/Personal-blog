---
title: "Quand une API doit-elle retourner un code 400 ?"
description: "Apprenez à différencier les erreurs de syntaxe client des échecs de logique métier dans les API REST."
pubDate: 2026-10-10T17:48:00.000Z
translationKey: 098-when-should-an-api-return-400
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une requête, mais le serveur la rejette. L'API doit-elle retourner un code 400 Bad Request ou un 422 Unprocessable Entity ? Beaucoup de développeurs utilisent le 400 pour tout, ce qui empêche le client de savoir si le JSON était mal formé ou si les données étaient logiquement invalides.

## Le rôle du 400 Bad Request
Le code 400 indique que le serveur ne peut pas traiter la requête en raison d'une erreur client. Cela concerne spécifiquement la *syntaxe* ou la *forme* de la requête. Si le JSON est mal formé, qu'un champ obligatoire manque ou qu'une chaîne de caractères est envoyée à la place d'un entier, le 400 est le choix correct.

## Validation d'entrée vs Logique métier
Il est essentiel de séparer la validation de la forme des règles de gestion. Par exemple, avec Jakarta Bean Validation, `@NotNull` vérifie l'existence d'un champ, tandis que `@NotBlank` vérifie qu'une chaîne n'est pas vide. Ce sont des contrôles structurels. En revanche, vérifier si un demandeur a le budget suffisant pour un achat est une *règle métier*. Bien que certains utilisent le 400, le code 422 est plus précis pour les erreurs sémantiques.

## Exemple concret : Requête d'achat
Considérons une requête pour créer un bon de commande :

```java
public class PurchaseRequest {
    @NotBlank
    private String itemDescription;
    
    @NotNull
    @Min(1)
    private Integer quantity;
}
```

Si le client envoie `{"quantity": 0}`, la contrainte `@Min(1)` est violée. L'API retourne un **400 Bad Request** car l'entrée ne respecte pas le contrat structurel. Si le client envoie une requête valide mais que l'article est interdit par la politique de l'entreprise, c'est une erreur de domaine, pas un 400.

## Erreur courante : Se fier uniquement à @Valid
Une erreur fréquente est de croire que `@Valid` empêche toutes les données erronées. `@Valid` déclenche la validation en cascade, mais ne remplace pas les contraintes d'unicité de la base de données. Si deux utilisateurs soumettent le même ID simultanément, la validation passe, mais la base de données lèvera une exception. Vous devez capturer cela pour éviter un 500 Internal Server Error.

## Exercice pratique
Scénario : Un client envoie un corps JSON où un champ de date est formaté comme "5 Janvier" au lieu de "2024-01-05". Quel code de statut l'API doit-elle retourner ?

**Réponse :** 400 Bad Request, car le format des données (syntaxe) est incorrect pour le type attendu.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
