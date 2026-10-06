---
title: "Que se passe-t-il quand un JWT expire ?"
description: "Comprendre le mécanisme technique de l'expiration des jetons et comment gérer la continuité de session avec les refresh tokens."
pubDate: 2026-10-15T02:48:00.000Z
translationKey: 203-what-happens-when-a-jwt-expires
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imaginez un utilisateur en train de remplir une demande d'achat complexe dans votre application. Au moment de cliquer sur 'Envoyer', le serveur renvoie une erreur 401 Unauthorized. L'utilisateur est confus car il s'est connecté il y a seulement une heure. C'est le scénario typique d'un jeton expiré.

## Le Mécanisme d'Expiration
Les JSON Web Tokens (JWT) sont sans état (stateless). Le serveur ne conserve pas de session en base de données ; il fait confiance à la revendication `exp` (expiration) présente dans le payload du jeton. Lorsqu'une requête arrive, le serveur décode le jeton, vérifie la signature et compare le timestamp Unix actuel avec la valeur `exp`. Si le temps actuel est supérieur, le jeton est mathématiquement invalide.

## Exemple avec un Flux d'Approvisionnement
Prenons une application de gestion des achats où un Demandeur soumet une requête.
1. **Connexion** : L'utilisateur reçoit un Access Token (expire dans 15 min) et un Refresh Token (expire dans 7 jours).
2. **Requête** : L'utilisateur envoie un POST vers `/api/requests` avec l'Access Token.
3. **Expiration** : Après 16 minutes, le serveur voit que `exp` est dépassé et rejette la requête.
4. **Récupération** : Le client intercepte l'erreur 401, envoie le Refresh Token vers `/api/refresh` et obtient un nouvel Access Token sans redemander le mot de passe.

## Erreur Courante : Faire Confiance au Décodage
Une erreur fréquente consiste à décoder le JWT côté client pour vérifier la date d'expiration et supposer que le jeton est valide.

**Incorrect** : `if (decoded.exp > now) { sendRequest(); }` 
**Correction** : Considérez toujours la réponse 401 du serveur comme la vérité absolue. Le serveur doit vérifier la signature avant de faire confiance à toute donnée, y compris la date d'expiration.

## Le Problème de la Déconnexion
Comme les JWT sont stateless, vous ne pouvez pas 'supprimer' un jeton côté serveur. Si un jeton expire dans 10 minutes, il reste valide pendant ce laps de temps même si l'utilisateur clique sur 'Déconnexion'. Pour pallier cela, on utilise souvent une 'liste noire' (blacklist) dans Redis pour stocker les jetons révoqués jusqu'à leur expiration naturelle.

## Exercice Pratique
**Scénario** : Un JWT a un claim `exp` de `1672531200`. L'heure actuelle du serveur est `1672531201`. Le serveur accepte-t-il la requête ?

**Réponse** : Non. L'heure actuelle est supérieure au timestamp d'expiration, donc le jeton est expiré.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
