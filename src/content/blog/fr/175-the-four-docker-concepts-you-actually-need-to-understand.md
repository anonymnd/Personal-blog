---
title: "The Four Docker Concepts You Actually Need to Understand"
description: "Un guide pratique pour maîtriser les images, les conteneurs, le réseau et les volumes sans se perdre dans l'écosystème Docker."
pubDate: 2026-10-13T22:48:00.000Z
translationKey: 175-the-four-docker-concepts-you-actually-need-to-understand
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de débutants galèrent avec Docker parce qu'ils le traitent comme une Machine Virtuelle (VM). Ils passent des heures à essayer de se 'connecter' à un serveur qui n'existe pas ou se demandent pourquoi les données de leur base disparaissent après un simple redémarrage. La confusion vient souvent du fait qu'on confond le plan avec le bâtiment.

## Images vs Conteneurs
Une Image est un modèle en lecture seule. Voyez cela comme un instantané figé de votre application et de ses dépendances. Un Conteneur est l'instance vivante et active de cette image. Si vous avez une image `postgres`, vous pouvez lancer cinq conteneurs distincts ; chacun sera indépendant, mais tous proviennent du même plan.

## Le Noyau Hôte et la Virtualisation
Contrairement à une VM qui embarque tout un système d'exploitation, les conteneurs Docker partagent le noyau Linux de l'hôte. C'est ce qui les rend légers. Sur Windows ou Mac, Docker Desktop lance en réalité une petite VM Linux en arrière-plan pour fournir ce noyau.

## Réseau et Mapping de Ports
Les conteneurs vivent dans leur propre espace réseau. Quand vous voyez `-p 5332:5432`, vous mappez le port 5332 de votre machine physique vers le port 5432 du conteneur.

Attention : `localhost` à l'intérieur d'un conteneur désigne le conteneur lui-même, pas votre PC. Dans une application de gestion d'achats, le `requester-service` ne peut pas joindre le `db-service` via `localhost`. Il doit utiliser le nom du service défini dans Docker Compose.

```yaml
# Extrait illustratif de docker-compose.yml
services:
  db-service:
    image: postgres
    ports:
      - "5332:5432"
  requester-service:
    build: .
    environment:
      - DB_URL=jdbc:postgresql://db-service:5432/procure
```

## Persistance avec les Volumes Nommés
Les conteneurs sont éphémères. Si vous supprimez un conteneur, les données internes disparaissent. Les volumes nommés règlent ce problème en liant un dossier de l'hôte à un dossier du conteneur. Attention, un volume n'est pas une sauvegarde ; si vous faites `docker compose down -v`, le volume est supprimé.

## Accès Interactif
Pour déboguer un conteneur actif, utilisez `docker exec -it <container_id> sh`. Le `-i` maintient l'entrée standard ouverte et le `-t` alloue un terminal virtuel, vous permettant d'exécuter des commandes comme si vous y étiez connecté.

**Erreur courante :** Tenter de se connecter à une base via `localhost:5432` depuis un autre conteneur.
**Correction :** Utilisez le nom du service (ex: `db-service:5432`) pour la communication interne.

**Exercice :** Vous avez un conteneur qui tourne sur le port 8080 à l'intérieur, mais vous voulez y accéder via le port 9000 sur votre navigateur. Quel est le flag de mapping correct ?
**Réponse :** `-p 9000:8080`

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
