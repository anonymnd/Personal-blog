---
title: "How to Name REST API Endpoints"
description: "Un guide pratique pour concevoir des URL intuitives et orientées ressources pour des services REST professionnels."
pubDate: 2026-10-09T18:48:00.000Z
translationKey: 075-how-to-name-rest-api-endpoints
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Beaucoup de développeurs commencent par nommer leurs points de terminaison comme `/getAllRequests` ou `/updateOrder`, traitant l'URL comme un appel de fonction. Cette approche mène à une API encombrée et difficile à maintenir car chaque nouvelle action nécessite un nom unique.

## Privilégier les Noms aux Verbes
En REST, l'URL doit représenter l'objet (la ressource), tandis que la méthode HTTP représente l'action. Au lieu de `/createRequest`, utilisez `POST /requests`. Le verbe est implicite. Utilisez toujours des noms au pluriel pour les collections afin de maintenir la cohérence. Par exemple, `/users` est préférable à `/user` car cela représente clairement une collection.

## Gérer les Hiérarchies de Ressources
Lorsqu'une ressource appartient à une autre, utilisez une structure imbriquée. Dans une application d'achat, une demande spécifique contient plusieurs articles. Au lieu de `/getRequestItems?requestId=123`, utilisez `/requests/123/items`. Cela crée un chemin logique : Collection → ID → Sous-collection.

## Exemple Concret : Flux d'Approvisionnement
Imaginons un système où un demandeur soumet une demande d'achat pour approbation.

| Action | Endpoint | Méthode | Code Succès |
| :--- | :--- | :--- | :--- |
| Soumettre Demande | `/requests` | `POST` | 201 Created |
| Voir Demande | `/requests/45` | `GET` | 200 OK |
| Approuver Demande | `/requests/45/status` | `PATCH` | 200 OK |
| Annuler Demande | `/requests/45` | `DELETE` | 204 No Content |

Extrait de requête :
`PATCH /requests/45/status` 
`{ "status": "APPROVED" }` 
Résultat : L'état de la ressource est partiellement modifié sans remplacer tout l'objet.

## Erreur Courante : L'Imbrication Excessive
Certains créent des chaînes trop longues comme `/departments/5/managers/2/requests/10/items/1`. Cela rend les URL fragiles. Si une ressource est souvent consultée directement, transformez-la en point de terminaison de premier niveau. Utilisez `/request-items/1` au lieu de la chaîne complète.

## Exercice Pratique
Comment nommeriez-vous le point de terminaison pour récupérer toutes les commandes associées à un acheteur spécifique (ID : 99) ?

**Réponse :** `GET /buyers/99/orders`

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
