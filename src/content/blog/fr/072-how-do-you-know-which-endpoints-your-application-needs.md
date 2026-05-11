---
title: "Comment savoir quels points de terminaison votre application nécessite ?"
description: "Un guide pour dériver les endpoints d'une API REST à partir des besoins métier via une approche centrée sur les ressources."
pubDate: 2026-10-09T15:48:00.000Z
translationKey: 072-how-do-you-know-which-endpoints-your-application-needs
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Beaucoup de développeurs commencent par imaginer les tables de la base de données, puis créent des endpoints qui reflètent ces tables. Cela mène à une 'abstraction fuitée' où l'API n'est qu'une enveloppe pour la base de données. Le vrai défi est de traduire un processus métier—comme un flux d'approvisionnement—en un ensemble de ressources logiques.

## Identifier les ressources principales
Au lieu de penser en termes de fonctions, pensez en termes de noms. Dans une application d'achat, vous n'avez pas une fonction 'submitRequest' ; vous avez une ressource `PurchaseRequest`. Identifiez les entités primaires et leurs relations. Une `PurchaseRequest` peut être liée à un `User` (demandeur) et à un `Department`.

## Mapper le cycle de vie métier
Suivez le chemin d'une ressource de sa création à sa finalisation.
1. **Soumission** : Un demandeur crée une requête (`POST /purchase-requests`).
2. **Révision** : Un manager consulte les requêtes en attente (`GET /purchase-requests?status=pending`).
3. **Décision** : Un manager approuve ou rejette (`PATCH /purchase-requests/{id}`).
4. **Exécution** : Un acheteur transforme la requête approuvée en commande (`POST /orders`).

## Choisir la bonne méthode HTTP
Une fois la ressource définie, l'action détermine la méthode. Utilisez `GET` pour la récupération, `POST` pour la création, `PUT` pour le remplacement complet et `PATCH` pour les modifications partielles. Par exemple, changer uniquement le statut d'une requête de 'En attente' à 'Approuvé' est une modification partielle, rendant `PATCH` approprié.

## Exemple concret : Le flux d'approbation
Supposons qu'un manager doive approuver une demande.
**Requête :** `PATCH /purchase-requests/REQ-123` 
**Corps :** `{"status": "APPROVED"}`
**Résultat :** Le serveur renvoie `200 OK` avec la représentation mise à jour ou `204 No Content`. Si la requête était déjà annulée, le serveur doit renvoyer `409 Conflict` car la transition d'état est invalide.

## Erreur courante : Endpoints de style RPC
Évitez de nommer vos endpoints comme `/approveRequest` ou `/updateUser`. C'est du style RPC (Remote Procedure Call), pas du REST. 
**Correction :** Utilisez `/purchase-requests/{id}` avec la méthode `PATCH`. L'approbation est un changement d'état de la ressource, pas une action isolée.

## Exercice pratique
Si vous devez permettre à un acheteur de supprimer une commande erronée, quel endpoint et quelle méthode utiliseriez-vous ?

**Réponse :** `DELETE /orders/{id}`. Cela supprime la ressource et doit être idempotent, ce qui signifie que répéter l'appel ne change plus l'état après la première suppression.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
