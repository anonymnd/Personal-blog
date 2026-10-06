---
title: "PUT vs PATCH : Quelle est la réelle différence ?"
description: "Un guide clair pour choisir entre le remplacement complet d'une ressource et les mises à jour partielles dans la conception d'API REST."
pubDate: 2026-10-09T20:48:00.000Z
translationKey: 077-put-vs-patch-what-s-the-real-difference
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Un gestionnaire doit modifier une demande d'achat. S'il souhaite uniquement changer le statut de « En attente » à « Approuvé », l'API doit-elle renvoyer tout l'objet de la demande au serveur, ou seulement le champ du statut ? C'est là tout l'enjeu entre PUT et PATCH.

## Le mécanisme de PUT
PUT est conçu pour le remplacement. Lorsque vous envoyez une requête PUT, vous dites au serveur : « Prends cette représentation complète et remplace tout ce qui se trouve à cet URI par celle-ci ». Si la ressource existe, elle est écrasée. Si elle n'existe pas, certaines API permettent à PUT de la créer. Une caractéristique clé de PUT est l'idempotence : si vous envoyez la même requête PUT dix fois, l'état final du serveur reste le même que si vous l'aviez envoyée une seule fois.

## Le mécanisme de PATCH
PATCH est utilisé pour les modifications partielles. Au lieu d'envoyer l'objet entier, vous n'envoyez que les modifications. C'est plus efficace pour les ressources volumineuses. Contrairement à PUT, PATCH n'est pas intrinsèquement idempotent. Par exemple, si une requête PATCH ajoute un élément à une liste, répéter la requête pourrait ajouter le même élément plusieurs fois, modifiant l'état à chaque appel.

## Exemple concret : Demande d'achat
Considérons un objet de demande : `{ "id": 101, "item": "Laptop", "qty": 1, "status": "Pending" }`.

**Utilisation de PUT :**
Pour changer la quantité à 2, vous devez envoyer l'objet complet :
`PUT /requests/101` 
`{ "id": 101, "item": "Laptop", "qty": 2, "status": "Pending" }` 
Résultat : Le serveur remplace l'ancien enregistrement par cette nouvelle version.

**Utilisation de PATCH :**
Pour changer la quantité à 2, vous envoyez uniquement le delta :
`PATCH /requests/101` 
`{ "qty": 2 }` 
Résultat : Le serveur met à jour uniquement le champ `qty` et laisse les autres intacts.

## Erreur courante : Le PUT partiel
Une erreur fréquente consiste à utiliser PUT en n'envoyant que les champs modifiés. Si le serveur suit strictement les standards REST, une requête PUT avec seulement `{ "qty": 2 }` pourrait effacer les champs `item` et `status`, en les mettant à null car ils étaient absents du corps de remplacement. Pour corriger cela, utilisez PATCH pour les mises à jour partielles ou assurez-vous que le client récupère l'objet complet avant d'envoyer un PUT.

## Exercice pratique
Scénario : Vous devez mettre à jour l'adresse e-mail d'un utilisateur dans un profil contenant 50 champs différents. Quelle méthode est la plus appropriée et pourquoi ?

**Réponse :** PATCH, car envoyer 49 champs inchangés via PUT serait inefficace et augmenterait le risque d'écraser accidentellement des données avec des valeurs obsolètes.

## Un contrat, pas l'écrasement d'une table
PUT remplace la représentation définie par le contrat d'API, pas toutes les colonnes d'une ligne SQL. Les champs gérés par le serveur ne sont pas forcément modifiables par le client. L'idempotence concerne l'effet voulu ; chaque tentative peut être journalisée. En cas de modifications concurrentes, PUT et PATCH peuvent nécessiter un contrôle de version, par exemple un ETag avec `If-Match`, pour éviter des écrasements.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
