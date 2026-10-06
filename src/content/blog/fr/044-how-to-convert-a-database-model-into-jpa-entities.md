---
title: "Comment Convertir un Modèle de Base de Données en Entités JPA"
description: "Apprenez le processus systématique de transformation d'un schéma de base de données conceptuel en entités Java Persistence API via un exemple d'application d'achat."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs hésitent lors du passage d'un diagramme ER visuel au code Java, devinant souvent où placer les annotations `@OneToMany` ou `@ManyToMany`. La difficulté réside dans la traduction des cardinalités relationnelles en références orientées objet sans créer de boucles de dépendances circulaires.

## Mapper les Entités de Base
Chaque table de votre modèle physique devient une classe Java annotée avec `@Entity`. La clé primaire est marquée par `@Id`. Pour une application d'achat, une entité `Request` représente la table principale. Utilisez les imports `jakarta.persistence.*` pour respecter les standards modernes. Chaque colonne devient un champ privé avec ses getters et setters.

## Gérer les Relations One-to-Many
Dans un système d'achat, un `Manager` peut approuver plusieurs `Requests`. Dans la base de données, cela se traduit par une clé étrangère dans la table `Request`. En JPA, l'entité `Request` est le 'côté propriétaire' car elle détient la clé étrangère. Utilisez `@ManyToOne` côté `Request` et `@OneToMany(mappedBy = "manager")` côté `Manager` pour créer un lien bidirectionnel.

## Résoudre le Many-to-Many avec des Entités de Jointure
Si une `Request` peut contenir plusieurs `Products` et qu'un `Product` peut figurer dans plusieurs `Requests`, un `@ManyToMany` simple peut suffire. Cependant, si vous devez suivre la 'quantité' de chaque produit par demande, vous devez créer une entité `RequestItem`. Cela transforme la relation plusieurs-à-plusieurs en deux relations un-à-plusieurs, permettant à l'entité de jointure de stocker des attributs supplémentaires.

## Exemple Concret : Flux d'Achat
Considérons une `Request` et un `Buyer`.

```java
@Entity
public class Request {
    @Id @GeneratedValue
    private Long id;
    private String description;

    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private Buyer buyer;
}

@Entity
public class Buyer {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "buyer")
    private List<Request> assignedRequests;
}
```
Résultat : La table `Request` contient une colonne `buyer_id`, tandis que l'objet `Buyer` peut accéder à toutes ses demandes via une liste.

## Erreur Courante : L'oubli du mappedBy
Une erreur fréquente est l'omission de l'attribut `mappedBy` dans les relations bidirectionnelles. Sans cela, JPA considère qu'il y a deux relations indépendantes et tentera de créer une table de jointure inutile dans la base de données.

## Exercice Pratique
Scénario : Un `Department` possède plusieurs `Employees`. Comment mappez-vous le côté `Employee` de cette relation ?

Réponse : Utilisez `@ManyToOne` dans l'entité `Employee` avec un `@JoinColumn(name = "dept_id")`.
