---
title: "Qu'est-ce qu'un ORM ?"
description: "Un guide pour débutants pour comprendre le Mapping Objet-Relationnel et comment il relie les objets Java aux tables PostgreSQL."
pubDate: 2026-10-12T06:48:00.000Z
translationKey: 135-what-is-an-orm
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. En Java, vous avez un objet `PurchaseRequest` avec une liste d'articles. Dans PostgreSQL, vous avez une table `requests` et une table `request_items`. Le problème est que Java raisonne en objets et en graphes, tandis que PostgreSQL raisonne en lignes et en relations. Écrire manuellement du SQL pour mapper chaque champ d'un résultat vers un objet Java est fastidieux et source d'erreurs.

## Le pont entre deux mondes
Un Object-Relational Mapper (ORM) est une technique qui vous permet d'interroger et de manipuler des données d'une base de données en utilisant un paradigme orienté objet. Au lieu d'écrire du SQL brut pour chaque opération, vous interagissez avec des objets Java, et l'ORM gère la traduction en SQL. Dans l'écosystème Java, JPA (Jakarta Persistence API) est la spécification (les règles), et Hibernate est l'implémentation la plus populaire (le moteur) qui effectue le travail.

## Fonctionnement concret
Dans un ORM, une classe Java est mappée à une table de base de données. Pour notre application d'achats, une entité `PurchaseRequest` serait annotée avec `@Entity`. Lorsque vous enregistrez cet objet, l'ORM génère automatiquement une instruction `INSERT`.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    private String requesterName;
    private Double totalAmount;
    // Getters et setters
}
```
Si vous appelez `repository.save(request)`, Hibernate traduit cela en : `INSERT INTO purchase_request (requester_name, total_amount) VALUES (?, ?);`.

## L'erreur classique : Le problème N+1
Une erreur fréquente chez les débutants est d'ignorer la manière dont les données sont chargées. Si une `PurchaseRequest` possède plusieurs entités `Item` (One-to-Many), JPA utilise par défaut le chargement LAZY. Si vous bouclez sur 10 demandes et accédez à leurs articles, l'ORM peut exécuter 1 requête pour les demandes, puis 10 requêtes séparées pour les articles. C'est le problème N+1. La solution n'est pas de tout passer en EAGER, mais d'utiliser une requête "JOIN FETCH" pour tout récupérer en une seule fois.

## Tableau Récapitulatif
| Concept | Approche SQL | Approche ORM |
| :--- | :--- | :--- |
| Récupération | `SELECT * FROM ...` | `repository.findById(id)` |
| Insertion | `INSERT INTO ...` | `entityManager.persist(object)` |
| Relations | Clés étrangères | Références d'objets |

## Exercice Pratique
Si vous avez une entité `User` et une entité `Profile` où un utilisateur a un seul profil, quelle annotation JPA utiliseriez-vous sur le champ `Profile` dans la classe `User` pour les lier ?

**Réponse :** `@OneToOne`.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
