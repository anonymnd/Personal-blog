---
title: "Utiliser les Circuit Breakers pour Contenir les Défaillances de Dépendances"
description: "Apprenez à prévenir les pannes en cascade dans les systèmes distribués en utilisant le pattern Circuit Breaker pour gérer les dépendances instables."
pubDate: 2026-10-08T17:48:00.000Z
translationKey: 224-what-is-a-circuit-breaker
seriesOrder: 50
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Le Problème : Les Pannes en Cascade

Dans un système distribué, un service dépend souvent d'autres pour finaliser une requête. Prenons l'exemple d'un service de Paiement (Checkout) qui appelle un service d'Estimation de Livraison. Si le service de livraison devient lent ou ne répond plus sans déclencher de timeout, les threads du service de Paiement restent bloqués. Sous une charge élevée, tous les threads disponibles sont immobilisés, ce qui épuise le pool de threads et provoque le crash du service de Paiement, même pour des requêtes qui n'ont pas besoin d'estimation de livraison. C'est ce qu'on appelle une panne en cascade.

## Le Mécanisme du Circuit Breaker

Le Circuit Breaker agit comme un proxy entre l'appelant et la dépendance. Il surveille les échecs et alterne entre trois états :

1. **Closed (Fermé)** : État normal. Les requêtes passent vers la dépendance. Le breaker suit le taux d'échec. Si le nombre ou le taux d'échecs dépasse un seuil (ex: 5 échecs ou 50% des 100 derniers appels), le circuit s'ouvre.
2. **Open (Ouvert)** : Le breaker rejette immédiatement les requêtes sans appeler la dépendance. Il renvoie une erreur ou une réponse de secours (fallback). Cela évite de gaspiller des ressources et laisse le temps à la dépendance de récupérer.
3. **Half-Open (Mi-Ouvert)** : Après un délai configuré ("sleep window"), le breaker autorise un nombre limité de requêtes de test. Si elles réussissent, le circuit repasse à l'état Closed. Si l'une d'elles échoue, il revient immédiatement à l'état Open.

## Interaction avec les Timeouts et les Retries

Le Circuit Breaker ne remplace pas les timeouts ou les tentatives de réessai (retries), il s'y coordonne :

* **Timeouts** : Indispensables pour éviter que les threads ne restent bloqués indéfiniment. Un timeout déclenche un échec, que le Circuit Breaker comptabilise.
* **Retries** : Réessayer contre un service en panne peut aggraver la situation ("retry storm"). Le Circuit Breaker empêche cela en ouvrant le circuit, bloquant les retries jusqu'à ce que le système soit probablement rétabli.

## Exemple Concret : Paiement → Livraison

Imaginons un système où le service de livraison échoue. Nous configurons un Circuit Breaker avec un seuil de 3 échecs et une fenêtre de sommeil de 5 secondes.

**Trace des événements :**
1. **Requêtes 1-3** : Le service de livraison expire (timeout). Le breaker enregistre 3 échecs. État : **Closed → Open**.
2. **Requêtes 4-10** : Le breaker voit l'état **Open**. Il renvoie immédiatement un `FallbackShippingEstimate` (ex: forfait de 10€) sans appeler le service. Les threads sont libérés instantanément.
3. **Attente** : 5 secondes s'écoulent.
4. **Requête 11** : L'état passe à **Half-Open**. Le breaker autorise une requête vers le service de livraison.
5. **Résultat A** : La requête 11 échoue → l'état revient à **Open**. Le minuteur est réinitialisé.
6. **Résultat B** : La requête 11 réussit → l'état revient à **Closed**. Le trafic reprend normalement.

## Qualité du Fallback et Périmètre

Le fallback est la logique exécutée quand le circuit est ouvert. Sa qualité détermine l'expérience utilisateur :
* **Fallback Statique** : Retourner une valeur par défaut (ex: "Frais de port calculés à l'étape suivante").
* **Fallback Mis en Cache** : Retourner la dernière valeur connue valide depuis un cache local.
* **Fonctionnalité Dégradée** : Ignorer la fonctionnalité mais permettre au reste du processus de continuer.

## Exercice

Définissez la politique : ce breaker pédagogique ouvre après cinq échecs dans une fenêtre de dix appels, les succès ne remettent pas le compteur à zéro et l’ouverture dure dix secondes. Quatre échecs, un succès puis deux échecs franchissent le seuil dès le premier des deux derniers ; l’autre appel est refusé. Après l’attente, une sonde half-open échoue et le circuit rouvre.

Avec cinq échecs consécutifs, la réponse change car le succès remet à zéro. Les bibliothèques peuvent utiliser taux, minimum d’échantillons, appels lents et plusieurs sondes. Configurez ordre des timeouts/retries : le breaker n’annule pas automatiquement un appel bloqué et ne supprime pas toute amplification. Une estimation de secours ne devient pas un devis ferme inventé pendant la panne.
