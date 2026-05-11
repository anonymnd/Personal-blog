---
title: "Pourquoi avons-nous besoin des migrations de base de données ?"
description: "Une exploration de la manière dont les migrations de base de données résolvent le chaos des mises à jour manuelles du schéma dans le développement collaboratif."
pubDate: 2026-10-12T22:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous travaillez sur une application d'achats. Vous ajoutez une colonne `priority` à la table `PurchaseRequest` sur votre machine locale. Tout fonctionne. Vous envoyez le code à votre collègue, mais son application plante car sa base de données locale n'a pas cette colonne. Ce syndrome du « ça marche sur ma machine » est précisément la raison pour laquelle nous avons besoin des migrations.

## Le problème des mises à jour manuelles
Lorsque les développeurs exécutent manuellement des scripts SQL, des erreurs surviennent. Quelqu'un oublie un script, ou deux personnes modifient la même table différemment. Compter sur `hibernate.hbm2ddl.auto=update` est risqué en production car cela ne gère pas les changements complexes comme le renommage de colonnes sans risque de perte de données. Cela vérifie seulement la compatibilité du mapping, pas la sécurité de la transition.

## Le versionnage du schéma
Les migrations traitent le schéma comme du code. Des outils comme Flyway utilisent des scripts versionnés (ex: `V1__Create_Request_Table.sql`, `V2__Add_Priority_To_Request.sql`). Ces scripts sont stockés dans Git. Au démarrage, l'outil vérifie une table de métadonnées dans la base pour voir quelles versions ont été appliquées, puis exécute uniquement les nouveaux scripts dans l'ordre.

## Exemple concret : Logique d'approbation
Supposons que nous devions suivre qui a approuvé une demande d'achat. Au lieu de modifier la base manuellement, on crée un nouveau fichier de migration :

```sql
-- V3__Add_Approver_To_Request.sql
ALTER TABLE purchase_requests 
ADD COLUMN approved_by VARCHAR(255);
```

Lors du déploiement sur le serveur de staging, Flyway voit que `V1` et `V2` sont déjà faites et n'exécute que `V3`. Le résultat est un schéma cohérent partout sans intervention manuelle.

## Erreur courante : Modifier d'anciennes migrations
Une erreur fréquente consiste à modifier `V1__Create_Table.sql` après son déploiement en production. Les outils de migration utilisent des checksums pour garantir que les scripts n'ont pas changé. Si vous modifiez un ancien fichier, l'outil détectera un écart de checksum et refusera de démarrer l'application.

**Correction :** Ne modifiez jamais une migration déjà fusionnée. Créez plutôt une nouvelle version (ex: `V4`) pour appliquer la correction.

## Exercice pratique
Si vous devez renommer une colonne de `req_date` à `request_date` en production sans interruption, devez-vous modifier le script de création original ?

**Réponse :** Non. Vous devez créer un nouveau script de migration versionné pour renommer la colonne afin que tous les environnements restent synchronisés.
