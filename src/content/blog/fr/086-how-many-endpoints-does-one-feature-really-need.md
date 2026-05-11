---
title: "De combien de points de terminaison une fonctionnalité a-t-elle réellement besoin ?"
description: "Un guide pour équilibrer la granularité de l'API en mappant les actions métier aux bonnes méthodes HTTP."
pubDate: 2026-10-10T05:48:00.000Z
translationKey: 086-how-many-endpoints-does-one-feature-really-need
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs souffrent de l'inflation des points de terminaison, créant une nouvelle URL pour chaque action, comme `/approveRequest` ou `/cancelOrder`. Cela conduit à une API fragmentée et difficile à maintenir. L'objectif est de mapper la logique métier de votre fonctionnalité aux verbes REST standards plutôt que de créer des chemins personnalisés pour chaque changement d'état.

## L'état d'esprit centré sur la ressource
Au lieu de penser en termes d'« actions », pensez en termes de « ressources ». Une fonctionnalité est généralement un ensemble d'opérations sur un objet spécifique. Si vous construisez un système d'approvisionnement, la « Demande d'achat » est votre ressource. Vous n'avez pas besoin d'un point de terminaison distinct pour chaque étape du cycle de vie ; vous modifiez simplement l'état de cette ressource.

## Mapper les actions aux méthodes
Pour déterminer le nombre de points de terminaison, mappez vos exigences selon ces modèles standards :
- **GET /requests** : Lister toutes les demandes.
- **GET /requests/{id}** : Voir une demande spécifique.
- **POST /requests** : Créer une nouvelle demande (Retourne 201 Created).
- **PUT /requests/{id}** : Remplacer toute la demande.
- **PATCH /requests/{id}** : Modifier un champ spécifique, comme changer le statut de 'En attente' à 'Approuvé'.
- **DELETE /requests/{id}** : Supprimer la demande.

## Exemple concret : Approbation d'achat
Imaginez qu'un manager doive approuver une demande. Au lieu de `/requests/{id}/approve`, utilisez une requête PATCH :

```http
PATCH /requests/123
Content-Type: application/json

{ "status": "APPROVED" }
```
**Résultat :** Le serveur met à jour le statut et renvoie un 200 OK avec l'objet mis à jour. Si la demande était déjà annulée, le serveur renvoie un 409 Conflict car la transition d'état est invalide.

## Erreur courante : L'URL d'action
Les développeurs créent souvent des points de terminaison comme `POST /requests/{id}/submit`. C'est une erreur car « soumettre » revient simplement à mettre à jour le champ statut.
**Correction :** Utilisez `PATCH /requests/{id}` avec un corps `{"status": "SUBMITTED"}`. Cela permet de garder une API concise et prévisible.

## Exercice pratique
Si vous devez implémenter une fonctionnalité où un acheteur marque une demande comme « Commandée », quelle méthode HTTP et quelle structure d'URL devriez-vous utiliser ?

**Réponse :** `PATCH /requests/{id}` avec un corps spécifiant le nouveau statut (ex: `{"status": "ORDERED"}`).

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
