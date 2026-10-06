---
title: "@ManyToMany Explained"
description: "Un guide complet pour modéliser les relations plusieurs-à-plusieurs avec JPA et Hibernate dans un environnement PostgreSQL."
pubDate: 2026-10-12T11:48:00.000Z
translationKey: 140-manytomany-explained
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez un système d'achats où une seule Demande d'Achat peut contenir plusieurs Articles, et qu'un Article spécifique (comme un 'Ordinateur') peut apparaître dans plusieurs Demandes d'Achat. Si vous essayez d'utiliser une simple clé étrangère dans une table, vous réaliserez vite qu'elle ne peut pas stocker une liste d'identifiants. C'est là que l'annotation `@ManyToMany` devient indispensable.

## Fonctionnement du Mécanisme
Dans une base de données relationnelle comme PostgreSQL, une relation plusieurs-à-plusieurs ne peut pas exister directement entre deux tables. Elle nécessite une 'Table de Jonction'. Cette troisième table stocke des paires de clés étrangères : l'une pointant vers la Demande et l'autre vers l'Article. JPA abstrait cette complexité. Lorsque vous marquez deux entités avec `@ManyToMany`, Hibernate gère automatiquement cette table de jonction.

## Exemple Concret : App d'Achats
Voici comment implémenter la relation entre `PurchaseRequest` et `Item`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "request_items",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<Item> items = new ArrayList<>();
}

@Entity
public class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @ManyToMany(mappedBy = "items")
    private List<PurchaseRequest> requests = new ArrayList<>();
}
```
Ici, `PurchaseRequest` est le propriétaire de la relation. Si vous ajoutez un `Item` à la liste `items` et sauvegardez la demande, Hibernate insère un enregistrement dans la table `request_items`.

## Erreur Courante : La Synchronisation Bidirectionnelle
Une erreur fréquente consiste à ne mettre à jour qu'un seul côté de la relation dans le code Java. Par exemple, appeler `request.getItems().add(item)` mais oublier `item.getRequests().add(request)`. Bien qu'Hibernate puisse sauvegarder les données en base, les objets en mémoire (JVM) seront incohérents, provoquant des bugs logiques.

## Note sur la Performance
Par défaut, `@ManyToMany` utilise `FetchType.LAZY`. Cela signifie que les articles ne sont chargés que lorsque vous appelez `.getItems()`. Évitez de tout passer en `EAGER` pour régler une `LazyInitializationException`, car cela pourrait charger des milliers d'enregistrements inutiles et ralentir l'application.

## Exercice Pratique
**Tâche :** Vous avez une entité `User` et une entité `Role`. Un utilisateur peut avoir plusieurs rôles, et un rôle peut appartenir à plusieurs utilisateurs. Quelle entité doit avoir l'attribut `mappedBy` pour que `User` soit le propriétaire ?

**Réponse :** L'entité `Role` doit avoir `mappedBy = "roles"` (en supposant que le champ dans `User` s'appelle `roles`) pour que `User` soit le propriétaire.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
