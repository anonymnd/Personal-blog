---
title: "Construire un Flux d'Authentification JWT avec des Frontières de Confiance Explicites"
description: "Analyse approfondie de l'émission de jetons sans état, de la validation de signature et du cycle de vie des jetons d'accès et de rafraîchissement."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 199-authentication-vs-authorization
seriesOrder: 43
locale: fr
tags: ["security","learning-series"]
draft: false
---

## Le Modèle de Confiance Stateless

Cette API fitness utilise des access tokens signés que ses instances peuvent valider sans session locale par requête. JWT n’impose pas cette architecture : refresh tokens, révocation et permissions actuelles peuvent ajouter de l’état. HMAC partage un secret entre validateurs ; une signature asymétrique utilise une clé publique côté validation et une clé privée seulement chez l’émetteur.

La signature protège l’intégrité, pas la confidentialité. Les claims encodés en base64url sont lisibles par le détenteur. Supprimer une copie client n’invalide pas une copie volée ; l’expiration courte limite la fenêtre sans offrir une révocation immédiate.
## Anatomie de la Frontière de Confiance

Pour éviter les contournements de sécurité, vous devez valider la structure et les claims du jeton avant de faire confiance aux données internes. Un JWT décodé n'est qu'une chaîne Base64 ; il n'est sécurisé qu'une fois la signature vérifiée.

### Étapes de Validation Critiques
1. **Vérification de l'Algorithme** : S'assurer que l'en-tête `alg` correspond à l'algorithme attendu (ex: HS256). Cela empêche les attaques « alg: none » où un client prétend que le jeton n'est pas signé.
2. **Vérification de la Signature** : Utiliser la clé secrète pour recalculer le HMAC et le comparer à la signature du jeton.
3. **Expiration (`exp`)** : Rejeter les jetons dont l'heure actuelle dépasse l'horodatage d'expiration.
4. **Émetteur (`iss`) et Audience (`aud`)** : Vérifier que le jeton a été émis par votre serveur d'authentification et qu'il est destiné à votre API de fitness spécifique.

## Exemple Pratique : Cycle de Vie de l'App de Fitness

Scénario : Un utilisateur se connecte pour voir son historique d'entraînement. Nous utilisons une stratégie à double jeton : un **Access Token** à courte durée de vie (15 min) et un **Refresh Token** à longue durée de vie (7 jours).

### 1. Schéma des Jetons

**Claims de l'Access Token :**
- `sub` : "user_123"
- `iss` : "fitness-auth-service"
- `aud` : "fitness-api"
- `exp` : 1715000000
- `scope` : "workout:read"

**Refresh Token :** Un UUID aléatoire à haute entropie stocké en base de données, lié à l'utilisateur et à l'appareil.

### 2. Flux de Requête (Implémentation Java Illustrative)

Nous implémentons un `JwtAuthenticationFilter` qui intercepte les requêtes vers `/api/workouts`.

```java
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenProvider tokenProvider;

    public JwtAuthenticationFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // Frontière de confiance : validation de la signature, exp, iss et aud
        Optional<UserPrincipal> principal = tokenProvider.validateAndParseToken(token);

        if (principal.isPresent()) {
            // Définit le contexte de sécurité pour la durée de cette requête
            SecurityContextHolder.getContext().setAuthentication(principal.get().getAuthentication());
        }

        filterChain.doFilter(request, response);
    }
}
```

### 3. Gestion du Cycle de Vie

- **Demande d'historique** : Le client envoie l'Access Token. Le filtre le valide → la requête réussit.
- **Expiration du jeton** : L'Access Token expire. Le serveur renvoie un 401 Unauthorized. Le client ne demande pas de reconnexion ; il envoie le **Refresh Token** au point de terminaison `/auth/refresh`.
- **Logique de rafraîchissement** : Le serveur vérifie si le Refresh Token existe en BDD et n'est pas révoqué. S'il est valide, il émet un *nouvel* Access Token.
- **Déconnexion** : Le serveur supprime le Refresh Token de la BDD. Bien que l'Access Token actuel puisse encore fonctionner quelques minutes, l'utilisateur ne peut plus en obtenir un nouveau, mettant fin à la session.

## Cas d'Échec et Conséquences

- **Fuite du Secret** : Si la clé de signature est compromise, un attaquant peut forger des jetons avec n'importe quel `sub` (ID utilisateur), accédant ainsi à n'importe quel compte.
- **Absence de Validation `exp`** : Un jeton volé devient une clé permanente pour le compte.
- **Confiance aveugle dans les Claims** : Si le code appelle `jwt.getClaims()` avant `jwt.verify()`, un attaquant peut modifier son ID utilisateur dans le payload, et le serveur traitera la requête comme si c'était cet utilisateur.

## Exercice

**Scénario** : Vous auditez une application de fitness. Le développeur utilise un seul JWT valable 30 jours. Quand l'utilisateur clique sur "Déconnexion", l'app appelle `localStorage.removeItem('token')`.

1. Pourquoi est-ce insuffisant pour la sécurité ?
2. Comment l'approche double jeton (Access/Refresh) résout-elle le problème de révocation sans rendre chaque appel API stateful ?

**Réponse** :
1. Supprimer le jeton côté client n'invalide pas le jeton sur le serveur. Si un attaquant a intercepté le jeton via XSS ou sniffing réseau, il peut continuer à l'utiliser pendant les 30 jours restants car le serveur vérifie uniquement la signature et l'expiration, pas un magasin de sessions.
2. En utilisant un Access Token à courte durée de vie (ex: 15 min), la fenêtre de vulnérabilité d'un jeton volé est réduite. Le Refresh Token est stocké en BDD ; en supprimant le Refresh Token lors de la déconnexion, le serveur empêche l'émission de nouveaux Access Tokens, révoquant ainsi l'accès une fois que le jeton court expire.

Le filtre est un extrait illustratif. Enregistrez-le au bon endroit dans SecurityFilterChain, protégez la route, traduisez l’authentification invalide en 401 avec challenge et nettoyez le contexte. Préférez un décodeur JWT maintenu au HMAC manuel. Exigez exp, iss, aud, algorithmes attendus et claims temporels adaptés avant sub/scopes. Le refresh exige expiration et révocation serveur, valeurs opaques aléatoires sûres, stockage protégé, rotation et gestion de réutilisation. Un UUID convient seulement avec une génération cryptographiquement sûre. L’authentification ne donne pas accès aux workouts d’autrui.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
