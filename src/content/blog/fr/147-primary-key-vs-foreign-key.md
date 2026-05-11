---
title: "Primary Key vs Foreign Key"
description: "Comprendre la différence fondamentale entre l'identification unique et la liaison relationnelle dans la conception de bases de données."
pubDate: 2026-10-12T18:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous avez une table pour les `Requests` (demandes) et une table pour les `Users` (utilisateurs). Si vous n'utilisez que les noms, vous aurez des problèmes dès que deux employés nommés 'Ahmed' rejoindront l'entreprise. Vous ne pourrez pas savoir qui a soumis quelle demande. C'est là que la distinction entre Primary Key (PK) et Foreign Key (FK) devient cruciale.

## La Primary Key : L'identifiant unique
Une Primary Key (Clé Primaire) est une colonne (ou un ensemble de colonnes) qui identifie de manière unique chaque ligne d'une table. Dans PostgreSQL, il s'agit souvent d'une colonne `id` utilisant `SERIAL` ou `UUID`. Une PK doit être unique et ne peut pas contenir de valeurs NULL. Elle garantit que chaque enregistrement est distinct, agissant comme une empreinte numérique.

## La Foreign Key : Le pont relationnel
Une Foreign Key (Clé Étrangère) est une colonne dans une table qui fait référence à la Primary Key d'une autre table. Elle crée un lien entre les deux. Alors qu'une PK identifie un enregistrement, une FK établit une relation. Par exemple, la table `Requests` n'a pas besoin de stocker le nom complet de l'utilisateur ; elle a seulement besoin du `user_id` (la FK) qui pointe vers la PK de la table `Users`.

## Exemple concret : Flux d'achats
Considérons ces deux définitions de table simplifiées :

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE requests (
    request_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT REFERENCES users(user_id)
);
```
Si l'utilisateur 101 (Ahmed) demande un 'Ordinateur', la table `requests` aura une ligne où `request_id` est 5001 et `requester_id` est 101. La base de données empêche l'ajout d'une demande pour un `requester_id` 999 si cet utilisateur n'existe pas dans la table `users`.

## Erreur courante : Confusion sur l'unicité
Une erreur fréquente consiste à penser qu'une Foreign Key doit être unique. C'est faux. Dans une relation un-à-plusieurs (un utilisateur, plusieurs demandes), le `requester_id` dans la table `requests` se répétera souvent. Seule la Primary Key de sa propre table doit être unique.

## Exercice pratique
Scénario : Vous avez une table `Products` et une table `Orders`. Quelle colonne doit être la Foreign Key dans la table `Orders` pour la lier à un produit spécifique ?

**Réponse :** La colonne `product_id` dans la table `Orders` doit être la Foreign Key référençant la Primary Key `product_id` de la table `Products`.

## Pour approfondir

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
