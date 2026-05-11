---
title: "Pourquoi les systèmes distribués ont besoin de Circuit Breakers"
description: "Découvrez comment le pattern Circuit Breaker évite les pannes en cascade dans les microservices en stoppant les appels vers des dépendances défaillantes."
pubDate: 2026-10-16T00:48:00.000Z
translationKey: 225-why-distributed-systems-need-circuit-breakers
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez votre application d'achat où un demandeur soumet une requête. Le service de requête doit appeler un service d'inventaire externe pour vérifier le stock. Si le service d'inventaire ralentit ou plante, le service de requête continue d'envoyer des appels, bloquant ses propres threads en attendant un timeout. Rapidement, toutes les ressources sont épuisées et tout le système s'effondre, même les parties qui n'ont pas besoin de l'inventaire. C'est ce qu'on appelle une panne en cascade.

## Le mécanisme de défaillance
Dans un système distribué, une panne dans un service peut agir comme un domino. Sans circuit breaker, un client tente répétitivement d'appeler un service défaillant. Cela augmente la pression sur le service en difficulté, empêchant son rétablissement, tout en vidant les ressources de l'appelant.

## Fonctionnement du Circuit Breaker
Ce pattern fonctionne comme un disjoncteur électrique avec trois états :
1. **Closed (Fermé)** : Les requêtes passent normalement. Le système compte les échecs.
2. **Open (Ouvert)** : Quand le seuil d'échecs est atteint, le circuit "saute". Tous les appels échouent immédiatement sans tenter de connexion réseau.
3. **Half-Open (Mi-ouvert)** : Après un délai, le système autorise quelques requêtes de test. Si elles réussissent, le circuit se ferme ; sinon, il se rouvre.

## Exemple concret : Approbation d'achat
Un manager approuve une demande. Le service d'approbation appelle un service de notification pour envoyer un email à l'acheteur.

```java
// Extrait illustratif d'un circuit breaker conceptuel
public Response approveRequest(Long requestId) {
    return circuitBreaker.execute(() -> {
        // Appel au service de notification (Trafic L7 HTTP)
        return notificationClient.sendEmail(requestId);
    }, fallback() -> {
        // Retourne une réponse temporaire ou met en file d'attente
        return Response.accepted("Approbation enregistrée, notification en attente");
    });
}
```
**Résultat** : Si le service de notification est HS, le manager voit instantanément "Approbation enregistrée" au lieu d'un écran figé pendant 30 secondes suivi d'une erreur 504.

## Erreur courante : Confusion avec les Retries
Une erreur fréquente est de remplacer le circuit breaker par une boucle de tentatives (retries). Les retries sont dangereux quand un service est surchargé ; ils agissent comme une attaque DoS auto-infligée. Le circuit breaker *arrête* les appels, tandis que le retry les *augmente*.

## Exercice pratique
**Scénario** : Votre système a un taux d'échec de 50% sur une dépendance. Votre circuit breaker saute après 5 échecs consécutifs. Le circuit s'ouvrira-t-il si les échecs sont alternés (Échec, Succès, Échec, Succès) ?

**Réponse** : Non. Comme les échecs ne sont pas consécutifs, le compteur ne franchit pas le seuil, et le circuit reste Fermé.
