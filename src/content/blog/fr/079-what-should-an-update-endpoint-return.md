---
title: "Que doit retourner un point de terminaison UPDATE ?"
description: "Un guide sur le choix des codes d'état HTTP et des corps de réponse lors de la modification de ressources dans une API REST."
pubDate: 2026-10-09T22:48:00.000Z
translationKey: 079-what-should-an-update-endpoint-return
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous venez de terminer l'implémentation d'une fonctionnalité où un manager approuve une demande d'achat. La logique fonctionne, la base de données est mise à jour, mais vous hésitez sur l'instruction de retour : devez-vous renvoyer l'objet mis à jour, un simple message de succès ou rien du tout ? Un mauvais choix peut entraîner un trafic réseau inutile ou forcer le frontend à effectuer des appels API redondants.

## Le dilemme entre 200 OK et 204 No Content
Lorsqu'une mise à jour réussit, les deux choix les plus courants sont `200 OK` et `204 No Content`. Utilisez `200 OK` lorsque le client a besoin de l'état actuel de la ressource immédiatement. C'est utile si le serveur calcule des champs, comme un horodatage `updatedAt` ou un changement de statut de 'En attente' à 'Approuvé'. Utilisez `204 No Content` quand le client connaît déjà l'état final et n'a pas besoin que le serveur renvoie les données, optimisant ainsi la bande passante.

## Gérer PUT et PATCH
Bien que les deux modifient des ressources, leur sémantique diffère. Un `PUT` remplace généralement la ressource entière. Si la ressource n'existait pas et que l'API permet la création via PUT, un `201 Created` est approprié. Un `PATCH` applique des modifications partielles. Comme PATCH n'est pas intrinsèquement idempotent, renvoyer la représentation complète via `200 OK` est souvent préférable pour confirmer exactement ce qui a changé.

## Gestion des erreurs et des conflits
Toute mise à jour ne réussit pas. Si l'utilisateur n'est pas autorisé à approuver une demande, renvoyez `403 Forbidden`. Si l'ID de la demande est introuvable, `404 Not Found` est la norme. Un code crucial pour les mises à jour est `409 Conflict`. Cela arrive si la ressource a été modifiée par un autre utilisateur depuis la dernière lecture, évitant ainsi l'écrasement accidentel de données.

## Exemple concret : Approbation d'achat
Imaginons un point de terminaison `PATCH /requests/{id}` pour approuver un achat.

**Requête :**
`PATCH /requests/123` 
`{ "status": "APPROVED" }`

**Réponse (200 OK) :**
```json
{
  "id": 123,
  "status": "APPROVED",
  "approvedBy": "manager_01",
  "updatedAt": "2023-10-27T10:00:00Z"
}
```
Résultat : Le frontend met à jour l'interface instantanément avec l'horodatage généré par le serveur.

## Erreur courante : La chaîne "Success" en 200
Beaucoup de développeurs renvoient `200 OK` avec un corps tel que `{"message": "Mis à jour avec succès"}`. C'est une erreur car cela n'apporte aucune donnée structurelle sur la ressource. Renvoyez soit la représentation de la ressource, soit utilisez `204 No Content`.

## Exercice pratique
Si vous implémentez une requête `PUT` qui remplace le profil d'un utilisateur et que vous voulez indiquer que la mise à jour a réussi sans renvoyer de données, quel code d'état utilisez-vous ?

**Réponse :** `204 No Content`.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
