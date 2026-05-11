---
title: "Comment les équipes maintiennent le même schéma de base de données"
description: "Découvrez comment synchroniser les structures de base de données entre plusieurs environnements avec Flyway et le pattern expand/contract."
pubDate: 2026-10-13T07:48:00.000Z
translationKey: 160-how-teams-keep-the-same-database-schema
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Imaginez une équipe de cinq développeurs. Alice ajoute une colonne 'priorité' à la table des demandes sur son ordinateur. Quand Bob récupère le code, son application plante car sa base de données locale n'a pas cette colonne. Ce 'décalage de schéma' est un cauchemar dans les applications de gestion d'achats où la soumission d'un demandeur dépend d'une structure précise.

## Le mécanisme des migrations versionnées
Pour régler cela, les équipes utilisent des outils comme Flyway. Au lieu de partager des dumps SQL, elles écrivent des scripts de migration versionnés (ex: `V1__create_requests_table.sql`, `V2__add_priority_column.sql`). Flyway gère une table de métadonnées pour savoir quels scripts ont été exécutés. Au démarrage, Flyway vérifie les nouveaux fichiers et les lance dans l'ordre. Une fois appliqué, le checksum du script est enregistré ; modifier un script déjà exécuté provoquera une erreur pour éviter les incohérences.

## Exemple concret : Mise à jour des demandes d'achat
Supposons qu'on veuille remplacer la colonne `status` (texte) par un `status_id` pour le flux d'approbation du manager.

1. **V3__add_status_id.sql**: `ALTER TABLE requests ADD COLUMN status_id INT;`
2. **V4__migrate_data.sql**: `UPDATE requests SET status_id = 1 WHERE status = 'PENDING';`
3. **V5__drop_old_status.sql**: `ALTER TABLE requests DROP COLUMN status;`

Résultat : La base de données évolue par étapes sans perte de données et sans bloquer les utilisateurs.

## Le pattern Expand and Contract
Dans les systèmes à haute disponibilité, on ne peut pas couper l'appli. Le pattern 'Expand and Contract' évite les déploiements incompatibles. D'abord, on **étend** le schéma (ajout de colonne), on déploie le code qui écrit dans les deux colonnes, puis on **contracte** le schéma (suppression de l'ancienne colonne) une fois l'ancien code supprimé.

## Erreur courante : Modifier d'anciens scripts
Certains développeurs tentent de corriger une faute dans `V1__init.sql` après son déploiement en production. Cela crée une erreur de checksum.
**Correction** : Ne modifiez jamais une migration fusionnée. Créez une nouvelle version (ex: `V6__fix_typo.sql`) pour appliquer la correction.

## Exercice pratique
Si `V1` et `V2` sont appliqués, et que vous supprimez accidentellement `V1` de votre dossier projet, que fera Flyway au prochain démarrage ?

**Réponse** : Il échouera ou affichera un avertissement car l'historique en base de données ne correspond plus aux scripts présents.
