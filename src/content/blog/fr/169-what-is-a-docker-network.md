---
title: "Qu'est-ce qu'un réseau Docker ?"
description: "Une introduction à la manière dont les conteneurs Docker communiquent entre eux et avec l'extérieur via des réseaux virtuels."
pubDate: 2026-10-13T16:48:00.000Z
translationKey: 169-what-is-a-docker-network
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une application d'achat où le frontend doit envoyer une demande à une API backend, et cette API doit communiquer avec une base de données PostgreSQL. Si ceux-ci sont dans des conteneurs séparés, ils sont isolés par défaut. Vous ne pouvez pas simplement utiliser 'localhost' car chaque conteneur possède son propre espace réseau ; 'localhost' à l'intérieur d'un conteneur désigne uniquement lui-même.

## Le Concept d'Isolation des Conteneurs
Docker utilise des namespaces réseau pour garantir que les conteneurs n'interfèrent pas entre eux. Par défaut, un conteneur est placé sur un réseau 'bridge'. Il s'agit d'un pont logiciel qui permet aux conteneurs sur le même hôte de communiquer tout en restant isolés du réseau physique de l'hôte, sauf si des ports spécifiques sont mappés.

## Réseaux Bridge vs Host
La plupart des utilisateurs utilisent le pilote `bridge`. Il crée un réseau interne privé. Si vous avez besoin qu'un conteneur partage directement la pile réseau de l'hôte (sans isolation), vous utilisez le réseau `host`. Cependant, le mode bridge est privilégié pour la sécurité.

## Communication Inter-Conteneurs avec Compose
Avec Docker Compose, Docker crée automatiquement un réseau pour vos services. Au lieu de suivre des adresses IP, qui changent à chaque redémarrage, vous utilisez le nom du service comme nom d'hôte.

```yaml
services:
  db:
    image: postgres
  api:
    image: procurement-api
    depends_on:
      - db
```
Dans cette configuration, le conteneur `api` contacte la base de données via le nom d'hôte `db` sur le port `5432`.

## Mappage de Ports : Hôte vs Conteneur
Pour accéder à un conteneur depuis votre navigateur, vous mappez un port de l'hôte vers un port du conteneur. Par exemple, `-p 5332:5432` signifie que le trafic arrivant sur votre machine au port 5332 est redirigé vers le port 5432 du conteneur.

## Erreur Courante : Le Piège du Localhost
Une erreur fréquente consiste à tenter de se connecter à une base de données via `localhost:5432` dans le code de l'API. Comme l'API est dans son propre conteneur, elle cherche la DB dans son propre environnement et échoue.
**Correction :** Utilisez le nom du service (ex: `db:5432`) pour la communication interne.

## Exercice Pratique
Si vous avez deux conteneurs sur le même réseau bridge nommés `web` et `app`, et que `app` écoute sur le port 8080, comment `web` appelle-t-il l'API de `app` ?

**Réponse :** En envoyant une requête à `http://app:8080`.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
