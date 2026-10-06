---
title: "Que se passe-t-il lorsqu'une migration échoue ?"
description: "Comprendre les conséquences d'un échec de migration de base de données et comment rétablir l'état du schéma avec Flyway."
pubDate: 2026-10-13T04:48:00.000Z
translationKey: 157-what-happens-when-a-migration-fails
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous déployez une mise à jour pour une application d'achats. Vous avez ajouté une migration pour créer une table `purchase_orders`, mais à mi-chemin du script, une erreur de syntaxe survient. Soudain, votre application refuse de démarrer et vous voyez une erreur 'Migration failed' dans les logs. Vous vous demandez : la table a-t-elle été créée ? La base de données est-elle corrompue ?

## Examiner d'abord l'échec réel
Arrêtez la livraison et identifiez l'instruction, l'erreur et la version concernées. Comparez le schéma réel à l'historique Flyway sans supposer que tout est intact. Les migrations suivantes ne peuvent normalement pas dépasser un échec non résolu. Un échec lors du démarrage empêche souvent cette instance applicative de devenir prête ; il ne restaure pas automatiquement le reste du système.
## Échec transactionnel ou état partiel
Pour une migration PostgreSQL exécutée dans une transaction, le DDL transactionnel ordinaire et les changements d'historique peuvent être annulés ensemble. Aucune ligne d'échec persistante n'est alors nécessairement présente et la version peut rester en attente. Avec une base ou des instructions hors transaction, certains changements peuvent subsister avec une entrée d'échec. PostgreSQL possède aussi des instructions non transactionnelles, comme CREATE INDEX CONCURRENTLY. Examinez la base, le SQL et la configuration Flyway avant la récupération.
## Exemple : une instruction rejetée
```sql
-- V2__add_orders.sql: deliberately invalid teaching example
CREATE TABLE purchase_orders (id INT PRIMARY KEY);
ALTER TABLE purchase_orders ADDD COLUMN status VARCHAR(50);
```

La seconde instruction contient volontairement la faute ADDD. Dans une migration PostgreSQL ordinaire entièrement transactionnelle, la nouvelle table est aussi annulée. Si cette version n'a jamais réussi dans un environnement partagé, corrigez ADD COLUMN puis relancez depuis l'état inchangé vérifié. Si elle a réussi ailleurs, conservez la migration canonique appliquée et examinez les différences de données ou d'environnement au lieu de réécrire l'historique de livraison.
## Réparer l'historique après le schéma
Flyway repair entretient l'historique. Il peut retirer les entrées d'échec et réconcilier certaines métadonnées ; il n'annule pas le SQL, ne supprime pas les tables restantes, n'exécute pas les instructions manquantes et ne transforme pas un script échoué en exécution réussie. Réconciliez d'abord les changements partiels par une procédure de récupération testée. Utilisez les mêmes emplacements de migrations pour repair, puis migration et validation selon le cas. Ne falsifiez pas une ligne d'historique et ne masquez pas une migration appliquée puis modifiée.
## Exercice pratique
Une migration non transactionnelle a créé une table puis échoué. Repair seul restaure-t-il le schéma précédent ?

**Réponse :** Non. Examinez et réconciliez d'abord le schéma partiel selon la procédure de récupération prévue. Repair peut ensuite retirer l'entrée d'échec pour permettre une nouvelle exécution vérifiée. Après un rollback transactionnel propre sans entrée d'échec, cette réparation d'historique peut être inutile.

## Pour approfondir

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
