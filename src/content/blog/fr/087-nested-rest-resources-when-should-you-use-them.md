---
title: "Ressources REST Imbriquées : Quand les Utiliser ?"
description: "Un guide pour choisir entre des structures d'URI imbriquées ou plates pour gérer des entités liées dans une API REST."
pubDate: 2026-10-10T06:48:00.000Z
translationKey: 087-nested-rest-resources-when-should-you-use-them
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'approvisionnement. Vous avez des `Requests` (demandes) et des `Items` (articles). Un dilemme courant est de savoir si un article doit être accédé via `/items/{id}` ou `/requests/{requestId}/items/{itemId}`. Si vous imbriquez trop, vos URLs deviennent monstrueuses ; si vous ne le faites pas assez, vous perdez la hiérarchie intuitive de vos données.

## La Logique de l'Imbrication
L'imbrication est utilisée pour représenter une relation de type 'appartient à' ou 'parent-enfant'. Vous devez utiliser des ressources imbriquées lorsqu'une entité enfant ne peut exister indépendamment du parent ou lorsque la relation est le moyen principal de découvrir les données. Dans notre application, un `Item` n'a de sens qu'à l'intérieur d'une `Request`.

## Quand Rester à Plat
Évitez l'imbrication lorsque la ressource est un citoyen de premier plan. Si un gestionnaire doit rechercher tous les `Items` de toutes les `Requests` pour analyser les dépenses, une structure plate comme `/items?type=laptop` est plus efficace. Une bonne règle est de limiter l'imbrication à un seul niveau. Au-delà de `/parents/{id}/children`, l'API devient fragile.

## Exemple Concret : Flux d'Approvisionnement
Considérons un demandeur ajoutant un article à une demande d'achat.

**Requête :** `POST /requests/101/items` 
**Corps :** `{"product": "Clavier Mécanique", "qty": 1}`
**Résultat :** Le serveur crée l'article lié à la demande 101 et renvoie `201 Created` avec un en-tête `Location: /requests/101/items/505`.

Pour modifier cet article spécifique :
`PATCH /requests/101/items/505` 
**Corps :** `{"qty": 2}`

## Erreur Courante : L'Imbrication Excessive
Une erreur fréquente consiste à créer des chemins comme `/departments/5/managers/2/requests/101/items/505`. Cela oblige le client à connaître chaque ID parent simplement pour mettre à jour un article.

**Correction :** Utilisez le chemin imbriqué pour la création et la découverte, mais utilisez un chemin plat pour la manipulation directe : `PATCH /items/505`. Cela garde l'API propre tout en préservant la relation lors de la navigation initiale.

## Exercice Pratique
Scénario : Vous avez des `Orders` (commandes) et des `Shipments` (expéditions). Une expédition appartient toujours à une commande. Comment concevoir le point de terminaison pour lister toutes les expéditions d'une commande spécifique ?

**Réponse :** L'URI idéale est `GET /orders/{orderId}/shipments` car elle définit clairement la relation.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
