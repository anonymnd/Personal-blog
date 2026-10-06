---
title: "Qu'est-ce que la gestion globale des exceptions dans Spring Boot ?"
description: "Découvrez comment centraliser la gestion des erreurs dans Spring Boot avec @ControllerAdvice pour éviter les blocs try-catch répétitifs."
pubDate: 2026-10-10T14:48:00.000Z
translationKey: 095-what-is-global-exception-handling-in-spring-boot
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Dans chaque méthode de vos contrôleurs—que ce soit pour soumettre une demande ou approuver une commande—vous vous retrouvez à écrire les mêmes blocs try-catch pour gérer `ResourceNotFoundException` ou `InvalidRequestException`. Cette duplication rend votre code encombré et difficile à maintenir. La gestion globale des exceptions permet de déplacer cette logique vers un seul endroit.

## Le mécanisme de @ControllerAdvice
Spring Boot propose l'annotation `@ControllerAdvice`, qui agit comme un intercepteur pour les exceptions lancées par n'importe quelle méthode de n'importe quel contrôleur. Lorsqu'une exception survient, Spring recherche une méthode annotée avec `@ExceptionHandler` à l'intérieur d'une classe marquée `@ControllerAdvice`. S'il trouve une correspondance, il exécute cette méthode au lieu de laisser le serveur renvoyer une page d'erreur 500 générique.

## Implémentation d'un gestionnaire global
Pour cela, vous créez une classe spécialisée. Il est recommandé de définir un objet de réponse d'erreur personnalisé pour garantir que le client reçoive une structure JSON cohérente plutôt qu'une trace de pile (stack trace) brute, ce qui pourrait divulguer des détails sensibles du serveur.

```java
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleNotFound(ResourceNotFoundException ex) {
        ErrorDetails error = new ErrorDetails("NOT_FOUND", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGeneral(Exception ex) {
        ErrorDetails error = new ErrorDetails("SERVER_ERROR", "Une erreur inattendue est survenue");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## Exemple concret : Demande d'achat
Supposons qu'un gestionnaire tente d'approuver une demande avec un ID inexistant. Le service lance une `ResourceNotFoundException`. Au lieu que le contrôleur la capture, le `GlobalExceptionHandler` l'intercepte et renvoie un statut 404 avec le corps : `{"code": "NOT_FOUND", "message": "ID de demande 123 non trouvé"}`. Cela permet au contrôleur de rester concis.

## Erreur courante : Exposer les traces de pile
Une erreur fréquente consiste à renvoyer l'objet `Exception` complet ou la trace de pile dans le corps de la réponse. C'est un risque de sécurité car cela révèle la structure de vos packages et vos versions de bibliothèques. Mappez toujours l'exception vers un DTO simplifié.

## Exercice pratique
Créez un gestionnaire pour une exception personnalisée `InsufficientFundsException` qui renvoie un statut 400 Bad Request.

**Vérification :** Votre méthode doit être annotée avec `@ExceptionHandler(InsufficientFundsException.class)` et renvoyer `HttpStatus.BAD_REQUEST`.

## La portée réelle du traitement global
Le conseil aux contrôleurs participe au traitement des exceptions Spring MVC ; il ne capture pas tous les échecs des filtres de sécurité, tâches de fond ou autres processus. Prévoyez un traitement à ces frontières. Dans l'exemple, hériter de `ResponseEntityExceptionHandler` conserve le traitement MVC intégré, notamment pour les entrées mal formées et la validation. Ajoutez des handlers métier spécifiques avant le recours à une erreur 500.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
