---
title: "Comment deux conteneurs communiquent"
description: "Un guide pour débutants sur la mise en réseau interne et la découverte de services entre conteneurs Docker."
pubDate: 2026-10-13T17:48:00.000Z
translationKey: 170-how-two-containers-communicate
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une application d'achat où un backend Java gère les demandes et une base de données PostgreSQL stocke les données. Vous lancez les deux conteneurs, mais quand le backend tente de se connecter à `localhost:5432`, cela échoue. Cela arrive parce que chaque conteneur possède son propre espace réseau isolé ; `localhost` à l'intérieur du conteneur backend se réfère à lui-même, et non au conteneur de base de données ou à la machine hôte.

## Le rôle des réseaux Docker
Pour permettre aux conteneurs de communiquer, ils doivent être sur le même réseau virtuel. Par défaut, Docker Compose crée un réseau unique pour tous les services définis dans le fichier `docker-compose.yml`. Ce réseau dispose d'un serveur DNS intégré qui permet aux conteneurs de se trouver via leurs noms de service plutôt que par des adresses IP instables.

## La découverte de services en pratique
Lorsque le conteneur backend envoie une requête à `db:5432`, le DNS interne de Docker résout `db` en l'adresse IP privée du conteneur de base de données. Il est crucial de distinguer le port interne (utilisé pour la communication entre conteneurs) du port publié (utilisé pour l'accès depuis l'hôte).

## Exemple concret : Application d'achat
Voici un extrait de `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres
    ports:
      - "5432:5432"
  backend:
    image: procurement-api
    environment:
      - DB_URL=jdbc:postgresql://db:5432/orders
```

Dans cette configuration, le `backend` se connecte à la base de données via `db:5432`. Si vous utilisiez `localhost:5432` dans `DB_URL`, la connexion serait refusée car le backend chercherait PostgreSQL à l'intérieur de son propre conteneur.

## Erreur courante : Confusion des ports
Une erreur fréquente consiste à croire que le mappage de port hôte (ex: `8080:80`) est nécessaire pour la communication interne. Si le backend doit joindre la base de données, il utilise le port interne `5432`, que vous l'ayez exposé sur l'hôte ou non. Le mappage `5432:5432` sert uniquement à vos outils externes (comme pgAdmin) installés sur votre bureau.

## Exercice pratique
Si vous avez deux services nommés `web` et `cache` dans un fichier Compose, et que `cache` écoute sur le port 6379, quelle URL le service `web` doit-il utiliser pour se connecter au cache ?

**Réponse :** `cache:6379`

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
