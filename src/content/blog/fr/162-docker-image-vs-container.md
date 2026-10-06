---
title: "Docker Image vs Container"
description: "Comprendre la différence fondamentale entre une image Docker statique et une instance de conteneur en cours d'exécution."
pubDate: 2026-10-13T09:48:00.000Z
translationKey: 162-docker-image-vs-container
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez une recette de gâteau. La recette vous indique exactement les ingrédients nécessaires et les étapes à suivre, mais vous ne pouvez pas manger la recette elle-même. Pour avoir réellement un gâteau, vous devez suivre ces instructions pour créer une instance physique. Dans l'univers Docker, la recette est l'Image, et le gâteau est le Conteneur.

## L'Image Statique
Une image est un modèle en lecture seule. Elle contient tout ce dont votre application a besoin pour fonctionner : le code, le runtime, les bibliothèques et les variables d'environnement. Les images sont construites par couches ; si vous modifiez une ligne de code et reconstruisez, Docker ne met à jour que la couche affectée. Comme les images sont immuables, elles garantissent que le même environnement est déployé partout.

## Le Conteneur Actif
Un conteneur est une instance exécutable d'une image. Lorsque vous lancez `docker run`, Docker ajoute une fine couche de lecture-écriture au-dessus de l'image statique. Cela permet à l'application d'écrire des logs ou de créer des fichiers temporaires sans modifier l'image originale. Alors qu'une image est stockée sur le disque, un conteneur existe en mémoire et utilise le noyau Linux de l'hôte, ce qui le rend bien plus léger qu'une machine virtuelle.

## Exemple Pratique : App de Procurement
Supposons que nous ayons une application de gestion d'achats où un demandeur soumet une requête. Nous créons une image `procurement-app:v1`.

```bash
# Construire l'image statique
docker build -t procurement-app:v1 .

# Lancer deux conteneurs distincts à partir de la même image
docker run -d --name requester-instance procurement-app:v1
docker run -d --name manager-instance procurement-app:v1
```
Ici, les deux conteneurs partagent la même image de base, mais fonctionnent indépendamment. Si le `manager-instance` plante, le `requester-instance` reste actif car ce sont des instances séparées.

## Erreur Courante : Confusion sur l'État
Une erreur fréquente consiste à penser que les données enregistrées dans un conteneur persistent après sa suppression. Comme la couche de lecture-écriture du conteneur est éphémère, tout fichier créé pendant l'exécution est perdu. Pour conserver des données, il faut utiliser des volumes, car l'image elle-même ne peut pas être modifiée pendant l'exécution.

## Exercice Rapide
Si vous modifiez le code de votre application et reconstruisez l'image, est-ce que les conteneurs en cours d'exécution sont mis à jour automatiquement ?

**Réponse :** Non. Les conteneurs sont des instances de la version de l'image qui existait au moment de leur démarrage. Vous devez arrêter les anciens conteneurs et en lancer de nouveaux avec l'image mise à jour.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
