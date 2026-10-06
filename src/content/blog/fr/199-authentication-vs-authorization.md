---
title: "Authentication vs Authorization"
description: "Un guide clair pour distinguer la vérification de l'identité de la gestion des permissions d'accès dans les applications sécurisées."
pubDate: 2026-10-14T22:48:00.000Z
translationKey: 199-authentication-vs-authorization
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imaginez que vous entriez dans un immeuble de bureaux sécurisé. Le gardien vous demande votre carte d'identité pour prouver qui vous êtes ; c'est l'authentification. Une fois à l'intérieur, vous essayez d'entrer dans la salle des serveurs, mais votre badge n'ouvre que la salle de pause ; c'est l'autorisation.

## La différence fondamentale
L'authentification (AuthN) est le processus de vérification qu'un utilisateur est bien celui qu'il prétend être. Elle se concentre sur l'identité via des mots de passe ou la biométrie. L'autorisation (AuthZ), quant à elle, détermine ce qu'un utilisateur authentifié a le droit de faire. Elle se concentre sur les permissions et le contrôle d'accès.

## Mécanisme dans les applications modernes
Dans une application Java moderne utilisant Jakarta EE, ces processus s'appuient souvent sur des JSON Web Tokens (JWT). Lors de la connexion, le serveur authentifie l'utilisateur et émet un JWT. Ce jeton contient des 'claims' (revendications), comme l'ID de l'utilisateur et son rôle (ex: `ROLE_MANAGER`). Le serveur valide la signature numérique du jeton pour s'assurer qu'il n'a pas été modifié, évitant ainsi des requêtes constantes en base de données.

## Exemple avec une application d'achats
Considérons un système de gestion d'achats :
- **Authentification** : L'utilisateur saisit son email et son mot de passe. Le système vérifie le hachage du mot de passe (via BCrypt ou Argon2id) et accorde l'accès.
- **Autorisation** : 
    - Un **Demandeur** peut créer une demande mais ne peut pas l'approuver.
    - Un **Manager** peut voir les demandes de son équipe et cliquer sur 'Approuver'.
    - Un **Acheteur** peut marquer la demande comme 'Commandée'.
Si un Demandeur tente d'appeler l'endpoint `/api/approve`, le système renvoie une erreur `403 Forbidden` car il manque d'autorisation, bien qu'il soit authentifié.

## Erreur courante : Faire confiance aux jetons décodés
Une erreur fréquente consiste à décoder un JWT et à faire confiance aux informations qu'il contient sans vérifier la signature. Si vous vous contentez de décoder le base64, un utilisateur malveillant pourrait changer son rôle de `USER` à `ADMIN`. Il faut impérativement valider la signature, l'émetteur et la date d'expiration.

## Exercice pratique
Scénario : Un utilisateur est connecté mais reçoit une erreur '403 Forbidden' en essayant de supprimer un enregistrement. S'agit-il d'un échec d'authentification ou d'autorisation ?

**Réponse** : C'est un échec d'autorisation. L'utilisateur est déjà connecté (authentifié), mais il n'a pas la permission (autorisation) d'effectuer l'action de suppression.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
