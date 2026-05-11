---
title: "Pourquoi localhost:3000 et localhost:8080 sont des Origines Différentes"
description: "Comprendre comment le navigateur définit une origine et pourquoi des ports différents déclenchent des restrictions CORS en développement."
pubDate: 2026-10-14T19:48:00.000Z
translationKey: 196-why-localhost-3000-and-localhost-8080-are-different-origins
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous avez une application React sur `localhost:3000` et une API Spring Boot sur `localhost:8080`. Vous envoyez une requête fetch pour récupérer des données, mais le navigateur bloque la réponse avec une erreur rouge mentionnant 'CORS'. Vous vous demandez : 'Tout est sur ma machine, pourquoi le navigateur pense-t-il qu'ils sont différents ?'

## L'Anatomie d'une Origine
En sécurité web, une **Origine** n'est pas seulement le nom de domaine. C'est une combinaison stricte de trois composants : le **Schéma** (protocole), l'**Hôte** et le **Port**. Si l'un de ces trois éléments diffère, le navigateur considère la requête comme 'Cross-Origin'.

| Composant | Origine A | Origine B | Match ? |
| :--- | :--- | :--- | :--- |
| Schéma | http | http | Oui |
| Hôte | localhost | localhost | Oui |
| Port | 3000 | 8080 | **Non** |

Comme les ports sont différents, `http://localhost:3000` et `http://localhost:8080` sont des origines totalement distinctes.

## Comment le Navigateur Applique la SOP
La Same-Origin Policy (SOP) est une mesure de sécurité qui empêche un script chargé depuis une origine de lire des données provenant d'une autre. Il est crucial de noter que la SOP ne bloque pas forcément l' *envoi* de la requête. Une 'requête simple' peut atteindre votre serveur et même modifier une base de données, mais le navigateur bloquera le code JavaScript lors de la lecture de la réponse, sauf si le serveur l'autorise via les headers CORS.

## Exemple Concret : Demande d'Achat
Imaginez une application de procurement où un demandeur sur le port 3000 soumet une demande d'achat à un backend sur le port 8080.

**Requête Frontend :**
```javascript
fetch('http://localhost:8080/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'Laptop', qty: 1 })
});
```

**Résultat :** Le navigateur envoie la requête. Le serveur la traite et renvoie un code `201 Created`. Cependant, comme le serveur n'a pas envoyé de header `Access-Control-Allow-Origin`, le navigateur empêche le frontend de lire le message de succès et affiche une erreur CORS.

## Erreur Courante : Le Piège du Wildcard
Les développeurs utilisent souvent `@CrossOrigin("*")` avec Jakarta EE pour régler cela. Si cela fonctionne pour des API publiques, cela échoue dès que vous devez envoyer des cookies ou des headers d'authentification. Si `credentials` est défini sur `include`, le serveur **ne peut pas** utiliser l'astérisque `*` ; il doit spécifier l'origine exacte `http://localhost:3000`.

## Exercice Pratique
Si votre frontend est sur `https://app.local` et votre backend sur `https://api.local`, s'agit-il de la même origine ?

**Réponse :** Non. Les hôtes (`app.local` vs `api.local`) sont différents, ce qui en fait des origines distinctes.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
