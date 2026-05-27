---
title: "Méthodes HTTP et Réponses Succès : Guide Cohérent"
description: "Analyse approfondie des sémantiques de sécurité et d'idempotence pour POST, PUT, PATCH et DELETE via une API de playlists."
pubDate: 2026-10-07T08:48:00.000Z
translationKey: 076-get-post-put-patch-and-delete-explained-properly
seriesOrder: 17
locale: fr
tags: ["rest-api","learning-series"]
draft: false
---

## Sémantique de Sécurité et d'Idempotence

La sécurité décrit l’opération demandée : un GET ne doit pas demander une modification de playlist, même si des journaux sont écrits. L’idempotence concerne l’effet attendu de répétitions, pas des réponses identiques ni l’absence de logs. PUT et DELETE sont idempotents par leur sémantique ; POST ne le garantit pas, mais une API peut définir une déduplication. PATCH dépend de l’opération et du format du patch.
## L'API Playlist : Exemple Concret

Considérons une ressource Playlist. Le client possède la représentation de la playlist (titre, description et liste d'IDs de pistes).

### 1. Création (POST)
Lorsqu'un client crée une playlist, il envoie un `POST` vers `/playlists`. Le serveur attribue l'ID.

**Requête :** `POST /playlists`
**Corps :** `{"title": "Chill Vibes", "tracks": [101, 102]}`

**Réponse Succès :** `201 Created`.
Le serveur doit impérativement inclure un en-tête `Location` : `Location: /playlists/789`. Cela indique au client où se trouve exactement la nouvelle ressource.

### 2. Remplacement Complet (PUT)
`PUT` est utilisé pour remplacer l'intégralité de la ressource cible. Le client envoie la représentation complète mise à jour.

**Requête :** `PUT /playlists/789`
**Corps :** `{"title": "Chill Vibes Updated", "tracks": [101, 102, 103]}`

**Réponse Succès :** `200 OK` (en retournant la playlist mise à jour) ou `204 No Content` (si le client n'a pas besoin du corps).

### 3. Modification Partielle (PATCH)
`PATCH` est utilisé pour des modifications. Contrairement à `PUT`, le client n'envoie que les champs à modifier.

**Requête :** `PATCH /playlists/789`
**Corps :** `{"title": "Midnight Jazz"}`

**Réponse Succès :** `200 OK` avec la représentation modifiée.

### 4. Suppression (DELETE)
`DELETE` supprime la ressource identifiée par l'URI.

**Requête :** `DELETE /playlists/789`
**Réponse Succès :** `204 No Content`. C'est le standard pour les suppressions réussies sans retour de corps.

## Contraste : L'Idempotence en Action

Avec un format de patch documenté qui affecte un titre, répéter la modification a le même effet attendu. JSON Patch utilise application/json-patch+json et un tableau d’opérations. Pour ajouter en fin de tracks, utilisez /- :

```json
[{"op":"add","path":"/tracks/-","value":104}]
```

La répétition ajoute un autre morceau si les doublons sont autorisés. Un add sur /tracks remplacerait le membre entier plutôt que d’ajouter dans son tableau ; distinguez ces chemins.
## Traitement Asynchrone (202 Accepted)
Si la création d'une playlist nécessite un traitement lourd (ex: valider 1 000 pistes via une base de droits d'auteur), le serveur ne doit pas maintenir la connexion ouverte. Il retourne alors `202 Accepted`. Cela indique que la requête est valide et a été acceptée pour traitement, mais que le résultat final n'est pas encore connu. La réponse inclut généralement un en-tête `Location` pointant vers une URI de suivi du statut.

## Tableau Récapitulatif des Réponses Succès

| Statut | Signification | Cas d'utilisation typique |
| :--- | :--- | :--- |
| 200 OK | Succès | Résultats `GET`, mises à jour `PUT`/`PATCH` avec corps |
| 201 Created | Ressource Créée | Création `POST`, création `PUT` (si autorisé) |
| 202 Accepted | Traitement Lancé | Tâches longues, jobs asynchrones |
| 204 No Content | Succès, Sans Corps | Succès `DELETE`, mise à jour `PUT` sans corps |

## Exercice Ciblé

**Scénario :** Vous concevez un endpoint pour « Archiver » une playlist. L'archivage est une transition métier qui marque la playlist comme inactive mais conserve les données. Vous voulez que l'opération soit idempotente.

1. Quelle méthode HTTP utiliseriez-vous si vous traitez « archived » comme une propriété de la ressource ?
2. Quel code de statut retourneriez-vous si la playlist était déjà archivée et qu'aucun changement n'a eu lieu ?
3. Si le processus d'archivage déclenche un nettoyage de fichiers en cache qui prend 30 secondes, quel code de statut est le plus approprié ?

**Réponse :**
1. `PATCH` (pour mettre à jour le statut `archived` à `true`) ou `PUT` (si on envoie la représentation complète).
2. `200 OK` ou `204 No Content`. Comme la méthode est idempotente, l' *effet* est le même (elle est archivée), donc la requête est réussie même si aucun changement d'état n'a eu lieu lors de cet appel précis.
3. `202 Accepted`.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
