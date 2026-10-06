---
title: "Que signifient V1, V2 et V3 dans Flyway ?"
description: "Comprendre la convention de nommage et la logique d'exécution des migrations versionnées dans Flyway pour maintenir la cohérence de la base de données."
pubDate: 2026-10-13T02:48:00.000Z
translationKey: 155-what-do-v1-v2-and-v3-mean-in-flyway
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous avez déjà déployé la première version, mais vous devez maintenant ajouter une colonne 'statut' à la table `purchase_requests` pour que les managers puissent les approuver. Si vous modifiez simplement votre schéma local et le poussez, votre base de données de production plantera car elle n'aura pas cette colonne. C'est là qu'intervient le versionnage de Flyway.

## La logique de versionnage
Dans Flyway, `V1`, `V2` et `V3` sont des préfixes pour les scripts de migration. Le 'V' signifie Version. Flyway utilise ces numéros pour déterminer l'ordre d'exécution. Il suit les scripts déjà exécutés dans une table spéciale appelée `flyway_schema_history`. Au démarrage de l'application, Flyway scanne les scripts, les compare à la table d'historique et exécute uniquement les nouvelles versions par ordre croissant.

## Fonctionnement des migrations versionnées
Les migrations versionnées sont immuables. Une fois que `V1__Create_Request_Table.sql` est exécuté sur un serveur, vous ne devez plus jamais modifier son contenu. Si vous devez modifier la table, vous créez `V2__Add_Status_Column.sql`. Flyway calcule une somme de contrôle (checksum) pour chaque fichier ; si vous modifiez `V1` après son application, Flyway signalera une erreur de checksum et arrêtera l'application pour éviter toute divergence du schéma.

## Exemple concret : Flux d'achats
Supposons que nous devions faire évoluer notre schéma :

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (id INT PRIMARY KEY, item VARCHAR(255));
```
`V2__add_approval_flow.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
```
`V3__add_buyer_info.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id INT;
```
**Résultat :** Flyway exécute V1, puis V2, puis V3. Si un nouveau développeur arrive, sa base locale exécutera les trois scripts dans l'ordre pour correspondre à l'état de la production.

## Erreur courante : Modifier d'anciens scripts
Un développeur se rend compte qu'il a oublié une colonne dans `V1` et modifie le fichier `V1__init_schema.sql`.
**Correction :** Ne modifiez jamais une migration déjà déployée. Créez plutôt `V4__Add_Missing_Column.sql`. Cela garantit que tous les environnements migrent vers l'avant de manière cohérente.

## Exercice pratique
Vous avez appliqué `V1` et `V2`. Vous devez ajouter un timestamp `created_at` à votre table. Comment devez-vous nommer le fichier, et que se passe-t-il si vous le nommez `V1.5` ?

**Réponse :** Nommez-le `V3__Add_Timestamp.sql`. Utiliser `V1.5` est techniquement possible si votre configuration le permet, mais la pratique standard utilise des entiers pour éviter la confusion et assurer un historique linéaire clair.
