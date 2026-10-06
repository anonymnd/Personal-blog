---
title: "Qu'est-ce qu'un Filtre de Sécurité ?"
description: "Une exploration de la manière dont les filtres de sécurité interceptent les requêtes pour protéger les ressources de l'application."
pubDate: 2026-10-15T04:48:00.000Z
translationKey: 205-what-is-a-security-filter
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats où un demandeur soumet une requête, mais seul un manager peut l'approuver. Si vous vérifiez le rôle de l'utilisateur dans chaque méthode de votre couche service, votre code devient encombré et répétitif. C'est là qu'intervient le filtre de sécurité.

## Le Mécanisme d'Interception
Un filtre de sécurité est un composant situé entre la requête du client et la ressource cible du serveur. Il fonctionne sur le principe d'une « chaîne ». Lorsqu'une requête HTTP arrive, elle doit passer par une série de filtres. Le filtre de sécurité intercepte la requête, inspecte les en-têtes ou la session, et décide s'il doit laisser la requête continuer vers le contrôleur ou la bloquer immédiatement avec une réponse 401 Unauthorized ou 403 Forbidden.

## Fonctionnement concret
Dans un environnement Java utilisant Jakarta EE ou Spring Security, un filtre implémente généralement une interface spécifique. Il vérifie un identifiant, comme un JWT (JSON Web Token). Le filtre ne se contente pas de décoder le jeton ; il doit valider la signature, l'émetteur et la date d'expiration avant de faire confiance aux informations contenues dans le jeton.

## Exemple concret : Approbation d'achat
Considérons une requête vers `/api/procurement/approve`. Le filtre de sécurité intercepte l'appel :

```java
// Extrait illustratif de la logique d'un filtre
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    String token = ((HttpServletRequest) request).getHeader("Authorization");
    if (token != null && jwtProvider.validateToken(token)) {
        Claims claims = jwtProvider.getClaims(token);
        if ("MANAGER".equals(claims.get("role"))) {
            chain.doFilter(request, response); // Passage au contrôleur
            return;
        }
    }
    ((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN);
}
```
Résultat : Si un 'DEMANDEUR' tente d'accéder au point de terminaison d'approbation, le filtre l'arrête avant même que la logique métier ne soit exécutée.

## Erreur courante : Faire confiance aux données décodées
Une erreur fréquente consiste à décoder un JWT pour vérifier le rôle de l'utilisateur sans d'abord vérifier la signature cryptographique. Si vous faites confiance aux claims sans vérification, un attaquant peut simplement modifier son rôle en 'ADMIN' dans la chaîne encodée en base64 et contourner votre sécurité.

## Exercice pratique
Scénario : Vous avez un filtre qui vérifie la présence d'un cookie de session. Si le cookie est absent, il redirige vers `/login`. Si le cookie est présent mais expiré, que doit faire le filtre ?

Réponse : Le filtre doit invalider le cookie expiré et rediriger l'utilisateur vers la page de connexion avec un statut 401, garantissant que la requête n'atteigne jamais la ressource protégée.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
