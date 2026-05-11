---
title: "How to Return Clean Validation Errors"
description: "Apprenez à transformer les exceptions de validation Spring Boot complexes en réponses API structurées et conviviales."
pubDate: 2026-10-10T12:48:00.000Z
translationKey: 093-how-to-return-clean-validation-errors
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que votre développeur frontend soit frustré parce que votre API renvoie une erreur 500 avec une trace de pile immense dès qu'un utilisateur oublie de saisir son email. Le client ne sait pas ce qui a échoué, et vous avez accidentellement exposé la structure de vos packages internes. L'objectif est de passer de « quelque chose a cassé » à « le champ email est obligatoire ».

## Le Mécanisme de Validation
Dans Jakarta Bean Validation, des annotations comme `@NotBlank` et `@NotNull` vérifient la forme de l'entrée. Lorsqu'une requête arrive dans une méthode de contrôleur marquée avec `@Valid`, Spring lève une `MethodArgumentNotValidException` si les contraintes sont violées. Par défaut, cette exception contient un arbre complexe d'objets d'erreur trop verbeux pour une réponse JSON.

## Structurer la Réponse d'Erreur
Pour nettoyer cela, vous avez besoin d'un gestionnaire d'exceptions global utilisant `@RestControllerAdvice`. Au lieu de renvoyer l'exception brute, mappez les erreurs vers un objet de transfert de données (DTO) simple contenant le nom du champ et le message d'erreur spécifique.

## Exemple Concret : Demande d'Achat
Considérons une application d'approvisionnement où un demandeur soumet une requête d'achat. Le `RequestDTO` garantit que le nom de l'article n'est pas vide.

```java
public class RequestDTO {
    @NotBlank(message = "Le nom de l'article est requis")
    private String itemName;
    
    @NotNull(message = "La quantité ne peut pas être nulle")
    private Integer quantity;
    // getters/setters
}
```

Dans le gestionnaire, vous extrayez les erreurs ainsi :

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```
**Résultat :** Si `itemName` est manquant, l'API renvoie `400 Bad Request` avec `{"itemName": "Le nom de l'article est requis"}`.

## Erreur Courante : Confondre @NotNull et @NotBlank
Une erreur fréquente est d'utiliser `@NotNull` pour les chaînes de caractères. `@NotNull` vérifie seulement si la référence est nulle ; il accepte les chaînes vides (`""`) ou les espaces. Pour les champs texte, utilisez toujours `@NotBlank` pour garantir que l'entrée contient réellement des caractères.

## Exercice Pratique
Créez un `ManagerApprovalDTO` avec un booléen `isApproved` et un String `comments`. Assurez-vous que `comments` n'est pas vide. Comment le gestionnaire doit-il répondre si `comments` est vide ?

**Réponse :** Le gestionnaire doit renvoyer un statut 400 avec un corps JSON : `{"comments": "[Votre message personnalisé]"}`.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
