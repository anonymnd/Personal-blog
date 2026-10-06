---
title: "Qu'est-ce que Flyway ?"
description: "Un guide complet pour comprendre le contrôle de version des bases de données et la gestion des migrations avec Flyway."
pubDate: 2026-10-13T00:48:00.000Z
translationKey: 153-what-is-flyway
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous travaillez en équipe sur une application d'achats. Vous ajoutez une colonne 'status' à la table `purchase_requests` sur votre machine locale. Lorsque votre collègue récupère le code, son application plante car sa base de données locale n'a pas cette colonne. Partager manuellement des scripts SQL par chat ou e-mail est chaotique et source d'erreurs. C'est là que Flyway intervient en traitant les modifications de base de données comme du code source versionné.

## Le Mécanisme de Versionnage
Flyway gère les migrations via une table spéciale nommée `flyway_schema_history`. Au lieu d'un seul fichier SQL géant, vous créez de petits scripts numérotés (ex: `V1__Create_Request_Table.sql`, `V2__Add_Status_Column.sql`). Au démarrage de l'application, Flyway scanne le dossier des migrations et le compare à la table d'historique. Il n'exécute que les scripts qui n'ont pas encore été appliqués, garantissant que chaque environnement est synchronisé.

## Exemple Concret : Flux d'Achats
Supposons que nous devions faire évoluer notre schéma pour supporter les approbations des managers. Nous créons deux fichiers de migration :

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT
);
```

`V2__add_approval_column.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN manager_approval BOOLEAN DEFAULT FALSE;
```

**Résultat :** Flyway exécute V1, puis V2. Si vous déployez cela sur un serveur qui possède déjà V1, Flyway vérifie la checksum et n'exécute que V2.

## Erreur Courante : Modifier d'Anciens Scripts
Une erreur fréquente consiste à modifier `V1__init_schema.sql` après son déploiement en production. Flyway calcule une empreinte (checksum) pour chaque fichier. Si vous changez un seul caractère dans un script déjà appliqué, Flyway détectera un écart et refusera de démarrer l'application pour éviter toute incohérence.

**Correction :** Ne modifiez jamais une migration versionnée déjà déployée. Créez plutôt une nouvelle version (ex: `V3__Fix_Column_Name.sql`) pour appliquer le changement.

## Modèle Expand and Contract
Pour éviter les interruptions de service, utilisez l'approche 'expand and contract'. Au lieu de renommer une colonne (ce qui casserait l'application en cours), ajoutez d'abord la nouvelle colonne (expand), migrez les données, puis supprimez l'ancienne colonne dans une version ultérieure (contract).

## Exercice Pratique
**Scénario :** Vous devez ajouter une colonne `buyer_id` à la table `purchase_requests`. Quel doit être le nom du fichier si la dernière migration était `V5` ?

**Réponse :** `V6__Add_Buyer_Id_To_Requests.sql` (ou tout nom commençant par `V6__`).
