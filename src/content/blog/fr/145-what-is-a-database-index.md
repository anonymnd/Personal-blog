---
title: "Qu'est-ce qu'un index de base de données ?"
description: "Un guide simple pour comprendre comment les index accélèrent la récupération des données et les compromis associés."
pubDate: 2026-10-12T16:48:00.000Z
translationKey: 145-what-is-a-database-index
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous cherchiez une demande d'achat spécifique dans une archive physique de 10 000 dossiers. Sans guide, vous devez vérifier chaque dossier un par un—c'est ce que les bases de données appellent un 'Full Table Scan'. C'est lent et inefficace. Un index de base de données est comme l'index alphabétique à la fin d'un livre ; il indique à la base de données exactement où se trouvent les données pour qu'elle puisse y accéder directement.

## Fonctionnement du mécanisme
Un index est une structure de données distincte (généralement un B-Tree) qui stocke les valeurs d'une colonne spécifique et un pointeur vers la ligne réelle dans la table. Au lieu de parcourir toute la table, la base de données recherche dans l'index, qui est trié, lui permettant de trouver l'emplacement des données en une fraction du temps. Si cela accélère la lecture, cela ralentit légèrement l'écriture (INSERT, UPDATE, DELETE) car l'index doit aussi être mis à jour.

## Exemple concret : Application d'achats
Considérons une table `procurement_requests` avec les colonnes `id`, `requester_name` et `status`. Si vous exécutez souvent cette requête :

```sql
SELECT * FROM procurement_requests WHERE requester_name = 'Alice';
```

Sans index, PostgreSQL scanne chaque ligne. En créant un index :

```sql
CREATE INDEX idx_requester_name ON procurement_requests(requester_name);
```

La base de données crée une liste triée des noms. En cherchant 'Alice', elle effectue une recherche rapide dans l'index, trouve le pointeur et récupère la ligne instantanément.

## Erreur courante : Le sur-indexage
Une erreur fréquente consiste à ajouter des index sur toutes les colonnes pour 'tout rendre rapide'. C'est contre-productif. Comme chaque index consomme de l'espace disque et ralentit les opérations d'écriture, trop d'index peuvent dégrader les performances de saisie de données de votre application.

**Correction :** Indexez uniquement les colonnes fréquemment utilisées dans les clauses `WHERE`, les conditions de `JOIN` ou les instructions `ORDER BY`.

## Exercice pratique
Vous avez une table `orders` avec 1 million de lignes. Vous filtrez souvent par `order_date`. Quelle commande utiliseriez-vous pour optimiser cela, et quel est le compromis ?

**Réponse :** Utilisez `CREATE INDEX idx_order_date ON orders(order_date);`. Le compromis est une accélération des requêtes SELECT mais un léger ralentissement des INSERT et UPDATE pour la table `orders`.

## Pour approfondir

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
