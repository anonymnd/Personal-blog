---
title: "Où doit se situer la validation dans une application Backend ?"
description: "Un guide pour séparer la validation du format, l'éligibilité métier et les contraintes de base de données pour créer des systèmes robustes."
pubDate: 2026-10-10T08:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une requête pour 100 ordinateurs. La requête arrive sous forme d'objet JSON. Si le champ `quantity` est manquant ou est une chaîne de caractères au lieu d'un nombre, le système plante. Si la quantité est de -5, c'est logiquement impossible. Si le demandeur a déjà épuisé son budget annuel, la requête est inadmissible. Chacun de ces échecs se produit à une couche différente.

## Validation du Format d'Entrée
La première ligne de défense est la couche API. C'est là que l'on vérifie si les données ont la 'bonne forme'. En Java avec Jakarta Bean Validation, on utilise des annotations comme `@NotNull` ou `@NotBlank`. Il est important de noter que `@NotNull` vérifie seulement si la référence est nulle ; elle n'écartera pas une chaîne vide. Pour les chaînes, `@NotBlank` est indispensable. L'utilisation de `@Valid` dans un contrôleur déclenche une validation en cascade des champs avant même que le code n'entre dans votre méthode de service.

## Validation de l'Éligibilité Métier
Une fois le format validé, il faut vérifier si l'action est autorisée. Cela se passe dans la Couche Service. Pour notre application d'achats, le service vérifie si le demandeur a assez de budget. Ce n'est pas un problème de 'forme'—le nombre 100 est un entier valide—mais c'est une violation métier. Ces vérifications doivent lever des exceptions de domaine personnalisées que l'API traduira en messages d'erreur clairs, sans exposer les traces de pile (stack traces).

## Contraintes de Base de Données et Concurrence
Même avec des vérifications de service parfaites, deux requêtes peuvent frapper le serveur à la même milliseconde. Si un utilisateur tente de créer deux requêtes avec le même identifiant unique, la couche service pourrait considérer les deux comme 'valides' car aucune n'existe encore en base. C'est pourquoi les contraintes d'unicité en base de données sont obligatoires. Elles servent de filet de sécurité final contre les conditions de concurrence.

## Exemple Concret : Demande d'Achat

```java
public class PurchaseRequest {
    @NotBlank // Vérifie que ce n'est ni null ni vide
    private String itemCode;

    @NotNull // Vérifie que le champ existe
    @Min(1)   // Vérifie que le nombre est positif
    private Integer quantity;
}

// Logique de la Couche Service
public void processRequest(PurchaseRequest req) {
    if (budgetService.isExceeded(req.getUserId())) {
        throw new BudgetExceededException("Budget insuffisant");
    }
    repository.save(req);
}
```

**Résultat :** Une requête avec un `itemCode` nul est rejetée immédiatement par l'API (400 Bad Request). Une requête pour 100 ordinateurs par un utilisateur avec 0€ de budget est rejetée par le Service (422 Unprocessable Entity).

## Erreur Courante : Trop compter sur @Valid
Certains développeurs pensent que `@Valid` remplace toutes les vérifications. Pourtant, `@Valid` ne peut pas interroger la base de données ni vérifier des règles métier complexes.
**Correction :** Utilisez `@Valid` pour la syntaxe et une méthode de Service pour l'état et l'éligibilité.

## Exercice Pratique
À quelle couche doit-on vérifier si un `username` existe déjà en base de données : le Contrôleur (via `@Valid`) ou la couche Service ?

**Réponse :** La couche Service (et finalement la contrainte d'unicité de la DB), car cela nécessite une lecture en base, ce qui est une règle métier et non une validation de format.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
