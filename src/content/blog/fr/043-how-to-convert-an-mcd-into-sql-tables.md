---
title: "How to Convert an MCD Into SQL Tables"
description: "Apprenez le processus systématique de transformation d'un Modèle Conceptuel de Données (MCD) Merise en un schéma SQL relationnel."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 043-how-to-convert-an-mcd-into-sql-tables
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de débutants bloquent lors du passage d'un schéma conceptuel (MCD) aux tables SQL. L'erreur classique est de considérer chaque bulle comme une table et chaque trait comme une simple colonne, ce qui crée des redondances ou des pertes de données, surtout avec les cardinalités plusieurs-à-plusieurs.

## La Logique de Transformation
Pour convertir un MCD, il faut appliquer des règles strictes selon les cardinalités. Une entité devient systématiquement une table. Pour les relations, si la cardinalité est de 1:N (un-à-plusieurs), la clé primaire du côté '1' migre comme clé étrangère vers le côté 'N'. Si la relation est de N:N (plusieurs-à-plusieurs), la relation devient elle-même une 'table d'association'.

## Exemple d'une Application d'Achats
Imaginons un système où un **Demandeur** crée une **Demande**. Un Demandeur peut faire plusieurs Demandes, mais une Demande n'appartient qu'à un seul Demandeur (1:N). Par ailleurs, une Demande peut contenir plusieurs **Produits**, et un Produit peut figurer dans plusieurs Demandes (N:N).

1. **Demandeur** (Entité) $ightarrow$ Table `requesters` (id, nom)
2. **Demande** (Entité) $ightarrow$ Table `requests` (id, date, requester_id)
3. **Produit** (Entité) $ightarrow$ Table `products` (id, libelle, prix)
4. **Contenir** (Relation N:N) $ightarrow$ Table `request_items` (request_id, product_id, quantite)

## Extrait d'Implémentation SQL
```sql
CREATE TABLE requesters (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE requests (
    id INT PRIMARY KEY,
    request_date DATE,
    requester_id INT,
    FOREIGN KEY (requester_id) REFERENCES requesters(id)
);

CREATE TABLE request_items (
    request_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (request_id, product_id),
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Erreur Courante : Attributs de Relation
Une erreur fréquente consiste à placer la colonne 'quantité' dans la table `products` ou `requests`. Comme la quantité dépend à la fois de la demande et du produit, elle doit impérativement se trouver dans la table d'association (`request_items`).

## Exercice Pratique
**Scénario :** Un Manager approuve une Demande. Un Manager approuve plusieurs Demandes, mais une Demande est approuvée par un seul Manager. Comment modéliser cela en SQL ?

**Réponse :** Ajouter une clé étrangère `manager_id` dans la table `requests` pointant vers une nouvelle table `managers`.
