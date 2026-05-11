---
title: "Qu'est-ce qu'un Circuit Breaker ?"
description: "Découvrez comment le pattern Circuit Breaker évite les pannes en cascade dans les systèmes distribués en stoppant les appels vers un service défaillant."
pubDate: 2026-10-15T23:48:00.000Z
translationKey: 224-what-is-a-circuit-breaker
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats où un demandeur soumet une requête, et le système doit appeler une API externe de calcul de taxes. Soudain, l'API de taxes tombe ou devient extrêmement lente. Votre application continue d'envoyer des requêtes, et comme chaque requête attend un timeout, les threads de votre serveur s'accumulent. Finalement, toute votre application plante, alors que seul le service de taxes était en panne. C'est ce qu'on appelle une panne en cascade.

## Le Mécanisme Fondamental

Le Circuit Breaker agit comme un proxy entre votre application et le service distant. Il surveille les erreurs et fonctionne selon trois états :

1. **Closed (Fermé)** : Les requêtes passent normalement. Le disjoncteur compte les échecs. Si le seuil est dépassé, il passe à l'état Ouvert.
2. **Open (Ouvert)** : Le disjoncteur rejette immédiatement les requêtes (fail-fast) sans tenter d'appeler le service. Cela laisse au service distant le temps de récupérer.
3. **Half-Open (Mi-Ouvert)** : Après un délai, le disjoncteur autorise quelques requêtes de test. Si elles réussissent, il se referme ; sinon, il repasse en Ouvert.

## Exemple Concret : Approbation d'Achat

Dans notre app, quand un manager approuve une demande, le système appelle un service de notification. Si ce service ralentit :

- **Scénario** : 5 timeouts consécutifs surviennent.
- **Action** : Le circuit passe à **Open**.
- **Résultat** : Pendant les 30 prochaines secondes, tout manager cliquant sur "Approuver" reçoit un message immédiat : "Système de notification indisponible, approbation enregistrée localement." L'application ne freeze pas.

## Erreur Courante : Confusion avec les Retries

Une erreur fréquente est d'utiliser une boucle de répétition (Retry) à la place d'un Circuit Breaker. Les retries sont dangereux quand un service est surchargé car ils ajoutent *plus* de trafic à un système déjà fragile (une "tempête de retries"). Le Circuit Breaker fait l'inverse : il coupe totalement le trafic.

## Extrait d'Implémentation

Utilisation de Resilience4j dans un environnement Jakarta EE :

```java
@CircuitBreaker(name = "taxService", fallbackMethod = "calculateTaxFallback")
public BigDecimal getTax(Request request) {
    return taxClient.callRemoteApi(request);
}

public BigDecimal calculateTaxFallback(Request request, Throwable t) {
    return BigDecimal.ZERO; // Valeur par défaut sécurisée
}
```

## Exercice Pratique

**Question** : Si un circuit est à l'état 'Open' et qu'une requête arrive, l'application tente-t-elle de contacter le serveur distant ?

**Réponse** : Non. Elle échoue immédiatement pour protéger le système et le service distant.
