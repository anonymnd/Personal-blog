---
title: "Comment concevoir une réponse d'erreur API cohérente"
description: "Apprenez à créer une structure d'erreur standardisée pour aider les développeurs frontend à déboguer sans exposer les détails internes du serveur."
pubDate: 2026-10-10T16:48:00.000Z
translationKey: 097-how-to-design-a-consistent-api-error-response
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez un développeur frontend appelant votre API. Pour une erreur de validation, il reçoit une simple chaîne de caractères ; pour une erreur de base de données, une trace de pile HTML massive ; et pour un échec de logique métier, un corps vide. Cette incohérence oblige le client à écrire des blocs 'if-else' fragiles pour chaque point de terminaison afin d'afficher un simple message d'erreur.

## L'anatomie d'une réponse standard
Pour corriger cela, vous avez besoin d'un DTO de réponse d'erreur dédié. Une réponse cohérente doit toujours contenir un code lisible par la machine, un message lisible par l'humain et une liste optionnelle d'erreurs spécifiques aux champs. Cela garantit que, que l'erreur soit une 400 Bad Request ou une 422 Unprocessable Entity, la forme du JSON reste identique.

## Implémentation du modèle d'erreur
Dans un environnement Jakarta EE, vous pouvez définir un record pour contenir ces détails. Cette structure sépare l'erreur générale des échecs de validation spécifiques, comme lorsqu'un utilisateur soumet une chaîne vide à un champ marqué `@NotBlank`.

```java
public record ApiError(String code, String message, List<FieldError> details) {}
public record FieldError(String field, String reason) {}
```

## Exemple concret : Demande d'achat
Considérons une application d'approvisionnement où un demandeur soumet une demande d'achat. Si le demandeur tente de soumettre une demande avec un montant négatif, l'API ne doit pas simplement planter. Elle doit retourner un statut 400 avec ce corps :

```json
{
  "code": "VALIDATION_FAILED",
  "message": "La requête contient des données invalides",
  "details": [
    { "field": "amount", "reason": "Le montant doit être supérieur à zéro" }
  ]
}
```
Si la requête est valide mais que le manager a déjà rejeté l'article (erreur d'éligibilité métier), l'API renvoie un statut 422 avec le code `ITEM_ALREADY_REJECTED`.

## Erreur courante : Fuite d'informations internes
Une erreur fréquente consiste à passer `exception.getMessage()` directement au client. Si une contrainte d'unicité de base de données est violée, le client pourrait voir `SQLIntegrityConstraintViolationException`, ce qui révèle la structure de vos tables. Au lieu de cela, capturez l'exception et mappez-la vers un code `CONFLICT` générique.

## Exercice pratique
Créez une réponse JSON pour un scénario où un acheteur tente de commander un article en rupture de stock. Utilisez un statut 409 Conflict.

**Vérification :** La réponse doit avoir un `code` tel que `OUT_OF_STOCK`, un `message` clair et une liste `details` vide ou nulle, car il s'agit d'une erreur de domaine et non d'une erreur de validation de champ.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
