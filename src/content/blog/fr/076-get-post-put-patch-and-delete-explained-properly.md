---
title: "GET, POST, PUT, PATCH et DELETE Expliqués Correctement"
description: "Un guide complet pour comprendre les différences sémantiques et l'utilisation correcte des méthodes HTTP standards dans la conception d'API REST."
pubDate: 2026-10-09T19:48:00.000Z
translationKey: 076-get-post-put-patch-and-delete-explained-properly
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développez un système d'approvisionnement. Vous avez une demande pour un nouvel ordinateur, mais vous hésitez entre PUT ou PATCH pour modifier la quantité, ou si POST est la seule option pour créer la demande. Choisir la mauvaise méthode rend les API imprévisibles et casse la logique de mise en cache ou de tentative de reconnexion.

## Le duo Lecture et Création : GET et POST
`GET` est utilisé pour récupérer des données. Il est considéré comme « sûr » car il ne doit jamais modifier l'état du serveur. Il est également idempotent, ce qui signifie que l'appeler dix fois produit le même résultat. `POST` est généralement utilisé pour créer une nouvelle ressource. Contrairement à GET, POST n'est ni sûr ni idempotent ; envoyer la même requête POST deux fois crée généralement deux enregistrements identiques.

## Le débat sur la mise à jour : PUT vs PATCH
`PUT` sert au remplacement complet. Si vous mettez à jour une demande d'achat via PUT, vous devez envoyer l'objet entier. Si vous omettez un champ, le serveur pourrait le mettre à null. Il est idempotent car remplacer une ressource par les mêmes données répétitivement ne change pas l'état final. `PATCH` est destiné aux mises à jour partielles. Vous envoyez uniquement le champ à modifier (ex: juste le statut). PATCH n'est pas intrinsèquement idempotent car certaines opérations (comme l'incrémentation) modifient l'état à chaque appel.

## Suppression de ressources : DELETE
`DELETE` supprime une ressource. Il est idempotent concernant l'état du serveur : une fois la ressource disparue, elle le reste. Cependant, le code de réponse peut varier (204 No Content la première fois, 404 Not Found ensuite), mais l'état final du serveur demeure identique.

## Exemple concret : Demande d'achat

| Action | Méthode | Endpoint | Payload | Résultat attendu |
| :--- | :--- | :--- | :--- | :--- |
| Voir demande | GET | `/requests/123` | Aucun | 200 OK + JSON |
| Créer demande | POST | `/requests` | `{ "item": "Laptop" }` | 201 Created |
| Remplacer demande | PUT | `/requests/123` | `{ "item": "MacBook", "qty": 1 }` | 200 OK |
| Modifier statut | PATCH | `/requests/123` | `{ "status": "Approved" }` | 200 OK |
| Annuler demande | DELETE | `/requests/123` | Aucun | 204 No Content |

## Erreur courante : Tout faire avec POST
Les développeurs utilisent souvent POST pour les mises à jour par simplicité. Cependant, cela ignore la sémantique REST. Si un client renvoie une requête POST échouée, il risque de créer des commandes en double. L'utilisation de PUT pour les remplacements garantit que les tentatives de renvoi sont sûres.

## Exercice pratique
Quelle méthode devez-vous utiliser pour modifier uniquement l'adresse de livraison d'une commande existante sans envoyer le reste des détails de la commande ?

**Réponse :** `PATCH`, car il est conçu pour les modifications partielles.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
