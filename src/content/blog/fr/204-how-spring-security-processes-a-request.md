---
title: "Comment Spring Security traite une requête"
description: "Une analyse approfondie du DelegatingFilterProxy et de la SecurityFilterChain qui interceptent chaque requête HTTP entrante."
pubDate: 2026-10-15T03:48:00.000Z
translationKey: 204-how-spring-security-processes-a-request
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats où un demandeur soumet un bon de commande. Vous voulez vous assurer que seul un manager authentifié puisse l'approuver. Vous vous demandez peut-être : comment Spring Security 'sait-il' qui est l'utilisateur avant même que la requête n'atteigne votre @RestController ?

## Le point d'entrée : DelegatingFilterProxy
Spring Security ne réside pas nativement dans le conteneur de Servlets ; il vit dans l'ApplicationContext de Spring. Pour combler cet écart, Spring utilise le `DelegatingFilterProxy`. Il s'agit d'un filtre Servlet standard qui a un seul rôle : trouver un bean géré par Spring appelé `FilterChainProxy` et lui déléguer la requête. Cela permet à votre logique de sécurité de bénéficier de l'injection de dépendances de Spring.

## Le cœur : FilterChainProxy et SecurityFilterChain
Le `FilterChainProxy` agit comme un coordinateur. Il gère un ou plusieurs instances de `SecurityFilterChain`. Lorsqu'une requête arrive, Spring vérifie quelle chaîne correspond à l'URL de la requête. Chaque chaîne contient une liste de filtres ordonnés (comme `UsernamePasswordAuthenticationFilter` ou `JwtAuthenticationFilter`).

## Le mécanisme : Authentification et SecurityContext
Alors que la requête traverse les filtres, l'un d'eux est chargé d'extraire les identifiants (comme un JWT ou un cookie de session). Il transmet ceux-ci à un `AuthenticationManager`. Si les identifiants sont valides, un objet `Authentication` est créé et stocké dans le `SecurityContextHolder`. Ce contexte est la 'source de vérité' pour tout le reste du cycle de vie de la requête.

## Exemple concret : Approbation d'achat
Considérons une requête vers `POST /orders/approve`.
1. **Étape Filtre** : Un filtre JWT extrait le jeton, valide la signature et l'expiration, et identifie l'utilisateur 'Manager_Ali'.
2. **Étape Contexte** : Le `SecurityContext` est rempli avec `Authentication(principal=Manager_Ali, authorities=[ROLE_MANAGER])`.
3. **Étape Autorisation** : Le `AuthorizationFilter` vérifie si l'utilisateur actuel possède le `ROLE_MANAGER`. C'est le cas, la requête continue vers le Contrôleur.

## Erreur courante : Confondre Authentification et Autorisation
Une erreur fréquente est de supposer que parce qu'un utilisateur est authentifié (connecté), il est autorisé à effectuer n'importe quelle action. Par exemple, un 'Demandeur' peut être authentifié, mais il ne devrait pas pouvoir accéder au point de terminaison `/orders/approve`. Définissez toujours des contrôles d'accès basés sur les rôles (RBAC) après l'étape d'authentification.

## Exercice pratique
Si une requête contourne la `SecurityFilterChain` à cause d'une configuration permitAll(), le `SecurityContextHolder` contiendra-t-il les détails de l'utilisateur ?

**Réponse** : Non. Si la requête est autorisée sans authentification, les filtres qui remplissent le `SecurityContext` sont soit ignorés, soit ne trouvent pas d'identifiants, laissant le contexte vide.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
