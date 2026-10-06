---
title: "Les points de terminaison doivent représenter des ressources, pas des boutons"
description: "Apprenez à passer d'une conception d'API basée sur les actions (style RPC) à une architecture REST orientée ressources."
pubDate: 2026-10-09T17:48:00.000Z
translationKey: 074-endpoints-should-represent-resources-not-buttons
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'approvisionnement. Vous pourriez être tenté de créer un point de terminaison comme `/approuverDemande?id=123`. Cela semble intuitif car cela imite le clic d'un bouton dans une interface utilisateur. Cependant, c'est une erreur courante appelée conception style 'RPC'. Dans une véritable API REST, les endpoints doivent représenter des *objets* (ressources), et non des *actions* (boutons).

## L'état d'esprit orienté ressource
Au lieu de penser à ce que l'utilisateur *fait*, pensez à ce que l'utilisateur *modifie*. Une approbation n'est pas une action isolée ; c'est un changement d'état d'une ressource `PurchaseRequest`. En traitant la demande comme une ressource, vous utilisez les méthodes HTTP standards pour définir l'opération, rendant votre API prévisible.

## Des actions vers des états
Lorsque vous passez des boutons aux ressources, la structure de vos URL change. Au lieu de `/soumettreCommande` ou `/annulerCommande`, vous utilisez `/commandes`. L'action est déterminée par le verbe HTTP :

| Action | Style RPC (Faux) | Style REST (Juste) | Méthode HTTP |
| :--- | :--- | :--- | :--- |
| Créer demande | `/createRequest` | `/requests` | POST |
| Approuver demande | `/approveRequest` | `/requests/{id}/status` | PUT/PATCH |
| Supprimer demande | `/deleteRequest` | `/requests/{id}` | DELETE |

## Exemple concret : Approbation d'achat
Dans une application d'achat, lorsqu'un manager approuve une demande, il modifie l'état de cette ressource.

**Requête :**
`PATCH /requests/456` 
`Content-Type: application/json` 
`{ "status": "APPROVED" }` 

**Résultat :**
Le serveur met à jour l'enregistrement et renvoie `200 OK` avec la représentation mise à jour. Si la demande était déjà approuvée, l'opération reste idempotente. Si la demande était déjà annulée, le serveur doit renvoyer `409 Conflict` car la transition d'état est invalide.

## Erreur courante : Le verbe dans l'URL
Une erreur fréquente est de mélanger les styles, comme `POST /requests/456/approve`. C'est redondant car la méthode `POST` implique déjà une action. La correction consiste à cibler la propriété de la ressource : `PATCH /requests/456` ou `PUT /requests/456/status`.

## Exercice pratique
Comment redessineriez-vous le point de terminaison `POST /orders/12/shipItem` pour suivre une conception orientée ressources ?

**Réponse :** Utilisez `PATCH /orders/12` avec un corps `{ "status": "SHIPPED" }` ou ciblez une sous-ressource comme `PUT /orders/12/shipping-status`.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
