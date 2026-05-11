---
title: "Que doit retourner un point de terminaison POST ?"
description: "Un guide pour choisir les codes d'état HTTP et les corps de réponse appropriés pour les requêtes POST dans la conception d'API REST."
pubDate: 2026-10-09T21:48:00.000Z
translationKey: 078-what-should-a-post-endpoint-return
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développez un système d'approvisionnement. Un utilisateur soumet une demande d'achat, mais vous hésitez : devez-vous retourner l'objet créé, un simple message de succès ou seulement un code d'état ? Un mauvais choix peut confondre les développeurs frontend et nuire à la cohérence de l'API.

## La norme : 201 Created
Lorsqu'une requête POST crée avec succès une nouvelle ressource, la réponse la plus précise est `201 Created`. Cela indique au client que le serveur a effectivement généré une nouvelle entité. Pour être totalement conforme aux principes REST, vous devez inclure un en-tête `Location` contenant l'URI de la nouvelle ressource.

## Traitement asynchrone : 202 Accepted
Dans un flux d'achat, certaines demandes nécessitent l'approbation d'un manager avant d'être finalisées. Si le serveur accepte la requête mais n'a pas encore terminé le traitement, retournez `202 Accepted`. Cela signifie que la requête est valide et mise en file d'attente, mais que le résultat final est en attente.

## Succès générique : 200 OK ou 204 No Content
Si la requête POST est utilisée pour une action (comme déclencher un calcul) plutôt que pour créer une ressource, `200 OK` est approprié. Si l'opération a réussi mais qu'il n'y a aucune donnée utile à renvoyer, utilisez `204 No Content` pour optimiser la bande passante.

## Exemple concret : Demande d'achat
Considérons le point de terminaison `/api/requests` :

**Requête :**
`POST /api/requests` 
`{ "item": "Ordinateur", "quantite": 1 }`

**Réponse réussie :**
Statut : `201 Created`
En-tête : `Location: /api/requests/123`
Corps : `{"id": 123, "statut": "EN_ATTENTE"}`

## Erreur courante : Le piège du 200 systématique
Beaucoup de développeurs retournent `200 OK` pour chaque succès. Bien que cela fonctionne, cela masque la sémantique de l'opération. Par exemple, utiliser `200` au lieu de `201` empêche le client de savoir avec certitude qu'une ressource a été persistée. Privilégiez toujours le code le plus spécifique.

## Exercice pratique
Votre application d'achat possède un point de terminaison `/api/orders/submit` qui lance un processus d'arrière-plan pour contacter des fournisseurs. Quel code d'état doit-il retourner immédiatement après avoir reçu la requête ?

**Réponse :** `202 Accepted`, car le processus est asynchrone et n'est pas encore terminé.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
