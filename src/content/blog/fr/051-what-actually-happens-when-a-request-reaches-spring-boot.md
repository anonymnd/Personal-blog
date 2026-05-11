---
title: "Que se passe-t-il réellement lorsqu'une requête atteint Spring Boot ?"
description: "Une analyse détaillée du parcours d'une requête HTTP depuis le serveur embarqué jusqu'à votre contrôleur via le DispatcherServlet."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 051-what-actually-happens-when-a-request-reaches-spring-boot
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez créé une application d'achats où un demandeur soumet une demande d'achat. Vous cliquez sur 'Envoyer', mais vous ignorez comment ce paquet HTTP brut se transforme en objet Java dans votre `@RestController`. Beaucoup de débutants voient Spring Boot comme une boîte noire, mais c'est en réalité un pipeline orchestré.

## Le point d'entrée : Le conteneur de servlets embarqué
Lorsqu'une requête arrive, elle atteint d'abord le serveur embarqué (généralement Tomcat). Tomcat ne connaît pas vos beans Spring ; il ne connaît que les Servlets. Il dirige la requête vers le `DispatcherServlet`, qui est le 'Front Controller' de tout le framework Spring MVC. Ce servlet unique agit comme le coordinateur central.

## Handler Mapping et le Contrôleur
Une fois que le `DispatcherServlet` a la requête, il interroge le `HandlerMapping` pour trouver la destination. Il examine l'URL (ex: `/requests/submit`) et la méthode HTTP (POST) pour trouver une méthode de contrôleur annotée avec `@PostMapping`. Une fois le mapping trouvé, le `DispatcherServlet` utilise un `HandlerAdapter` pour invoquer la méthode.

## Conversion de messages avec Jackson
Avant que votre méthode de contrôleur ne s'exécute, Spring doit convertir le corps JSON en objet Java. C'est là qu'interviennent les `HttpMessageConverters`. Par défaut, Spring Boot utilise la bibliothèque Jackson pour lier les champs JSON à un Record Java ou un POJO.

```java
// Extrait illustratif d'un DTO de demande d'achat
public record PurchaseRequest(String item, int quantity, double price) {}

@PostMapping("/requests/submit")
public ResponseEntity<String> submit(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("Demande reçue pour " + request.item());
}
```

## Le chemin du retour
Après l'exécution de votre logique, la valeur de retour est renvoyée au `HandlerAdapter`. Si vous retournez un `ResponseEntity` ou un POJO, l' `HttpMessageConverter` fonctionne à l'envers, transformant l'objet Java en JSON pour le corps de la réponse HTTP.

## Erreur courante : Confondre Filter et Interceptor
Une erreur fréquente consiste à placer la logique métier dans un `Filter` alors qu'elle devrait être dans un `HandlerInterceptor`. Les filtres font partie du conteneur de servlets et s'exécutent avant même que la requête n'atteigne le `DispatcherServlet`. Les intercepteurs sont gérés par Spring et ont accès au gestionnaire (contrôleur) spécifique.

## Exercice pratique
Si une requête atteint le serveur mais retourne une erreur 404 avant d'atteindre votre contrôleur, quel composant a probablement échoué à trouver une correspondance ?

**Réponse :** Le `HandlerMapping` n'a pas trouvé de méthode de contrôleur correspondant à l'URL et à la méthode HTTP.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
