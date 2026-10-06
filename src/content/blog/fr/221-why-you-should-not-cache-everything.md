---
title: "Pourquoi vous ne devriez pas tout mettre en cache"
description: "Une exploration des compromis et des risques liés au sur-caching dans la conception de systèmes distribués."
pubDate: 2026-10-15T20:48:00.000Z
translationKey: 221-why-you-should-not-cache-everything
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. Pour rendre l'application instantanée, vous décidez de mettre en cache chaque requête SQL dans Redis. Au début, le tableau de bord charge en quelques millisecondes. Mais bientôt, un manager approuve une demande, alors que l'acheteur voit toujours le statut 'En attente' pendant dix minutes. Vous venez de rencontrer le danger principal du sur-caching : l'incohérence des données.

## Le coût des données obsolètes
Le caching consiste essentiellement à échanger la fraîcheur contre la vitesse. Lorsque vous cachez tout, vous créez un problème d'état distribué. Si votre application possède plusieurs instances, chacune peut détenir une version légèrement différente de la vérité. Dans notre application d'achats, si le 'Statut d'approbation' est mis en cache, l'acheteur pourrait commander un article que le manager a en réalité refusé.

## Le cauchemar de l'invalidation
Mettre à jour un cache est plus difficile que d'y lire. Vous devez choisir une stratégie d'invalidation. Le 'Cache-aside' est courant : l'application vérifie le cache, ne trouve rien, charge depuis la DB, puis remplit le cache. Cependant, quand les données changent, vous devez explicitement supprimer la clé. Si vous cachez chaque entité, votre code devient encombré de logique d'invalidation, augmentant le risque qu'un `cache.evict()` oublié crée un bug.

## Épuisement des ressources et démarrages à froid
Le caching consomme de la RAM coûteuse. Si votre jeu de données est énorme, vous atteindrez les limites de mémoire, déclenchant des politiques d'éviction comme LRU. Plus grave encore est le 'Cache Stampede'. Si votre cache expire ou plante, des milliers de requêtes simultanées frapperont votre base de données, risquant de la faire tomber car elle n'est pas dimensionnée pour la charge brute.

## Exemple concret : Statut de commande
Considérez cette logique pour récupérer un statut :

```java
public String getStatus(String requestId) {
    String status = redis.get("req:" + requestId);
    if (status == null) {
        status = db.findStatus(requestId);
        redis.setex("req:" + requestId, 3600, status);
    }
    return status;
}
```
Résultat : Si un manager change le statut en 'Approuvé' dans la DB, la méthode `getStatus` retournera 'En attente' pendant une heure, sauf si vous appelez `redis.del("req:" + requestId)` lors de la mise à jour.

## Erreur courante : Cacher des données volatiles
**Erreur :** Mettre en cache le 'Niveau de stock actuel' pendant 30 minutes pour économiser la DB.
**Correction :** Ne cachez que les données statiques (comme les noms de catégories) ou utilisez un TTL très court pour les données volatiles.

## Exercice pratique
Lequel de ces éléments ne doit PAS être mis en cache longtemps : A) La liste des adresses des bureaux de l'entreprise, ou B) Le statut d'approbation en temps réel d'une demande d'achat coûteuse ?

**Réponse :** B, car c'est une donnée volatile qui nécessite une cohérence immédiate pour éviter des erreurs métier.
