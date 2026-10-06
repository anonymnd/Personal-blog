---
title: "How to Design a Clean API Contract"
description: "Apprenez à définir une interface prévisible et évolutive entre votre client et votre serveur en utilisant les standards REST."
pubDate: 2026-10-10T02:48:00.000Z
translationKey: 083-how-to-design-a-clean-api-contract
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'approvisionnement où un demandeur soumet une demande d'achat. Si le contrat API est confus—avec des noms incohérents ou des codes de statut vagues—l'équipe frontend vous demandera sans cesse ce que signifie réellement un 'statut 200' pour une requête spécifique, ou pourquoi certains points de terminaison utilisent `userId` alors que d'autres utilisent `user_id`.

## Définir des Points de Terminaison Basés sur les Ressources
Un contrat propre commence par des noms, pas des verbes. Au lieu de `/createRequest` ou `/approveRequest`, utilisez `/requests`. L'action est définie par la méthode HTTP. Pour notre application, `POST /requests` crée une nouvelle demande, tandis que `GET /requests/{id}` la récupère. Cela rend l'API intuitive pour tout développeur.

## Maîtriser les Méthodes HTTP et l'Idempotence
Choisir la bonne méthode permet au client de connaître l'effet de son appel. `GET` est sûr et idempotent, ce qui signifie qu'il ne modifie pas l'état. `PUT` remplace l'intégralité de la ressource et est idempotent ; envoyer la même requête `PUT` dix fois produit le même état. `PATCH` est utilisé pour des modifications partielles (ex: changer seulement le statut en 'Approuvé') et n'est pas intrinsèquement idempotent. `DELETE` est idempotent concernant l'état du serveur, même si le code de réponse passe de 204 (No Content) à 404 (Not Found) après le premier appel.

## Précision des Codes de Statut
Évitez de retourner `200 OK` pour tout. Utilisez des codes spécifiques :
- `201 Created`: Après un `POST` réussi, incluant souvent un en-tête `Location`.
- `202 Accepted`: Pour un traitement asynchrone (ex: la demande est en file d'attente).
- `401 Unauthorized`: Authentification manquante ou invalide.
- `403 Forbidden`: L'utilisateur est authentifié mais n'a pas le droit d'approuver la demande.
- `409 Conflict`: La demande est déjà approuvée et ne peut être modifiée.

## Exemple Concret : Approbation de Demande
Lorsqu'un manager approuve une demande d'achat, le contrat doit ressembler à ceci :

**Requête :** `PATCH /requests/REQ-123` 
**Corps :** `{"status": "APPROVED"}`
**Réponse :** `200 OK` avec le corps de la demande mise à jour.

**Erreur Courante :** Utiliser `POST /updateRequest?id=123`.
**Correction :** Utiliser `PATCH` ou `PUT` sur l'URI de la ressource spécifique.

## Exercice Pratique
Quelle méthode HTTP et quel code de statut doivent être utilisés pour remplacer complètement les détails d'une demande d'achat existante, et quel est le résultat si l'opération réussit sans renvoyer de corps ?

**Réponse :** Utiliser `PUT`. Le code de statut doit être `204 No Content`.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
