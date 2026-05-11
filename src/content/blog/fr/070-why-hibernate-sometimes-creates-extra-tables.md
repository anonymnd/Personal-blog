---
title: "Pourquoi Hibernate crée parfois des tables supplémentaires"
description: "Comprendre comment les stratégies de mapping des collections et de l'héritage entraînent la création automatique de tables de jointure."
pubDate: 2026-10-09T13:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous avez défini une relation `@ManyToMany` simple dans votre code Java, mais en vérifiant votre base de données, vous découvrez une troisième table que vous n'avez jamais créée explicitement. On a souvent l'impression qu'Hibernate agit de manière autonome, mais ces tables 'supplémentaires' sont en réalité le mécanisme utilisé pour résoudre les exigences de mapping relationnel.

## Le mécanisme de la table de jointure
Dans une base de données relationnelle, une relation plusieurs-à-plusieurs ne peut pas être stockée comme une simple colonne dans l'une des deux tables principales. Pour éviter la duplication des données et maintenir la normalisation, Hibernate crée une 'Join Table'. Cette table sert de pont, contenant uniquement les clés primaires des deux entités qu'elle connecte. Si vous utilisez `@ManyToMany` sans spécifier l'annotation `@JoinTable`, Hibernate en génère une automatiquement selon une convention de nommage par défaut : `Entity1_Entity2`.

## Stratégies de mapping de l'héritage
Une autre cause courante est la stratégie `@Inheritance`. Si vous utilisez `InheritanceType.JOINED`, Hibernate crée une table de base pour la classe parente et des tables distinctes pour chaque sous-classe. Chaque table de sous-classe contient uniquement les champs spécifiques de cet enfant et une clé étrangère pointant vers le parent. Bien que ce soit propre pour la normalisation, cela produit plus de tables que ce que votre hiérarchie de classes ne suggère initialement.

## Exemple concret : Application d'achats
Imaginez un système d'achats où une `PurchaseRequest` peut avoir plusieurs `Item`s, et un `Item` peut appartenir à plusieurs demandes.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany
    private List<Item> items;
}

@Entity
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
```

**Résultat :** Hibernate crée trois tables : `purchase_request`, `item`, et une table de jointure cachée nommée `purchase_request_items`. Cette troisième table gère les liens entre les demandes et les articles.

## Erreur courante : Abus du ManyToMany
Les développeurs utilisent souvent `@ManyToMany` alors qu'un `@OneToMany` avec une colonne de jointure suffirait. Cela crée des tables de jointure inutiles qui ralentissent les requêtes.

**Correction :** Si la relation est réellement un-à-plusieurs (ex: une demande a plusieurs lignes de commande, mais une ligne appartient à une seule demande), utilisez `@OneToMany` et `@ManyToOne`. Cela stocke la clé étrangère directement dans la table enfant, supprimant le besoin de la table pont.

## Exercice pratique
Si vous avez une entité `User` et une entité `Role` avec une relation `@ManyToMany`, et que vous voulez que la table de jointure s'appelle `user_roles` au lieu du nom par défaut, quelle annotation devez-vous ajouter ?

**Réponse :** Ajoutez `@JoinTable(name = "user_roles")` au-dessus du champ de collection dans l'entité.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
