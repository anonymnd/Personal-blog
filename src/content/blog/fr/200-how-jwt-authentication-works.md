---
title: "Comment fonctionne l'authentification JWT"
description: "Une analyse approfondie de la nature sans état des JSON Web Tokens et de la sécurisation des communications API modernes."
pubDate: 2026-10-14T23:48:00.000Z
translationKey: 200-how-jwt-authentication-works
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement où un demandeur soumet une demande d'achat. Après la connexion, le serveur doit se souvenir de l'identité de l'utilisateur pour chaque requête suivante sans interroger la base de données à chaque fois. C'est là qu'interviennent les JSON Web Tokens (JWT), qui résolvent la gestion des sessions de manière stateless.

## L'anatomie d'un jeton
Un JWT n'est pas un identifiant de session, mais un conteneur d'informations portable. Il se compose de trois parties séparées par des points : le Header (algorithme et type), le Payload (revendications comme `userId` ou `role`), et la Signature. La signature est l'élément crucial, créée en hachant le header et le payload avec une clé secrète connue uniquement du serveur.

## Le flux d'authentification
Lorsqu'un utilisateur se connecte, le serveur vérifie ses identifiants. Au lieu de créer une session en mémoire, le serveur génère un JWT et le renvoie au client. Le client stocke ce jeton et l'ajoute à l'en-tête `Authorization: Bearer <token>` pour les requêtes futures. Le serveur valide ensuite la signature pour s'assurer que le jeton n'a pas été modifié, vérifie la date d'expiration (`exp`) et confirme l'émetteur (`iss`).

## Exemple concret : Approbation d'achat
Considérons un Manager approuvant une demande. Le payload du JWT pourrait ressembler à ceci :
```json
{
  "sub": "manager_123",
  "role": "MANAGER",
  "exp": 1715600000
}
```
Lorsque le Manager appelle `/approve/request/45`, le serveur décode le jeton. Si la signature est valide et que le `role` est `MANAGER`, l'action est autorisée. Si un utilisateur modifie manuellement son rôle en `ADMIN` dans le payload, la signature devient invalide car la clé secrète du serveur ne correspond plus au hachage du contenu modifié.

## Erreur courante : Faire confiance aux données décodées
Une erreur fréquente consiste à décoder le payload (qui est simplement du Base64) et à utiliser les données avant de vérifier la signature. Comme n'importe qui peut décoder un JWT, vous devez toujours effectuer l'étape de vérification en premier. Si vous faites confiance à l' `userId` d'un jeton non vérifié, un attaquant peut usurper n'importe quel utilisateur.

## Exercice pratique
**Scénario :** Un jeton a un payload avec `exp: 1600000000` (une date en 2020). La signature est parfaitement valide. Le serveur doit-il accepter cette requête ?

**Réponse :** Non. Même si la signature est valide, le jeton a expiré. Le serveur doit le rejeter et demander à l'utilisateur de se reconnecter.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
