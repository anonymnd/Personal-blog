---
title: "Que fait réellement @RequestBody ?"
description: "Une analyse approfondie de la manière dont Spring Boot transforme les corps de requêtes HTTP en objets Java via les convertisseurs de messages."
pubDate: 2026-10-09T07:48:00.000Z
translationKey: 064-what-does-requestbody-actually-do
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achat. Un demandeur envoie un objet JSON contenant le nom de l'article et la quantité. Vous voyez les données dans Postman, mais dans votre contrôleur Java, vous manipulez un objet `PurchaseRequest`. Comment le texte brut d'un paquet réseau devient-il soudainement un objet Java typé ? C'est là qu'intervient `@RequestBody`.

## Le mécanisme de désérialisation
Lorsque vous annotez un paramètre de méthode de contrôleur avec `@RequestBody`, vous indiquez à Spring : "Ne cherche pas ces données dans les paramètres d'URL ou les en-têtes ; regarde dans le corps de la requête HTTP." Spring ne fait pas cela seul. Il utilise un modèle de stratégie appelé `HttpMessageConverter`. Par défaut, Spring Boot inclut la bibliothèque Jackson. Lorsqu'une requête arrive avec `Content-Type: application/json`, Spring utilise le `MappingJackson2HttpMessageConverter` pour lire le flux d'entrée et mapper les clés JSON aux champs Java.

## Exemple concret : Demande d'achat
Considérons un scénario où un utilisateur soumet une nouvelle demande d'achat. Le JSON envoyé est `{"item": "Laptop", "quantity": 1}`.

```java
@PostMapping("/requests")
public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("Demande reçue pour " + request.getItem());
}

// DTO utilisant un Record Java pour l'immuabilité
public record PurchaseRequest(String item, int quantity) {}
```

**Résultat :** Spring lit le JSON, instancie le record `PurchaseRequest` et l'injecte dans la méthode. Si les clés JSON correspondent aux composants du record, l'objet est entièrement rempli.

## Erreur courante : Absence de getters ou de constructeur par défaut
Les développeurs utilisent souvent des classes standards au lieu de records, mais oublient d'ajouter un constructeur sans argument. Comme Jackson instancie généralement l'objet avant de définir les champs par réflexion, l'absence de constructeur provoquera une `HttpMessageNotReadableException`.

**Correction :** Utilisez des Java Records (comme ci-dessus) ou assurez-vous que votre POJO possède un constructeur public sans argument et des getters/setters appropriés.

## Validation et Liaison
`@RequestBody` gère uniquement la conversion. Si le JSON est `{"item": "", "quantity": -5}`, Spring créera quand même l'objet car le JSON est syntaxiquement valide. Pour éviter cela, vous devez coupler `@RequestBody` avec `@Valid` de l'API Jakarta Bean Validation.

## Exercice pratique
Si un client envoie une requête avec `Content-Type: text/plain` mais que votre contrôleur utilise `@RequestBody` pour un objet Java, que se passe-t-il ?

**Réponse :** Spring renverra une erreur `415 Unsupported Media Type` car il ne trouvera pas de `HttpMessageConverter` capable de transformer du texte brut en objet Java structuré.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
