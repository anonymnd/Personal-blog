---
title: "Pourquoi le JWT est appelé Authentification Stateless"
description: "Une exploration de la manière dont les JSON Web Tokens éliminent le besoin de stockage de session côté serveur pour vérifier l'identité."
pubDate: 2026-10-15T01:48:00.000Z
translationKey: 202-why-jwt-is-called-stateless-authentication
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imaginez que vous développez une application d'achats où un manager approuve des demandes. Dans un système traditionnel, quand le manager se connecte, le serveur crée une session en mémoire et lui donne un ID de session. À chaque clic sur 'Approuver', le serveur doit rechercher cet ID dans sa base de données ou sa RAM pour savoir qui il est. Avec des milliers d'utilisateurs, cette consommation mémoire devient un goulot d'étranglement.

## Le Mécanisme du Stateless
Le JWT (JSON Web Token) change la donne en déplaçant l'état du serveur vers le client. Au lieu d'un ID aléatoire, le serveur émet un jeton signé contenant l'identité et les permissions (claims). Comme le jeton est signé numériquement, le serveur n'a pas besoin de le stocker. Il valide simplement la signature avec une clé secrète. Si la signature est correcte et la date d'expiration n'est pas dépassée, le serveur fait confiance aux informations.

## Exemple Concret : Le Flux d'Approbation
1. **Connexion** : Le manager se connecte. Le serveur crée un JWT : `{ "user": "manager1", "role": "APPROVER", "exp": 1715000000 }`.
2. **Signature** : Le serveur signe cela avec une clé secrète : `HS256(payload, secret)`.
3. **Requête** : Le manager appelle `/approve-order` avec le header `Authorization: Bearer <token>`.
4. **Validation** : Le serveur reçoit le jeton, vérifie la signature et le claim `exp`. Si c'est valide, la commande est approuvée.

## Erreur Courante : Faire Confiance aux Données Décodées
Une erreur fréquente est de décoder le payload du JWT pour récupérer l'ID utilisateur avant de vérifier la signature. Les JWT sont généralement encodés en Base64 (pas cryptés). N'importe qui peut modifier le contenu. Il faut toujours vérifier la signature en premier, sinon un utilisateur pourrait changer son rôle de `REQUESTER` à `APPROVER` manuellement.

## Le Compromis de la Révocation
Le côté stateless a un prix : on ne peut pas 'tuer' un jeton facilement. Si le compte d'un manager est compromis, le jeton reste valide jusqu'à son expiration. Pour pallier cela, on utilise souvent des Access Tokens à courte durée et des Refresh Tokens stockés en base, réintroduisant un peu d'état pour la sécurité.

## Exercice Pratique
**Scénario** : Un JWT a une signature valide, mais le timestamp `exp` date d'hier. Le serveur doit-il accepter la requête ?

**Réponse** : Non. La validation de la signature prouve seulement que le jeton n'a pas été modifié ; le serveur doit aussi vérifier le claim d'expiration.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
