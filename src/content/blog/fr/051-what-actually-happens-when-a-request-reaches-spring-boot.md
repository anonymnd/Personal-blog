---
title: "Tracer une requête navigateur à travers Spring Boot"
description: "Analyse approfondie du cycle de vie d'une requête HTTP, du fetch du navigateur au DispatcherServlet et à la conversion des messages."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
seriesOrder: 11
locale: fr
tags: ["spring-architecture","learning-series"]
draft: false
---

## Le voyage du navigateur vers l'octet

Lorsqu'un utilisateur interagit avec un tableau de bord météo, le navigateur ne se contente pas d'"envoyer des données" ; il initie une séquence complexe d'événements réseau et de couches applicatives. Traçons deux interactions spécifiques : la récupération des relevés d'une station et l'abonnement aux alertes.

### 1. L'origine et le réseau
Quand le tableau de bord exécute `fetch('/stations/42/readings?limit=10')`, le navigateur construit une requête HTTP GET. La requête contient une ligne de départ (`GET /stations/42/readings?limit=10 HTTP/1.1`), des en-têtes (comme `Accept: application/json`) et un corps vide.

Il est crucial de comprendre que le code frontend (React/Vue/Angular) s'exécute déjà dans la mémoire du navigateur. C'est une entité logique distincte du serveur Spring Boot, même s'ils sont emballés dans le même JAR. La requête voyage via TCP/IP vers l'IP et le port du serveur (généralement 8080).

### 2. Le point d'entrée : DispatcherServlet
Une fois que les octets atteignent le serveur, le conteneur Tomcat embarqué analyse le texte brut pour créer un objet `HttpServletRequest`. Cet objet est transmis au `DispatcherServlet`, le "Contrôleur Frontal" de Spring MVC.

Le `DispatcherServlet` ne sait pas comment gérer des données météo ; il sait comment trouver quelqu'un qui le peut. Il consulte le `HandlerMapping` pour trouver une méthode de contrôleur qui correspond au schéma d'URL et à la méthode HTTP.

### 3. Liaison des entrées et extraction des paramètres
Spring doit maintenant mapper la requête HTTP brute vers des types Java. C'est là que la distinction entre Path, Query et Body devient critique.

#### Variables de chemin (`@PathVariable`)
Dans `/stations/{id}/readings`, le `{id}` fait partie de l'URI elle-même. Il identifie une ressource spécifique. Spring extrait `42` du chemin de l'URI et le convertit vers le type déclaré dans la signature de la méthode (ex: `Long`).

#### Paramètres de requête (`@RequestParam`)
La partie `?limit=10` est une chaîne de requête (query string). Celles-ci sont généralement utilisées pour le filtrage, le tri ou la pagination. Contrairement aux variables de chemin, les paramètres de requête sont optionnels ou possèdent des valeurs par défaut. Spring cherche la clé `limit` et convertit `10` en `Integer`.

#### Corps de la requête (`@RequestBody`)
Pour l'appel `POST /subscriptions`, les données ne sont pas dans l'URL. Elles sont dans le corps HTTP sous forme de chaîne JSON : `{"email": "user@example.com", "stationId": 42}`.

Spring utilise des `HttpMessageConverters` (généralement Jackson) pour effectuer la conversion. Le processus est : 
`Chaîne JSON` → `Jackson ObjectMapper` → `Record/POJO Java`.

## Exemple concret : L'API Météo

Voici comment le contrôleur est structuré pour gérer ces mécanismes. Notez l'utilisation de records Java pour les DTO afin de garantir l'immuabilité.

```java
// Contrôleur illustratif
@RestController
@RequestMapping("/stations")
public class WeatherController {

    // GET /stations/42/readings?limit=10
    @GetMapping("/{id}/readings")
    public List<Reading> getReadings(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "20") int limit) {
        // Logique pour récupérer les relevés de la station 'id' limités à 'limit'
        return List.of(new Reading(22.5, "Celsius"));
    }

    // POST /subscriptions
    @PostMapping("/subscriptions")
    public SubscriptionResponse subscribe(@RequestBody SubscriptionRequest request) {
        // Logique pour enregistrer l'abonnement
        return new SubscriptionResponse("Confirmé");
    }
}

// DTOs sous forme de records
record SubscriptionRequest(String email, Long stationId) {}
record SubscriptionResponse(String status) {}
record Reading(double value, String unit) {}
```

### Analyse du tracé
1. **Requête GET** : Le `DispatcherServlet` correspond à `/stations/{id}/readings`. Il voit `@PathVariable Long id` et extrait `42`. Il voit `@RequestParam int limit` et extrait `10`. Si `limit` était absent, il utiliserait la valeur par défaut `20`.
2. **Requête POST** : Le `DispatcherServlet` correspond à `/stations/subscriptions`. Il voit `@RequestBody`. Il vérifie l'en-tête `Content-Type: application/json`, invoque le convertisseur Jackson et instancie un record `SubscriptionRequest` avec l'email et l'ID fournis.

### Cas d'échec
- **Incohérence de type** : Si le navigateur envoie `/stations/abc/readings`, Spring ne peut pas convertir `abc` en `Long`. Cela génère une `MethodArgumentTypeMismatchException`, ce qui conduit généralement à une erreur 400 Bad Request.
- **JSON malformé** : Si le corps du POST est `{"email": "user@example.com",`, le JSON est invalide. Jackson lève une `HttpMessageNotReadableException`, entraînant également une erreur 400.
- **Paramètre requis manquant** : Si `@RequestParam` est utilisé sans `defaultValue` ni `required=false`, et que le paramètre manque dans l'URL, Spring lève une `MissingServletRequestParameterException`.

## Exercice

**Scénario** : Vous devez ajouter une fonctionnalité pour filtrer les relevés par plage de dates. L'URL doit ressembler à : `GET /stations/{id}/readings?start=2023-01-01&end=2023-01-31`.

1. Quelle annotation utiliser pour `id` ?
2. Quelle annotation utiliser pour `start` et `end` ?
3. Si l'utilisateur oublie de fournir la date de fin (`end`), comment s'assurer que l'API ne plante pas et utilise "aujourd'hui" par défaut ?

**Réponse** :
1. `@PathVariable` car l'ID de la station est un identifiant de ressource dans le chemin.
2. `@RequestParam` car les dates sont des filtres pour l'ensemble des résultats.
3. Utiliser `@RequestParam(required = false)` et gérer la valeur null dans la couche service, ou fournir une valeur par défaut dans l'annotation si le type le permet.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
