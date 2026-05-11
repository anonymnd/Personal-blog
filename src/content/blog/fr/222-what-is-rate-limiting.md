---
title: "Qu'est-ce que le Rate Limiting ?"
description: "Un guide simple pour comprendre comment contrôler le flux de trafic afin d'éviter les plantages système et l'abus d'API."
pubDate: 2026-10-15T21:48:00.000Z
translationKey: 222-what-is-rate-limiting
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez une application d'achats où les employés soumettent des demandes. Soudain, un script défectueux commence à envoyer 10 000 requêtes par seconde vers le point de terminaison `/submit-request`. Votre base de données se bloque, le manager ne peut plus approuver les commandes et tout le système s'effondre. C'est précisément pour cela que nous avons besoin du rate limiting : pour protéger vos services contre une surcharge de requêtes.

## Comment fonctionne le Rate Limiting
Le rate limiting est une stratégie utilisée pour limiter le nombre de requêtes qu'un utilisateur ou une adresse IP peut effectuer vers un service dans un laps de temps donné. Il agit comme un gardien à l'entrée de votre application. Lorsqu'une requête arrive, le système vérifie si l'utilisateur a dépassé son quota. Si c'est le cas, le serveur rejette la requête, renvoyant généralement un code HTTP 429 "Too Many Requests".

## Rate Limiting L4 vs L7
Selon l'endroit où vous appliquez la limite, vous avez deux options principales. La limitation de Couche 4 (L4) se produit au niveau du transport (TCP/UDP), se concentrant sur les adresses IP. C'est extrêmement rapide mais "aveugle" au contenu. La limitation de Couche 7 (L7) se produit au niveau de l'application (HTTP), vous permettant de limiter selon des clés API, des ID utilisateurs ou des endpoints spécifiques comme `/order-payment`.

## Algorithmes Courants
Différents besoins nécessitent différents algorithmes. Le **Token Bucket** permet des "pics" de trafic ; les utilisateurs peuvent accumuler des jetons et les dépenser rapidement. Le **Leaky Bucket** est plus strict, traitant les requêtes à un rythme constant et fluide. Pour des fenêtres simples, le **Fixed Window** se réinitialise à des moments précis (ex: chaque heure), bien qu'il puisse laisser passer le double du trafic à la limite des fenêtres.

## Exemple concret : API d'achats
Supposons que nous limitions l'endpoint `/approve-request` à 5 requêtes par minute par manager pour éviter les doubles-clics accidentels.

```java
// Extrait illustratif d'une vérification de limite
public Response handleApproval(Request req) {
    String managerId = req.getUserId();
    if (rateLimiter.isExceeded(managerId, 5, Duration.ofMinutes(1))) {
        return Response.status(429).entity("Ralentissez, manager!").build();
    }
    return procurementService.approve(req.getId());
}
```
Résultat : Si un manager clique sur "Approuver" 6 fois en 30 secondes, la 6ème requête est bloquée, évitant ainsi un traitement redondant en base de données.

## Erreur Courante : État Local vs Distribué
Une erreur fréquente consiste à stocker le compteur de requêtes dans une variable locale. Si vous avez trois instances de serveur, un utilisateur pourrait envoyer 3x la limite autorisée car chaque serveur suit le compte séparément. Pour corriger cela, utilisez un état externe partagé comme Redis.

## Exercice Pratique
Si un système utilise l'algorithme Leaky Bucket et que le seau fuit à 2 requêtes par seconde, que se passe-t-il si un utilisateur envoie 10 requêtes en une seule seconde ?

**Réponse :** 2 requêtes sont traitées immédiatement, et les 8 restantes sont soit mises en file d'attente (si le seau a de la place), soit rejetées immédiatement si le seau est plein.
