---
title: "Frontend, Backend et Base de Données sont Trois Applications Séparées"
description: "Comprendre la séparation logique et physique entre l'interface utilisateur, la logique serveur et la couche de stockage des données."
pubDate: 2026-10-14T14:48:00.000Z
translationKey: 191-frontend-backend-and-database-are-three-separate-applications
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Beaucoup de débutants sont perplexes face au 'mur invisible' entre leur page HTML et leur base de données. Ils se demandent souvent pourquoi ils ne peuvent pas simplement écrire une requête SQL dans une fonction JavaScript dans le navigateur. En réalité, le Frontend, le Backend et la Base de Données sont trois entités logiques distinctes qui fonctionnent dans des environnements différents.

## L'Environnement Navigateur (Frontend)
Le frontend est le code téléchargé et exécuté sur la machine de l'utilisateur. Qu'il s'agisse de React, Vue ou de HTML pur, il réside dans le navigateur. Comme il s'exécute côté client, il n'a pas d'accès direct à votre base de données pour des raisons de sécurité ; sinon, n'importe quel utilisateur pourrait ouvrir la console de développement et effacer toutes vos données.

## L'Environnement Serveur (Backend)
Le backend est une application séparée tournant sur un serveur distant (utilisant Jakarta EE, Node.js ou Python). Il agit comme un gardien. Il reçoit les requêtes du frontend, vérifie l'identité de l'utilisateur, applique la logique métier, puis communique avec la base de données.

## La Couche de Données (Base de Données)
La base de données est un logiciel spécialisé (comme PostgreSQL ou MongoDB) qui gère le stockage. Elle ne parle qu'au backend. Elle ignore totalement l'existence du frontend.

## Exemple Concret : Demande d'Achat
Imaginez une application de procurement où un demandeur soumet une requête d'achat :
1. **Frontend** : L'utilisateur remplit un formulaire et clique sur 'Envoyer'. Le navigateur envoie une requête HTTP POST vers `https://api.entreprise.com/requests`.
2. **Backend** : Le serveur Java reçoit la requête, vérifie la session et exécute : `INSERT INTO requests (item, qty) VALUES ('Laptop', 1);`.
3. **Base de Données** : La DB stocke la ligne et renvoie une confirmation au backend.
4. **Backend** : Le serveur renvoie une réponse `201 Created` au navigateur.

## Erreur Courante : Connexion DB Directe
Une erreur fréquente consiste à essayer d'utiliser un pilote de base de données (comme JDBC) directement dans le code frontend.
**Correction** : Utilisez toujours une couche API. Le frontend appelle un point de terminaison REST, et le backend gère le pilote de base de données.

## Exercice Pratique
Si une application frontend est hébergée sur `http://localhost:3000` et tente de récupérer des données d'un backend sur `http://localhost:8080`, quel composant est responsable de la gestion de la politique CORS pour autoriser cette communication ?

**Réponse** : Le serveur Backend doit être configuré pour autoriser les requêtes provenant de l'origine du frontend.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
