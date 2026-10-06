---
title: "Pourquoi @ElementCollection crée une autre table"
description: "Comprendre comment JPA gère les collections de types basiques et pourquoi elles nécessitent une table de base de données distincte."
pubDate: 2026-10-12T13:48:00.000Z
translationKey: 142-why-elementcollection-creates-another-table
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achat où une `PurchaseRequest` peut avoir plusieurs étiquettes (comme 'Urgent', 'Matériel-IT', 'Fournitures). Vous pourriez penser qu'il est possible de stocker ces valeurs dans une seule colonne, mais en utilisant `@ElementCollection` avec JPA, vous remarquerez que Hibernate génère automatiquement une seconde table dans PostgreSQL. Cela déroute souvent les débutants qui s'attendent à une solution à table unique.

## Le mécanisme des collections d'éléments
Dans JPA, `@ElementCollection` est utilisé pour des collections de types basiques (String, Integer) ou d'objets `@Embeddable`. Contrairement à une relation `@OneToMany`, les éléments d'une collection d'éléments n'ont pas leur propre identité (pas de clé primaire propre). Ils dépendent entièrement de l'entité parente. Comme les bases de données relationnelles comme PostgreSQL ne peuvent pas stocker une liste de valeurs dans une seule colonne standard, Hibernate crée une 'table de collection' pour maintenir la normalisation.

## Exemple concret : Étiquettes de demande d'achat
Considérons une entité `PurchaseRequest`. Nous voulons stocker une liste de tags pour chaque demande.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    
    private String description;

    @ElementCollection
    @CollectionTable(name = "request_tags", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> tags = new ArrayList<>();
}
```

**Résultat :** Hibernate crée deux tables : `purchase_request` (id, description) et `request_tags` (request_id, tags). Si la demande #1 a les tags 'Urgent' et 'IT', la table `request_tags` contiendra deux lignes : `(1, 'Urgent')` et `(1, 'IT')`.

## Erreur courante : Traiter les éléments comme des entités
Une erreur fréquente consiste à essayer de mettre à jour un seul élément de la collection en appelant un setter sur la valeur elle-même. Comme ce sont des types basiques, ils n'ont pas d'ID. Pour modifier un tag, vous devez supprimer l'ancienne valeur de la liste et ajouter la nouvelle.

**Correction :** Au lieu de chercher un objet spécifique à modifier, utilisez `request.getTags().remove(oldTag);` puis `request.getTags().add(newTag);`.

## Exercice pratique
Si vous avez une entité `User` avec une `@ElementCollection` de `phoneNumbers`, et que vous ajoutez trois numéros à un utilisateur avec l'ID 5, combien de lignes sont ajoutées à la table des numéros de téléphone ?

**Réponse :** Trois lignes sont ajoutées, partageant toutes la même clé étrangère (user_id = 5).

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
