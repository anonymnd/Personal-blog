---
title: "Qu'est-ce que le Cache-Aside ?"
description: "Une analyse approfondie du modèle Cache-Aside pour optimiser les performances de lecture des bases de données."
pubDate: 2026-10-15T19:48:00.000Z
translationKey: 220-what-is-cache-aside
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que votre application ralentisse car chaque requête utilisateur déclenche une requête SQL lourde pour récupérer des données d'achat. Le CPU de votre base de données grimpe à 90 % et le temps de chargement devient insupportable. Vous remarquez que même si les données ne changent pas toutes les secondes, vous récupérez la même liste de 'Commandes Approuvées' des milliers de fois par minute. C'est là que le modèle Cache-Aside devient essentiel.

## Fonctionnement du mécanisme
Dans une architecture Cache-Aside, l'application est responsable de la gestion de la relation entre le stockage de données (Base de données) et le cache (comme Redis). Contrairement à d'autres modèles où le cache se place automatiquement 'devant' la DB, ici, la logique applicative décide quand lire ou écrire dans le cache. Quand l'app a besoin de données, elle vérifie d'abord le cache. Si les données s'y trouvent (cache hit), elle les renvoie immédiatement. Sinon (cache miss), l'app récupère les données dans la base, en stocke une copie dans le cache pour la prochaine fois, puis les renvoie à l'utilisateur.

## Exemple concret : Demande d'achat
Considérons une application de gestion d'achats où un manager consulte une demande spécifique.
1. **Requête** : Le manager demande `Request_ID: 505`.
2. **Vérification** : L'app cherche la clé `req_505` dans Redis. Résultat : *Miss*.
3. **Récupération** : L'app interroge PostgreSQL : `SELECT * FROM requests WHERE id = 505`.
4. **Population** : L'app enregistre le résultat dans Redis avec un TTL (Time to Live) de 30 minutes.
5. **Retour** : Le manager voit les détails de la demande.

La prochaine fois que le manager actualise la page, l'app trouve `req_505` dans Redis (Hit) et ignore totalement la base de données.

## Le problème des données obsolètes
Le défi majeur est la cohérence des données. Si un acheteur modifie le statut de `req_505` en 'Commandé' dans la base de données, le cache contient toujours l'ancien statut 'Approuvé'. Pour corriger cela, vous devez implémenter une stratégie d'invalidation. L'approche la plus courante consiste à supprimer la clé du cache immédiatement après avoir mis à jour la base de données.

## Erreur courante : Mettre à jour au lieu de supprimer
Les développeurs tentent souvent de mettre à jour la valeur du cache au lieu de la supprimer. Dans des environnements à forte concurrence, deux mises à jour simultanées peuvent créer une condition de concurrence (race condition) où le cache finit par stocker une valeur plus ancienne que la base de données. **Correction** : Supprimez toujours la clé du cache lors d'une écriture.

## Exercice pratique
Si vous utilisez le Cache-Aside et que vous mettez à jour un enregistrement dans la DB mais oubliez d'invalider le cache, qu'arrive-t-il à l'expérience utilisateur ?

**Réponse** : L'utilisateur verra des données obsolètes jusqu'à ce que l'entrée du cache expire naturellement via son TTL.
