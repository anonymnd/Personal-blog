---
title: "Qu'est-ce qu'un Cache ?"
description: "Un guide pour débutants sur la manière dont la mise en cache optimise les performances système en stockant les données fréquentes en mémoire rapide."
pubDate: 2026-10-15T17:48:00.000Z
translationKey: 218-what-is-a-cache
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous êtes un gestionnaire d'achats. Chaque fois qu'un demandeur demande le statut d'un bon de commande, vous devez descendre dans les archives au sous-sol, trouver le dossier et lire le statut. Si dix personnes demandent la même commande, vous faites dix allers-retours. C'est exactement ce que ressent un système lorsqu'il récupère des données depuis une base de données lente sur disque à chaque requête.

## Le Mécanisme Fondamental
Le caching consiste à stocker des copies de données dans une couche de stockage temporaire et rapide (le cache) afin que les demandes futures soient traitées plus rapidement. Alors qu'une base de données réside sur un disque dur (lent), un cache réside généralement dans la RAM (rapide). Quand une requête arrive, le système vérifie d'abord le cache. Si la donnée s'y trouve, c'est un 'cache hit' ; sinon, c'est un 'cache miss'.

## Le Pattern Cache-Aside
Dans une application d'achats, la stratégie la plus courante est le 'Cache-Aside'. Voici le fonctionnement :
1. L'application cherche `commande_123` dans le cache.
2. **Miss :** L'application interroge la base de données, récupère la commande et l'enregistre dans le cache.
3. **Hit :** L'application retourne immédiatement la donnée du cache.

```java
// Extrait illustratif de la logique Cache-Aside
public Order getOrder(String id) {
    Order order = cache.get(id);
    if (order == null) {
        order = database.findOrder(id);
        cache.put(id, order, Duration.ofMinutes(10));
    }
    return order;
}
```

## Le Compromis : Les Données Périmées
Le plus grand défi est l'invalidation du cache. Si un manager approuve une demande, la base de données est mise à jour, mais le cache contient toujours le statut 'En attente'. C'est ce qu'on appelle des données périmées (stale data). Pour corriger cela, il faut soit supprimer l'entrée du cache lors de la modification, soit définir un TTL (Time-to-Live).

## Erreur Courante : Le Cache comme Base de Données
Une erreur fréquente est de traiter un cache comme Redis comme une base de données principale. Les caches sont volatils ; si le serveur redémarre, les données disparaissent. Assurez-vous toujours que votre base de données reste la source de vérité.

## Exercice Pratique
**Scénario :** Un utilisateur modifie son nom de profil. Vous avez un cache avec un TTL de 24 heures. Quel est le problème et comment le résoudre ?

**Réponse :** L'utilisateur verra son ancien nom pendant 24 heures. La solution est d'appeler explicitement `cache.remove(userId)` juste après la mise à jour de la base de données.
