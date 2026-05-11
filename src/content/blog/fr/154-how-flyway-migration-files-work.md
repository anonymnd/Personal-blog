---
title: "Comment fonctionnent les fichiers de migration Flyway"
description: "Une analyse approfondie du mécanisme de versionnage et du flux d'exécution des migrations de base de données Flyway."
pubDate: 2026-10-13T01:48:00.000Z
translationKey: 154-how-flyway-migration-files-work
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous travaillez en équipe et qu'un développeur ajoute une colonne 'statut' à la table des demandes d'achat, mais que votre base de données locale ne la possède pas. Au lancement, l'application plante car l'entité Java ne correspond plus au schéma. C'est ici que Flyway intervient en traitant les modifications de base de données comme du code versionné.

## Le mécanisme de versionnage
Flyway utilise une convention de nommage stricte. Un fichier de migration typique ressemble à `V1__Create_Request_Table.sql`. Le `V` indique une migration versionnée, le chiffre `1` est la version, et le double underscore `__` sépare la version de la description. Flyway crée une table de métadonnées nommée `flyway_schema_history` qui sert de registre pour savoir quels scripts ont été exécutés et quels étaient leurs checksums.

## Flux d'exécution et Checksums
Au démarrage, Flyway scanne le classpath et compare les fichiers trouvés avec la table `flyway_schema_history`. S'il trouve un fichier (ex: `V2__Add_Manager_Approval.sql`) absent de la table, il l'exécute une seule fois. Pour garantir l'intégrité, Flyway calcule un checksum (une empreinte unique) du contenu. Si vous modifiez `V1` après son déploiement en production, Flyway détectera un écart de checksum et bloquera le démarrage pour éviter des états incohérents.

## Exemple concret : Application d'achats
Supposons que nous devions faire évoluer le schéma d'un système d'achat :

**V1__Initial_Setup.sql**
```sql
CREATE TABLE procurement_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester VARCHAR(100)
);
```
**V2__Add_Approval_Column.sql**
```sql
ALTER TABLE procurement_requests ADD COLUMN manager_approved BOOLEAN DEFAULT FALSE;
```
**Résultat :** Au premier lancement, Flyway exécute V1 puis V2. Au redémarrage, Flyway voit que les deux sont déjà enregistrés et ne les exécute pas à nouveau.

## Erreur courante : Modifier d'anciens scripts
Une erreur classique consiste à modifier `V1` pour corriger une faute après que `V2` a été déployé. Cela provoque une erreur de checksum.
**Correction :** Ne modifiez jamais une migration versionnée déjà appliquée. Créez plutôt un nouveau fichier, `V3__Fix_Typo_In_Table.sql`, pour appliquer la correction.

## Exercice pratique
Si vous avez les fichiers `V1__init.sql` et `V2__update.sql` déjà appliqués, et que vous ajoutez `V1.5__extra.sql`, Flyway l'exécutera-t-il ?

**Réponse :** Non, par défaut Flyway ignore les migrations dont la version est inférieure à la dernière appliquée. Comme 1.5 est inférieur à 2, il sera ignoré sauf si l'option 'outOfOrder' est activée, mais il est fortement recommandé de garder des versions strictement croissantes (ex: V3) pour éviter toute confusion.
