---
title: "Qu'y a-t-il à l'intérieur d'un JWT ?"
description: "Une analyse approfondie des trois composants d'un JSON Web Token et de leur rôle dans la communication sans état."
pubDate: 2026-10-15T00:48:00.000Z
translationKey: 201-what-is-inside-a-jwt
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un gestionnaire approuve une demande. Une fois connecté, le serveur ne veut pas interroger la base de données à chaque clic sur 'Approuver' pour vérifier l'identité du gestionnaire. C'est là qu'intervient le JSON Web Token (JWT). Il fonctionne comme une carte d'identité numérique que le client présente au serveur.

## La Structure en Trois Parties
Un JWT n'est pas un bloc de données unique, mais une chaîne divisée en trois parties séparées par des points : `En-tête.Charge utile.Signature`. Chaque partie est encodée en Base64Url, ce qui signifie qu'elle semble illisible mais peut être facilement décodée.

## L'En-tête (Header) : Les Métadonnées
L'en-tête contient généralement deux informations : le type de jeton (JWT) et l'algorithme de signature utilisé, comme HMAC SHA256 (HS256) ou RSA. Cela indique au serveur comment vérifier la signature.

## La Charge Utile (Payload) : Les Revendications
C'est le cœur du jeton. Elle contient des 'claims' (revendications), qui sont des affirmations sur l'utilisateur. Dans notre application d'achats, la charge utile pourrait ressembler à ceci :

```json
{
  "sub": "1234567890",
  "name": "Ahmed Manager",
  "role": "MANAGER",
  "exp": 1715456000
}
```
Le `sub` (sujet) est l'ID utilisateur et `exp` (expiration) est l'horodatage. Attention : ces données sont encodées, pas cryptées. N'importe qui peut lire le rôle et le nom.

## La Signature : Le Sceau de Sécurité
Pour empêcher un utilisateur de changer son rôle de `EMPLOYE` à `MANAGER`, le serveur crée une signature. Il combine l'en-tête encodé, la charge utile encodée et une clé secrète connue seulement du serveur. Si un seul caractère change, la signature devient invalide.

## Erreur Courante : Faire Confiance aux Données Décodées
Certains développeurs décodent la charge utile et utilisent immédiatement le `role` pour donner accès. **C'est une faille de sécurité majeure.** Vous devez vérifier la signature avec la clé secrète *avant* de faire confiance à toute information du payload.

## Exercice Pratique
Si un JWT a un payload `{"role": "USER"}` et une signature générée avec la clé `key123`, que se passe-t-il si un pirate change le payload en `{"role": "ADMIN"}` tout en gardant la signature originale ?

**Réponse :** Le serveur recalculera la signature avec le nouveau payload et `key123`. Le résultat ne correspondra pas à la signature originale, et le serveur rejettera le jeton.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
