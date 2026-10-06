---
title: "@NotBlank, @NotNull et @Valid Expliqués"
description: "Apprenez à différencier les annotations de validation Jakarta pour garantir que votre API reçoit des données propres et attendues."
pubDate: 2026-10-10T09:48:00.000Z
translationKey: 090-notblank-notnull-and-valid-explained
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat où un demandeur soumet une requête. Vous remarquez que certaines requêtes arrivent avec des noms vides ou des descriptions nulles, provoquant des NullPointerException dans votre logique métier. Cela arrive souvent quand on utilise @NotNull alors qu'on a besoin de vérifier que le texte n'est pas simplement composé d'espaces.

## Comprendre les Contraintes

Bien qu'elles semblent similaires, @NotNull et @NotBlank ont des rôles distincts. @NotNull vérifie simplement que la référence n'est pas nulle. Elle accepte les chaînes vides (`""`) ou les chaînes contenant uniquement des espaces (`"  "`). À l'inverse, @NotBlank est plus stricte : elle garantit que la valeur n'est pas nulle et que sa longueur, après suppression des espaces, est supérieure à zéro. Elle est réservée aux types `CharSequence`.

## Le Rôle de @Valid

Contrairement aux deux précédentes, @Valid n'est pas une contrainte. C'est un déclencheur. Si vous avez un objet `PurchaseRequest` contenant un objet `User`, mettre @NotNull sur le champ User vérifie seulement si l'objet User existe. Pour demander à Spring de valider les champs internes de cet objet (comme le nom d'utilisateur), vous devez annoter le champ avec @Valid. C'est ce qu'on appelle la validation en cascade.

## Exemple Concret : Requête d'Achat

```java
public class PurchaseRequest {
    @NotBlank(message = "Le nom de l'article est requis")
    private String itemName;

    @NotNull(message = "La quantité ne peut pas être nulle")
    private Integer quantity;

    @Valid
    @NotNull
    private Requester requester;
}

public class Requester {
    @NotBlank
    private String employeeId;
}
```

Ici, si un utilisateur envoie `"itemName": " "`, @NotBlank détectera l'erreur. S'il envoie `"quantity": null`, @NotNull s'activera. Si l'objet `requester` est présent mais que l' `employeeId` à l'intérieur est vide, @Valid force la validation à descendre dans la classe Requester.

## Erreur Courante : Confusion avec la Base de Données

Une erreur fréquente est de croire que @NotBlank remplace les contraintes d'unicité de la base de données. La validation se fait au niveau applicatif. Si deux utilisateurs soumettent le même identifiant unique simultanément, la validation passera pour les deux ; seule une contrainte UNIQUE en base de données empêchera le doublon.

## Exercice Pratique

Quelle annotation utiliser pour un champ `String` qui doit contenir du texte réel et ne peut pas être composé uniquement d'espaces ? Comment s'assurer qu'un objet imbriqué est validé ?

**Réponse :** Utilisez @NotBlank pour le texte et @Valid sur le champ de l'objet imbriqué.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
