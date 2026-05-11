---
title: "Que signifie 5332:5432 ?"
description: "Une analyse détaillée du mappage de ports Docker pour comprendre comment votre machine hôte communique avec une application conteneurisée."
pubDate: 2026-10-13T12:48:00.000Z
translationKey: 165-what-does-5332-5432-mean
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous venez de lancer un conteneur PostgreSQL avec Docker. Vous tentez de connecter votre interface de gestion de base de données à `localhost:5432`, mais vous recevez une erreur 'Connection Refused', alors que les logs indiquent que la base de données fonctionne parfaitement. Le problème vient généralement d'une mauvaise compréhension de l'option `-p 5332:5432`.

## La division Hôte vs Conteneur
Les conteneurs Docker s'exécutent dans leur propre espace réseau isolé. Cela signifie que le conteneur possède sa propre adresse IP interne et son propre ensemble de ports. Si une base de données à l'intérieur d'un conteneur écoute sur le port 5432, elle écoute sur le localhost *du conteneur*, et non sur celui de votre ordinateur. Pour atteindre ce service de l'extérieur, vous devez créer un pont.

## Décoder la syntaxe
La syntaxe `port_hôte:port_conteneur` agit comme une règle de routage. Dans l'exemple `5332:5432` :
- **5332 (Port Hôte) :** C'est le port que vous ouvrez sur votre machine physique. Lorsque vous demandez à votre application de se connecter à `localhost:5332`, Docker intercepte ce trafic.
- **5432 (Port Conteneur) :** C'est le port sur lequel l'application écoute réellement à l'intérieur du conteneur. Docker redirige le trafic du port 5332 vers ce port interne.

## Exemple concret : Application d'achats
Imaginez un système d'achats où un `request-service` doit enregistrer des données dans un conteneur PostgreSQL. Dans votre fichier `docker-compose.yml`, vous définissez :

```yaml
services:
  db:
    image: postgres
    ports:
      - "5332:5432"
```

**Résultat :** 
1. Si vous utilisez un outil comme pgAdmin sur votre bureau, vous vous connectez à `localhost:5332`.
2. Si un autre conteneur du même réseau veut parler à la DB, il utilise le nom du service `db:5432` (en ignorant totalement le port hôte).

## Erreur courante : Inversion de l'ordre
Une erreur fréquente est d'écrire `5432:5332`. Cela indique à Docker de prendre le trafic du port 5432 de votre machine et de l'envoyer vers le port 5332 à l'intérieur du conteneur. Comme PostgreSQL écoute sur le 5432 en interne, la connexion échouera car rien n'écoute sur le 5332 dans le conteneur.

## Exercice pratique
Si vous voulez lancer un serveur web qui écoute en interne sur le port 80, mais que vous avez déjà un autre site sur le port 80 de votre machine, comment mapperiez-vous les ports pour accéder au conteneur via `localhost:8080` ?

**Réponse :** Utilisez `-p 8080:80`.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
