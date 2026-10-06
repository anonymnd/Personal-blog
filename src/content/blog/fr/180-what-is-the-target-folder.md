---
title: "Qu'est-ce que le dossier target ?"
description: "Un guide essentiel pour comprendre où Maven stocke le code compilé et les artefacts de construction."
pubDate: 2026-10-14T03:48:00.000Z
translationKey: 180-what-is-the-target-folder
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Vous venez d'écrire votre première classe Java dans un projet Maven, vous lancez le build, et soudain, un dossier nommé `target` apparaît. Vous vous demandez peut-être si vous l'avez créé par erreur ou s'il s'agit d'un fichier système à ignorer. Ce dossier est le cœur du cycle de vie de Maven, mais pour les débutants, il ressemble souvent à une 'boîte noire' où le code disparaît pour laisser place aux binaires.

## Le rôle du répertoire Target
Dans Maven, il existe une séparation stricte entre le code source (situé dans `src`) et la sortie générée. Le dossier `target` est la destination désignée pour tout ce que Maven produit pendant le processus de construction. Au lieu d'encombrer vos répertoires sources avec des fichiers `.class`, Maven les isole ici. Cela garantit que votre système de contrôle de version (comme Git) ne suit que votre logique, et non les artefacts générés par la machine.

## Le contenu du dossier Target
Lorsque vous exécutez une commande comme `mvn package`, Maven remplit ce dossier avec plusieurs sous-répertoires :
- `classes` : Contient les fichiers `.class` compilés de votre application principale.
- `test-classes` : Contient le code compilé de vos tests unitaires.
- `surefire-reports` : Où sont stockés les résultats de vos tests unitaires.
- `failsafe-reports` : Où sont conservés les résultats des tests d'intégration.
- Le fichier JAR ou WAR final : L'application empaquetée prête pour le déploiement.

## Exemple concret : Une application d'achats
Imaginez une application de gestion d'achats où un `Requester` soumet une `PurchaseRequest`. Vous écrivez le code dans `src/main/java`. Lorsque vous lancez `mvn compile`, Maven traduit vos fichiers `.java` en bytecode.

**Résultat :** Vous trouverez `target/classes/com/app/PurchaseRequest.class`. Si vous lancez ensuite `mvn package`, un fichier tel que `procurement-app-1.0.jar` apparaît à la racine du dossier `target`. C'est ce JAR que vous déployez réellement sur un serveur.

## Erreur courante : Modifications manuelles
Une erreur fréquente consiste à essayer de corriger un bug en modifiant un fichier à l'intérieur du dossier `target`. Comme ce dossier est temporaire, toute modification effectuée ici sera définitivement supprimée la prochaine fois que vous exécuterez `mvn clean` ou `mvn compile`. Modifiez toujours les fichiers dans `src`.

## Exercice pratique
**Question :** Quelle commande Maven supprime complètement le dossier `target` pour garantir une reconstruction propre à partir de zéro ?

**Réponse :** `mvn clean`. Cela supprime tout le répertoire, forçant Maven à recompiler chaque classe.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
