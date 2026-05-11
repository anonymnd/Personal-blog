---
title: "Database Constraints vs Application Validation"
description: "Apprenez à équilibrer la validation des entrées en Java et les contraintes d'intégrité en base de données pour éviter la corruption des données."
pubDate: 2026-10-10T11:48:00.000Z
translationKey: 092-database-constraints-vs-application-validation
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat où un demandeur soumet une requête. Vous ajoutez une vérification dans votre code Java pour vous assurer que le `requestAmount` n'est pas négatif. Tout fonctionne lors des tests, mais dans un environnement de production à fort trafic, deux requêtes simultanées pourraient contourner votre logique, ou un script SQL direct pourrait insérer des données invalides.

## Le Rôle de la Validation Applicative
La validation applicative, souvent implémentée avec Jakarta Bean Validation (`jakarta.validation.constraints`), sert de première ligne de défense. Elle garantit que la forme de l'entrée est correcte avant même que la logique métier ne commence. Par exemple, l'utilisation de `@NotBlank` sur le nom d'un demandeur garantit que la chaîne n'est ni nulle ni composée uniquement d'espaces. Attention : `@NotNull` ne rejette pas les chaînes vides ; il vérifie uniquement l'absence de valeur nulle.

## La Nécessité des Contraintes de Base de Données
Bien que les vérifications Java soient rapides, elles ne peuvent garantir l'intégrité face aux requêtes concurrentes (race conditions). Si vous avez une règle stipulant qu'une `requestReference` doit être unique, un test Java comme `if (repository.exists(ref))` est insuffisant. Deux threads pourraient interroger la base de données à la même milliseconde, constater que la référence n'existe pas, et tous deux l'insérer. Une contrainte `UNIQUE` au niveau de la base de données est le seul moyen d'empêcher absolument ce doublon.

## Exemple Concret : Requête d'Achat
Considérons une entité de requête où le `amount` doit être positif et le `requestCode` unique.

```java
public class PurchaseRequest {
    @NotBlank(message = "Le code est requis")
    private String requestCode;

    @NotNull
    @Positive(message = "Le montant doit être supérieur à zéro")
    private BigDecimal amount;
    // getters et setters
}
```

Dans le schéma de la base de données :
```sql
CREATE TABLE purchase_requests (
    id BIGINT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) CHECK (amount > 0)
);
```
Résultat : L'annotation `@Positive` renvoie une erreur conviviale à l'utilisateur instantanément. La contrainte `CHECK` empêche les données erronées via des scripts SQL. La contrainte `UNIQUE` bloque les doublons lors de conditions de concurrence.

## Erreur Courante : Se fier uniquement à @Valid
Certains développeurs pensent que `@Valid` remplace les contraintes de base de données. `@Valid` déclenche simplement la validation en cascade des champs ; il ne verrouille pas la base de données et ne vérifie pas l'unicité globale. Si vous supprimez la contrainte `UNIQUE` car vous avez un test Java, vous finirez par trouver des doublons dans vos tables.

## Exercice Pratique
Scénario : Vous devez vous assurer qu'un `managerEmail` est fourni et n'est pas vide. Quelle combinaison est la meilleure ?

Réponse : Utilisez `@NotBlank` en Java pour un retour utilisateur immédiat et une contrainte `NOT NULL` en base de données pour garantir l'intégrité.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
