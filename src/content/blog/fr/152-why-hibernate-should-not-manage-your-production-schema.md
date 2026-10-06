---
title: "Pourquoi Hibernate ne doit pas gérer votre schéma de production"
description: "Découvrez pourquoi l'utilisation de hbm2ddl.auto en production est risquée et comment passer aux migrations versionnées avec Flyway."
pubDate: 2026-10-12T23:48:00.000Z
translationKey: 152-why-hibernate-should-not-manage-your-production-schema
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez le déploiement d'une nouvelle version de votre application d'achats. Vous avez ajouté un champ 'priorité' à l'entité `PurchaseRequest`. Vous redémarrez le serveur et, soudainement, l'application plante ou, pire, supprime une table à cause d'un conflit de mapping. C'est le risque quand on laisse `ddl-auto` de Hibernate gérer le schéma en production.

## Le danger de ddl-auto

Hibernate propose la propriété `hibernate.hbm2ddl.auto` avec des options comme `update` ou `create-drop`. Si `update` semble pratique, il est non déterministe. Il tente de deviner les modifications nécessaires en fonction des entités Java. En production, cela manque de traçabilité. Vous ne savez pas exactement quel SQL a été exécuté et vous ne pouvez pas revenir en arrière facilement si la mise à jour automatique échoue.

## Passer aux migrations versionnées

Au lieu de laisser l'ORM deviner, utilisez un outil comme Flyway. Flyway utilise des scripts SQL versionnés (ex: `V1__init.sql`, `V2__add_priority.sql`) qui s'exécutent dans un ordre strict. Chaque script est enregistré dans une table de métadonnées avec un checksum. Si un script est modifié après application, Flyway génère une erreur, garantissant que tous les environnements sont identiques.

## Exemple concret : Ajouter une colonne

Supposons que votre application doive suivre qui a approuvé une demande. Au lieu de laisser Hibernate faire un `update`, vous créez un fichier de migration :

```sql
-- V3__add_approver_to_request.sql
ALTER TABLE purchase_request ADD COLUMN approved_by VARCHAR(255);
```

Au démarrage, Flyway vérifie la table de schéma, voit que la version 3 n'est pas appliquée, et exécute le SQL. Le résultat est un changement prévisible. Pour empêcher Hibernate d'intervenir, réglez `hibernate.hbm2ddl.auto=validate`. Cela vérifie la compatibilité sans modifier la base.

## Erreur courante : Modifier d'anciens scripts

Une erreur classique est de modifier `V1__init.sql` pour ajouter une colonne alors que le script a déjà été exécuté en production. Flyway détectera un changement de checksum et bloquera le démarrage.

**Correction :** Ne modifiez jamais une migration appliquée. Créez toujours un nouveau fichier versionné (ex: `V4__fix_column.sql`).

## Exercice pratique

Pour s'assurer que la base de production correspond aux entités sans permettre à Hibernate de modifier les tables, quelle valeur de `ddl-auto` faut-il utiliser ?

**Réponse :** `validate`.
