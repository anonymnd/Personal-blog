---
title: "CRUD n'est pas la même chose que la Logique Métier"
description: "Découvrez pourquoi mapper votre API directement sur vos opérations de base de données crée des logiciels rigides et comment séparer la gestion des ressources des règles métier."
pubDate: 2026-10-09T16:48:00.000Z
translationKey: 073-crud-is-not-the-same-thing-as-business-logic
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Vous avez une entité `PurchaseRequest`. Un débutant pourrait créer un point de terminaison `PUT /requests/{id}` qui met simplement à jour n'importe quel champ en base de données. Cependant, dans la réalité, un demandeur ne peut pas modifier le prix une fois que le manager a approuvé la demande. Si votre API n'est qu'une enveloppe CRUD (Create, Read, Update, Delete), vous finissez par accumuler des blocs `if/else` complexes dans votre méthode de mise à jour.

## Le Piège du CRUD
Le CRUD concerne la persistance des données. Il demande : « Comment stocker cet enregistrement ? ». La logique métier concerne les règles du domaine. Elle demande : « Cette action est-elle autorisée compte tenu de l'état actuel du système ? ». Lorsque vous traitez votre API comme une interface de base de données, vous exposez votre schéma interne et forcez le client à comprendre vos règles métier pour éviter les erreurs 400 ou 409.

## Approche par Ressource vs Approche par Action
Au lieu d'un `UPDATE` générique, définissez des transitions spécifiques. Pour une demande d'achat, au lieu de `PUT /requests/123` avec un champ de statut, utilisez un point de terminaison spécifique comme `POST /requests/123/approvals`. Cela signale explicitement une action métier plutôt qu'une simple modification de données.

## Exemple Concret : Le Flux d'Approbation
Considérons une demande qui nécessite l'approbation d'un manager.

**Mauvais (CRUD Pur) :**
`PUT /requests/123` 
Corps : `{"status": "APPROVED"}`
(Le serveur doit maintenant vérifier si l'utilisateur est manager et si la demande est en état 'PENDING').

**Bon (Logique Métier) :**
`POST /requests/123/approvals`
Corps : `{"managerId": "MGR-01", "comments": "Budget vérifié"}`

**Résultat :** L'API renvoie `200 OK` ou `204 No Content` en cas de succès. Si la demande était déjà approuvée, elle renvoie `409 Conflict`, indiquant une violation d'état plutôt qu'une erreur de données générique.

## Erreur Courante : Le Point de Terminaison "Dieu"
Les développeurs créent souvent un seul endpoint `PATCH` qui gère tout changement possible.
*Correction :* Séparez la logique. Utilisez `PATCH` pour des mises à jour simples (ex: changer une description) mais utilisez des endpoints d'action dédiés pour les transitions d'état (ex: `submit`, `approve`, `cancel`).

## Exercice Pratique
Dans une application d'achats, un acheteur doit marquer une demande comme 'Commandée'. Doit-on utiliser `PUT /requests/{id}` avec un changement de statut, ou `POST /requests/{id}/order` ?

**Réponse :** `POST /requests/{id}/order` est préférable car 'Commander' est un processus métier qui déclenche probablement d'autres événements (comme l'envoi d'un email au fournisseur), et non une simple mise à jour de colonne.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
