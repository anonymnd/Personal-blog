---
title: "What Is CORS?"
description: "Un guide simple pour comprendre le Cross-Origin Resource Sharing et la gestion de la sécurité par les navigateurs entre différents domaines."
pubDate: 2026-10-14T18:48:00.000Z
translationKey: 195-what-is-cors
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats où le frontend s'exécute sur `http://localhost:3000` et l'API backend sur `http://localhost:8080`. Vous écrivez un appel `fetch()` parfait pour soumettre une demande d'achat, mais le navigateur bloque la réponse avec une erreur rouge mentionnant 'CORS'. Cela arrive à cause de la Same-Origin Policy, une mesure de sécurité qui empêche un script d'un site de lire des données d'un autre site sans autorisation explicite.

## Définition de l'Origine
Une origine est définie par trois éléments : le schéma (http/https), l'hôte (domaine) et le port. Si l'un de ces éléments diffère, la requête est considérée comme cross-origin. Par exemple, `http://api.app.com` et `https://api.app.com` sont des origines différentes car le schéma change.

## Fonctionnement du CORS
Le CORS est un mécanisme qui utilise des en-têtes HTTP pour indiquer au navigateur qu'un serveur autorise les requêtes provenant d'une origine spécifique. Lorsqu'un navigateur effectue une requête cross-origin, il vérifie l'en-tête `Access-Control-Allow-Origin` dans la réponse. Si l'en-tête correspond à l'origine du demandeur ou est un joker (`*`), le navigateur autorise le frontend à lire la réponse.

## Les Requêtes Preflight
Pour les requêtes 'complexes' (comme `PUT` ou `DELETE` ou des en-têtes JSON personnalisés), le navigateur envoie d'abord une requête `OPTIONS`. C'est une vérification 'preflight' pour demander au serveur : "Es-tu d'accord pour que j'envoie cette requête spécifique ?" Le serveur doit répondre par un code 200 OK et préciser les méthodes et origines autorisées.

## Exemple concret : Approbation d'achat
Supposons qu'un manager approuve une demande via un frontend sur `https://manager.app`. Le backend (Jakarta EE) doit autoriser cela :

```java
// Extrait illustratif d'un filtre
response.setHeader("Access-Control-Allow-Origin", "https://manager.app");
response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
response.setHeader("Access-Control-Allow-Headers", "Content-Type");
```
Résultat : Le navigateur voit que l'en-tête correspond à `https://manager.app` et permet à l'interface utilisateur de lire la confirmation d'approbation.

## Erreur courante : Confondre CORS et Authentification
Une erreur fréquente est de croire que le CORS est un mur de sécurité qui empêche les requêtes d'atteindre le serveur. En réalité, le CORS est une politique appliquée par le navigateur pour la *lecture* de la réponse. Une requête peut toujours atteindre votre serveur et modifier des données même si le navigateur bloque la réponse. L'authentification côté serveur reste indispensable.

## Exercice pratique
Si votre frontend est sur `http://localhost:3000` et que votre serveur envoie `Access-Control-Allow-Origin: http://localhost:8080`, le navigateur autorisera-t-il la lecture des données ?

**Réponse :** Non, car l'origine dans l'en-tête doit correspondre à l'origine du demandeur (`localhost:3000`) ou être un joker.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
