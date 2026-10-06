---
title: "Comment fonctionne @RestControllerAdvice"
description: "Découvrez comment centraliser la gestion des erreurs dans Spring Boot pour garder vos contrôleurs propres et vos réponses API cohérentes."
pubDate: 2026-10-10T15:48:00.000Z
translationKey: 096-how-restcontrolleradvice-works
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Dans votre `PurchaseRequestController`, vous avez cinq méthodes différentes. Si un utilisateur soumet une demande invalide ou qu'un gestionnaire tente d'approuver une commande inexistante, vous pourriez vous retrouver à écrire les mêmes blocs try-catch dans chaque méthode. Cette duplication rend votre code confus et difficile à maintenir.

## L'intercepteur centralisé
`@RestControllerAdvice` agit comme un intercepteur global pour les exceptions lancées par n'importe quel contrôleur de votre application. Au lieu de gérer les erreurs localement, Spring redirige l'exception vers une classe annotée avec `@RestControllerAdvice`. Dans cette classe, vous définissez des méthodes annotées avec `@ExceptionHandler`, qui précisent exactement quel type d'exception elles doivent traiter.

## Le mécanisme de fonctionnement
Lorsqu'une requête atteint un contrôleur et qu'une exception est levée, Spring recherche un `@ExceptionHandler` correspondant dans la classe advice. S'il est trouvé, il exécute cette méthode et renvoie le résultat comme corps de la réponse HTTP. Cela sépare votre logique métier (ce que fait l'application) de votre logique d'erreur (comment l'application échoue).

## Exemple concret : Validation des achats
Supposons qu'un demandeur soumette une `PurchaseRequest` avec une description vide. L'utilisation de `@NotBlank` sur le DTO déclenche une `MethodArgumentNotValidException`.

```java
@RestControllerAdvice
public class GlobalErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<String> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
```
Si un utilisateur envoie une description vide, le résultat est un `400 Bad Request` avec un corps JSON tel que `{"description": "ne peut pas être vide"}` au lieu d'une trace d'erreur complète.

## Erreur courante : Exposer les détails internes
Une erreur fréquente consiste à renvoyer l'objet exception brut ou la trace d'appels complète au client. C'est un risque de sécurité car cela révèle les noms de packages et les versions de la base de données.

**Correction :** Mappez toujours les exceptions vers un DTO `ErrorResponse` personnalisé qui contient uniquement un message convivial et un horodatage.

## Exercice pratique
Créez une méthode dans une classe `@RestControllerAdvice` pour gérer une exception personnalisée `InsufficientBudgetException` et renvoyer un statut `422 Unprocessable Entity`.

**Vérification :** Votre méthode doit être annotée avec `@ExceptionHandler(InsufficientBudgetException.class)` et retourner `ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Budget dépassé");`.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
