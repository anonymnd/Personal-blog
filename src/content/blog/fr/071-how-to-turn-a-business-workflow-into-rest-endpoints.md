---
title: "Comment transformer un flux de travail métier en points de terminaison REST"
description: "Un guide pour mapper des processus métier réels vers un ensemble structuré de ressources et de méthodes API REST."
pubDate: 2026-10-09T14:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Beaucoup de développeurs sont bloqués lorsqu'ils ont un processus métier complexe—comme un cycle d'achat—et ne savent pas comment le traduire en API REST. L'erreur classique est de créer des points de terminaison basés sur des actions comme `/approveRequest` ou `/submitOrder`, ce qui transforme l'API en un simple appel de procédure distante plutôt qu'en un système orienté ressources.

## Identifier les ressources principales
Pour commencer, oubliez les actions et concentrez-vous sur les 'noms'. Dans un flux d'achat, la ressource principale est la `PurchaseRequest`. Le flux de travail n'est pas un point de terminaison unique ; c'est une série de transitions d'état pour cette ressource. On identifie le cycle de vie : une demande est créée, passe à l'état 'En attente', puis 'Approuvée' ou 'Refusée', et enfin 'Commandée'.

## Mapper les étapes du flux aux méthodes HTTP
Chaque étape du processus métier correspond à une méthode HTTP spécifique selon l'intention. La création d'une demande utilise `POST`. La mise à jour du statut de cette demande vers 'Approuvé' est une modification de l'état de la ressource, ce qui utilise généralement `PATCH` pour des mises à jour partielles ou `PUT` pour des remplacements complets.

## Exemple concret : Flux d'achat
Imaginons un employé demandant un ordinateur portable.

1. **Soumission** : `POST /purchase-requests` 
   - Payload : `{"item": "Laptop", "amount": 1200}`
   - Résultat : `201 Created` avec un en-tête `Location` pointant vers `/purchase-requests/123`.

2. **Approbation** : Le manager approuve la demande.
   - Requête : `PATCH /purchase-requests/123` 
   - Payload : `{"status": "APPROVED"}`
   - Résultat : `200 OK` avec la représentation mise à jour.

3. **Commande** : L'acheteur marque la demande comme commandée.
   - Requête : `PATCH /purchase-requests/123` 
   - Payload : `{"status": "ORDERED", "orderDate": "2023-10-01"}`
   - Résultat : `204 No Content` (si aucun corps n'est renvoyé).

## Gestion des conflits d'état
Les flux métier ont souvent des règles. Par exemple, une demande ne peut pas être 'Commandée' si elle n'a pas été 'Approuvée'. Si un acheteur tente de commander une demande en attente, l'API ne doit pas renvoyer une erreur générique. Utilisez `409 Conflict` pour indiquer que l'état actuel de la ressource empêche cette transition.

## Erreur courante : L'URL basée sur un verbe
Évitez les URL comme `/purchase-requests/123/approve`. C'est un piège fréquent. Considérez plutôt l'approbation comme un changement du champ `status` de la ressource. Cela maintient la cohérence de votre API et respecte la contrainte REST d'utiliser des noms pour les ressources.

## Exercice pratique
Comment modéliseriez-vous l'action d'un manager rejetant une demande dans ce système ?

**Réponse** : Utilisez `PATCH /purchase-requests/{id}` avec un payload `{"status": "REJECTED"}` et retournez `200 OK` ou `204 No Content`.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
