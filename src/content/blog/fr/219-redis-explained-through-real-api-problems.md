---
title: "Redis Explained Through Real API Problems"
description: "Découvrez comment résoudre les goulots d'étranglement des API, comme la surcharge des bases de données, grâce à Redis."
pubDate: 2026-10-15T18:48:00.000Z
translationKey: 219-redis-explained-through-real-api-problems
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une API de gestion des achats où les employés soumettent des demandes. Avec la croissance de l'entreprise, votre base de données peine à gérer des milliers de requêtes pour le même document de "Politique d'entreprise", et votre serveur plante lorsqu'un bot bombarde le point de terminaison de soumission. Ajouter des serveurs ne suffit pas, car chaque instance possède sa propre mémoire locale et ignore l'état des autres.

## Le Dilemme de l'État Partagé
Lorsque vous multipliez vos instances API, le cache local devient incohérent. Si le Serveur A a mis en cache une règle et que le Serveur B ne l'a pas fait, les utilisateurs reçoivent des réponses différentes. Redis résout cela en servant de couche de mémoire externe partagée. Toutes les instances communiquent avec Redis, garantissant que chaque serveur accède à la même information en temps réel.

## Soulager la Base de Données avec le Cache-Aside
Pour éviter que votre base de données ne s'effondre, on utilise le pattern Cache-Aside. Quand un utilisateur demande une politique, l'API vérifie d'abord Redis. Si la donnée est absente (cache miss), l'API la récupère en base de données, puis l'enregistre dans Redis pour les requêtes suivantes.

```java
// Extrait illustratif de la logique Cache-Aside
public String getPolicy(String policyId) {
    String cached = redisClient.get("policy:" + policyId);
    if (cached != null) return cached;

    String dbPolicy = db.findPolicy(policyId);
    redisClient.setex("policy:" + policyId, 3600, dbPolicy);
    return dbPolicy;
}
```

## Limiter les Abus avec le Rate Limiting
Pour empêcher un utilisateur de saturer le système d'achats, on peut implémenter un algorithme de Token Bucket dans Redis. On stocke un compteur par utilisateur. Chaque requête consomme un jeton ; si le compteur atteint zéro, l'API renvoie une erreur `429 Too Many Requests`. L'atomicité de Redis empêche les conditions de concurrence.

## Erreur Courante : Le Défaut d'Invalidation
Une erreur classique est d'oublier de mettre à jour Redis lors d'une modification en base de données. Si un manager change une politique mais que l'ancienne version reste dans Redis, les utilisateurs voient des données obsolètes. La solution est de supprimer la clé Redis immédiatement après toute mise à jour en base.

## Exercice Pratique
**Scénario :** Votre API utilise Redis pour les jetons de session. Vous remarquez qu'après une déconnexion, l'utilisateur peut encore accéder au système pendant 5 minutes. Quel est le problème ?

**Réponse :** La logique de déconnexion ne supprime probablement pas la clé spécifique dans Redis, laissant le jeton valide jusqu'à l'expiration de son TTL (Time To Live).
