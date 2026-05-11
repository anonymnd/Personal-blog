---
title: "Comment les changements de schéma de base de données atteignent la production"
description: "Un guide sur la gestion des évolutions de base de données via les migrations versionnées et le pattern expand/contract."
pubDate: 2026-10-13T03:48:00.000Z
translationKey: 156-how-database-schema-changes-reach-production
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous mettiez à jour une application d'achats. Vous devez renommer la colonne `request_status` en `approval_state` dans la table `PurchaseRequests`. Si vous renommez simplement la colonne et déployez le code, l'ancienne version de l'application encore active pendant le déploiement plantera car elle cherchera l'ancien nom, alors que la nouvelle version cherchera le nouveau. C'est tout le défi des migrations de base de données.

## Le mécanisme des migrations versionnées
Pour résoudre cela, des outils comme Flyway utilisent des migrations versionnées. Au lieu d'exécuter manuellement des scripts SQL, vous créez des fichiers nommés `V1__init.sql`, `V2__add_column.sql`, etc. Flyway gère une table `schema_version`. Au démarrage, il vérifie quels scripts ont été exécutés. Si `V2` est absent, il l'exécute une seule fois. Il utilise des checksums pour garantir que une fois appliquée, une migration reste immuable ; pour corriger une erreur, il faut créer une `V3`.

## Le pattern Expand and Contract
Pour éviter les interruptions de service, on utilise le pattern 'Expand and Contract' (Expansion et Contraction). Au lieu d'un changement destructif, on suit trois étapes :
1. **Expand** : Ajouter la nouvelle colonne `approval_state` tout en gardant `request_status`. L'app écrit dans les deux.
2. **Migrate** : Transférer les données existantes de l'ancienne vers la nouvelle colonne.
3. **Contract** : Une fois que toutes les instances sont à jour, on supprime `request_status`.

## Exemple concret : Ajout d'un ID Acheteur
Supposons que nous devions lier une `PurchaseRequest` à un `Buyer` spécifique.

**Migration V3__add_buyer_id.sql** :
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id BIGINT;
-- Note : On le laisse nullable pour éviter de bloquer la table
```
**Résultat** : La base de données supporte maintenant le nouveau champ sans casser les requêtes existantes. Le code applicatif est ensuite mis à jour.

## Erreur courante : Modifier d'anciennes migrations
Certains développeurs tentent de modifier `V1__init.sql` pour corriger une faute après le déploiement. Cela provoque une erreur de checksum, et Flyway refusera de démarrer l'application.
**Correction** : Créez toujours un nouveau script versionné (ex: `V4__fix_typo.sql`) pour modifier un schéma existant.

## Exercice pratique
Vous avez une table `orders` et voulez changer une colonne `VARCHAR` en `TEXT`. En utilisant le pattern expand/contract, quelle est la première action SQL à effectuer ?

**Réponse** : Ajouter une nouvelle colonne de type `TEXT` (Expand) plutôt que de modifier directement la colonne existante.
