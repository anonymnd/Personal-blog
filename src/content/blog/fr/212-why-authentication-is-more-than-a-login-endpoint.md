---
title: "Pourquoi l'authentification est plus qu'un simple point de terminaison de connexion"
description: "Découvrez les couches critiques de la gestion d'identité au-delà de la vérification initiale des identifiants, en mettant l'accent sur le cycle de vie des jetons."
pubDate: 2026-10-15T11:48:00.000Z
translationKey: 212-why-authentication-is-more-than-a-login-endpoint
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs commencent leur parcours en sécurité par la création d'un endpoint `/login` qui vérifie un mot de passe. Cependant, ce n'est que la 'porte d'entrée'. Le vrai défi commence après l'identification : comment maintenir cette identité de manière sécurisée sur des milliers de requêtes sans redemander le mot de passe ?

## Le cycle de vie du jeton
Une fois l'utilisateur authentifié, on émet généralement un JSON Web Token (JWT). Une erreur courante est de croire que les JWT sont chiffrés ; en réalité, ils sont souvent simplement signés. Cela signifie que n'importe qui peut décoder le contenu, mais personne ne peut le modifier sans briser la signature. Votre backend doit impérativement valider l'algorithme, l'émetteur, l'audience et la date d'expiration avant de faire confiance aux données du jeton.

## Authentification vs Autorisation
L'authentification confirme *qui* est l'utilisateur, mais l'autorisation décide de *ce qu'il peut faire*. Dans une application d'achats, l'authentification permet d'entrer dans le système. L'autorisation garantit qu'un demandeur ne peut pas approuver sa propre demande d'achat, et qu'un acheteur ne peut pas modifier le budget d'un département qu'il ne gère pas.

## Le piège du hachage des mots de passe
Le stockage des mots de passe nécessite un hachage unidirectionnel avec sel, et non un chiffrement. Bien que BCrypt soit courant dans les applications Spring, il a une limite d'entrée de 72 octets. Pour les nouveaux systèmes, l'OWASP recommande Argon2id pour ralentir les attaques par force brute.

## Exemple concret : Validation de jeton
Imaginez un flux de demande d'achat. L'utilisateur envoie une requête à `/api/requests/123` avec un jeton Bearer.

```java
// Extrait illustratif de la logique de validation
public boolean validateToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
    
    return !claims.getExpiration().before(new Date()) 
           && "procurement-app".equals(claims.getIssuer());
}
```
Résultat : Si le jeton est expiré ou si la signature est falsifiée, la requête est rejetée avec un code 401 Unauthorized.

## Erreur courante : L'illusion de la déconnexion
Certains pensent que supprimer un JWT du `localStorage` suffit pour déconnecter l'utilisateur. Comme les JWT sont sans état (stateless), le jeton reste valide sur le serveur jusqu'à son expiration. Pour une révocation réelle, il faut utiliser une liste noire ou des jetons de rafraîchissement (refresh tokens).

## Exercice pratique
Scénario : Vous avez un JWT avec un claim `role: "USER"`. L'utilisateur modifie manuellement cela en `role: "ADMIN"` dans son navigateur. Pourquoi le serveur rejette-t-il toujours la requête ?

**Réponse :** Parce que le serveur vérifie la signature cryptographique. Modifier le contenu sans la clé secrète rend la signature invalide.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
