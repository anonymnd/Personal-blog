---
title: "Pourquoi les développeurs utilisent Docker"
description: "Une exploration de la manière dont Docker résout le problème du 'ça marche sur ma machine' en isolant les environnements via des conteneurs."
pubDate: 2026-10-13T08:48:00.000Z
translationKey: 161-why-developers-use-docker
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous venez de terminer une application de gestion des achats où un demandeur soumet une requête. Tout fonctionne sur votre ordinateur, mais dès le déploiement sur le serveur de test, l'application plante car le serveur utilise Java 11 alors que vous avez développé en Java 17. Cette incohérence est la raison principale pour laquelle les développeurs utilisent Docker.

## Le mécanisme : Image vs Conteneur
Docker permet d'emballer votre application et ses dépendances dans un modèle en lecture seule appelé **Image**. Lorsqu'on exécute cette image, elle devient un **Conteneur**. Contrairement à une machine virtuelle (VM) qui embarque un système d'exploitation complet, un conteneur Linux partage le noyau (kernel) de l'hôte. Cela rend les conteneurs légers et rapides. Sur Windows ou Mac, Docker Desktop utilise une petite VM Linux pour fournir ce noyau.

## Combler le fossé des environnements
En définissant tout dans un `Dockerfile`, vous garantissez que chaque développeur et chaque serveur utilise le même environnement. Si votre application nécessite PostgreSQL, vous ne demandez pas à la nouvelle recrue de l'installer manuellement ; vous fournissez une configuration qui lance la version exacte requise.

## Exemple concret : Application de procurement
Considérons une configuration où une application Java se connecte à une base de données via un fichier `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    ports:
      - "5532:5432"
  app:
    build: .
    depends_on:
      - db
```
Ici, la machine hôte accède à la base via le port `5532`, mais à l'intérieur du réseau Docker, l'application contacte la base via le nom de service `db` sur le port `5432`.

## Erreur courante : La confusion du Localhost
Une erreur fréquente consiste à tenter de se connecter à `localhost:5432` depuis le conteneur `app` pour joindre le conteneur `db`. Dans Docker, `localhost` désigne l'espace réseau du conteneur lui-même, pas l'hôte ni les autres conteneurs.

**Correction :** Utilisez le nom du service défini dans Compose (ex: `jdbc:postgresql://db:5432/procurement`).

## Exercice pratique
Si vous voulez entrer dans un conteneur en cours d'exécution pour vérifier un fichier de log, quelle commande devez-vous utiliser ?

**Réponse :** `docker exec -it <container_id> sh` (ou `bash`), où `-it` permet l'interaction via un terminal.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
