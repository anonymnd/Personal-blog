---
title: "Should DELETE Return 200 or 204 ?"
description: "Un guide pour choisir le code d'état HTTP correct lors de l'implémentation d'un point de terminaison DELETE dans une API REST."
pubDate: 2026-10-09T23:48:00.000Z
translationKey: 080-should-delete-return-200-or-204
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développez un système d'approvisionnement. Un gestionnaire supprime une demande d'achat en attente. Le frontend envoie une requête DELETE, mais le développeur hésite entre un code 200 OK avec un message de confirmation ou un 204 No Content. Ce choix influence la manière dont le client traite la réponse et la cohérence globale de l'API.

## Comprendre le 204 No Content
Le code d'état 204 est le choix le plus fréquent pour les opérations DELETE. Il indique explicitement au client que l'action a réussi, mais qu'il n'y a aucune représentation à renvoyer dans le corps de la réponse. C'est efficace car cela réduit la bande passante et signale clairement que la ressource a disparu.

## Comprendre le 200 OK
Un code 200 OK est approprié lorsque l'API doit renvoyer un corps de réponse. Cela peut inclure un message de statut, une copie de l'entité supprimée pour permettre une annulation, ou un résumé de l'opération. Si votre application d'approvisionnement doit préciser à l'utilisateur quel ID de demande a été supprimé, le 200 est préférable.

## Exemple concret : Demande d'approvisionnement
Considérons une requête pour supprimer un bon de commande :
`DELETE /api/orders/ORD-123`

**Scénario A (204 No Content) :**
Réponse : `HTTP/1.1 204 No Content`
Résultat : Le client sait que la commande est supprimée et retire simplement l'élément de la liste dans l'interface.

**Scénario B (200 OK) :**
Réponse : `HTTP/1.1 200 OK`
Corps : `{"message": "La commande ORD-123 a été supprimée avec succès", "deletedAt": "2023-10-27T10:00Z"}`
Résultat : Le client affiche une notification de succès spécifique en utilisant le message renvoyé.

## Erreur courante : Confondre idempotence et codes de réponse
Une erreur classique consiste à penser que parce que DELETE est idempotent, il doit toujours renvoyer le même code. L'idempotence signifie que l'état du serveur reste le même après plusieurs appels, et non que la réponse doit être identique. Par exemple, le premier DELETE peut renvoyer 204, tandis que les appels suivants pour le même ID renvoient 404 Not Found. C'est tout à fait valide.

## Exercice pratique
Si votre API supprime un profil utilisateur et renvoie l'adresse e-mail de l'utilisateur supprimé dans le corps de la réponse pour confirmer l'action, quel code d'état devez-vous utiliser ?

**Réponse :** 200 OK, car un corps de réponse est renvoyé.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
