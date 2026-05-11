---
title: "J'ai enfin compris ce qu'est une migration de base de données"
description: "Un guide conceptuel pour comprendre comment les migrations gèrent l'évolution du schéma sans perte de données."
pubDate: 2026-10-17T22:48:00.000Z
translationKey: 271-i-finally-understand-what-a-database-migration-is
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une application d'achat où les employés soumettent des demandes. Au début, votre table `PurchaseRequest` ne contient qu'une `description` et un `amount`. Un mois plus tard, votre manager exige que chaque demande ait un `department_id` pour suivre les budgets. Si vous modifiez simplement votre entité Java et redémarrez l'application, la base de données plantera car la table SQL réelle n'a pas cette colonne. C'est précisément là qu'interviennent les migrations.

## Le Concept de Versionnage
Je pensais que les migrations étaient juste des 'mises à jour'. Je réalise maintenant qu'il s'agit d'un contrôle de version pour votre schéma. Au lieu de partager un énorme fichier `.sql` avec vos collègues, vous partagez une série de petits scripts numérotés. Chaque script représente une transition de la version A vers la version B. La base de données utilise une table de métadonnées (comme `flyway_schema_version`) pour savoir quels scripts ont déjà été exécutés.

## Fonctionnement du Mécanisme
Au démarrage, l'outil de migration scanne un dossier spécifique. Il compare les fichiers trouvés (ex: `V1__init.sql`, `V2__add_dept.sql`) avec la table de métadonnées. Si la table indique que la DB est en version 1, mais que le code contient la version 2, l'outil exécute automatiquement le script `V2` avant que l'application ne soit totalement opérationnelle.

## Exemple Concret : Suivi des Départements
Supposons que nous devions ajouter `department_id` à notre table d'achats. Nous créons un fichier de migration :

```sql
-- V2__Add_Department_To_Requests.sql
ALTER TABLE purchase_requests 
ADD COLUMN department_id BIGINT NOT NULL DEFAULT 1;
```
Résultat : Chaque demande existante est affectée au département 1, et les nouvelles demandes nécessitent désormais un ID de département. L'application démarre sans erreur car l'entité Java et la table SQL sont synchronisées.

## Erreur Courante : Modifier d'Anciens Scripts
Une erreur fréquente consiste à modifier `V1__init.sql` après son déploiement en production. Comme l'outil voit que `V1` a déjà été exécuté, il ignore les modifications. Pour corriger cela, il ne faut jamais modifier une migration partagée ; créez plutôt un nouveau fichier, `V3__Fix_Init_Table.sql`.

## Exercice Pratique
Scénario : Vous devez renommer la colonne `amount` en `total_price` dans la table `purchase_requests`. Quelle est la bonne approche ?

**Réponse :** Créer un nouveau fichier de migration (ex: `V4__Rename_Amount.sql`) contenant `ALTER TABLE purchase_requests RENAME COLUMN amount TO total_price;` au lieu de modifier le script de création original.
