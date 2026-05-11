---
title: "J'ai enfin compris pourquoi Docker crée des ports différents"
description: "Une analyse approfondie de la différence conceptuelle entre les ports du conteneur et les ports de l'hôte pour résoudre la confusion réseau."
pubDate: 2026-10-17T21:48:00.000Z
translationKey: 270-i-finally-understand-why-docker-creates-different-ports
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Pendant longtemps, j'ai eu du mal avec la syntaxe `-p 8080:80`. Je me demandais : si l'application tourne sur le port 80 à l'intérieur du conteneur, pourquoi ai-je besoin d'un autre port sur ma machine ? Cela semblait être une gestion redondante jusqu'à ce que je réalise qu'un conteneur Docker n'est pas seulement un processus, mais une entité réseau virtuelle légère avec sa propre adresse IP privée.

## Le concept de réseau privé
Imaginez un conteneur Docker comme un petit appartement isolé. À l'intérieur de cet appartement, l'application (comme un serveur web) écoute sur une porte spécifique : le port du conteneur. Cependant, l'appartement se trouve dans un immeuble verrouillé (l'hôte Docker). Les personnes extérieures ne voient pas les portes des appartements ; elles ne voient que l'entrée principale de l'immeuble. Pour laisser entrer quelqu'un, vous devez créer un tunnel entre une porte spécifique de l'immeuble et la porte spécifique de l'appartement.

## Port Hôte vs Port Conteneur
Dans la commande `docker run -p 8080:80`, le nombre à gauche (8080) est le **Port Hôte**, et le nombre à droite (80) est le **Port Conteneur**. Le port hôte est la passerelle publique sur votre machine physique, tandis que le port conteneur est l'endroit où l'application réside réellement dans son environnement isolé.

## Exemple avec une application d'achats
Considérons un système d'achats où un `request-service` gère les demandes des employés. À l'intérieur du conteneur, l'application Spring Boot est configurée pour fonctionner sur le port 8080. Pour la rendre accessible au navigateur du manager sur la machine hôte, nous effectuons un mappage :

```bash
# Mapper le port hôte 9000 vers le port conteneur 8080
docker run -p 9000:8080 procurement-request-app
```
Désormais, quand le manager visite `http://localhost:9000`, Docker intercepte le trafic et le redirige vers le port `8080` à l'intérieur du conteneur. L'application ignore que le monde extérieur utilise le port 9000.

## Erreur courante : L'inversion du mappage
Une erreur fréquente est d'inverser les ports : `-p 80:8080` alors que vous vouliez `-p 8080:80`. Si votre application écoute sur le port 80 mais que vous mappez `80:8080`, la requête arrive sur l'hôte au port 80, est envoyée au conteneur sur le port 8080, ne trouve rien et renvoie une erreur "Connection Refused".

## Exercice pratique
Si vous avez un conteneur de base de données qui écoute sur le port 5432 en interne, mais que vous avez déjà une instance PostgreSQL locale sur votre machine, quelle commande vous permet d'accéder à la DB du conteneur via le port 5433 ?

**Réponse :** `docker run -p 5433:5432 postgres`
