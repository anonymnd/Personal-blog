---
title: "Validation d'Entrée vs Validation Métier"
description: "Découvrez la distinction essentielle entre la vérification de la forme des données et la validation de leur éligibilité logique selon les règles métier."
pubDate: 2026-10-10T10:48:00.000Z
translationKey: 091-input-validation-vs-business-validation
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Un employé demande un nouvel ordinateur. Le système accepte la demande, mais le manager la refuse ensuite car le budget du département est épuisé. Le premier contrôle (la demande est-elle bien remplie ?) et le second (pouvons-nous réellement payer ?) sont deux couches de validation distinctes.

## La Validation d'Entrée : Le Premier Filtre
La validation d'entrée se concentre sur la 'forme' et le 'type' des données. Elle garantit que la requête est syntaxiquement correcte avant d'atteindre la logique métier. En Java avec Jakarta Bean Validation, on utilise `@NotBlank` pour les chaînes de caractères ou `@NotNull` pour les objets. Attention : `@NotNull` n'écarte pas les chaînes vides ; il faut utiliser `@NotBlank`. L'annotation `@Valid` déclenche une validation en cascade pour vérifier la structure de l'objet.

## La Validation Métier : La Logique du Domaine
La validation métier intervient une fois que l'entrée est validée syntaxiquement. Elle vérifie l'éligibilité et l'état. Par exemple, une demande d'achat peut être parfaite techniquement (ID valide, montant positif), mais les règles métier peuvent interdire un achat de plus de 5 000 € sans l'accord d'un VP. Cela nécessite des appels à la base de données, ce qui est trop coûteux pour de simples annotations d'entrée.

## Exemple Concret : Demande d'Achat
Voici un extrait d'un DTO de requête et d'une vérification de service :

```java
public class RequestDTO {
    @NotBlank
    private String itemDescription;
    
    @NotNull
    @Positive
    private BigDecimal amount;
    // getters/setters
}

// Dans la couche Service
public void processRequest(RequestDTO dto) {
    if (budgetService.getRemainingBudget() < dto.getAmount()) {
        throw new InsufficientBudgetException("Budget insuffisant");
    }
}
```
Résultat : Si `itemDescription` est null, l'API renvoie immédiatement une erreur 400. Si la description est correcte mais que le budget est à 0, le service lève une exception métier spécifique.

## Erreur Courante : Tout miser sur les Annotations
Une erreur fréquente consiste à vouloir placer la logique métier dans une annotation de validation personnalisée. Cela crée un couplage trop fort entre l'API et la base de données. De plus, `@Valid` n'est pas une contrainte de base de données. Vous avez toujours besoin de contraintes d'unicité (unique constraints) en base pour éviter les conflits lors d'accès concurrents.

## Exercice Pratique
Scénario : Un utilisateur saisit une 'Quantité'. Vous voulez vérifier que le champ n'est pas nul et que l'entrepôt possède assez de stock.

Question : Quel contrôle est une validation d'entrée et lequel est une validation métier ?

Réponse : Vérifier si le champ est nul est une validation d'entrée ; vérifier le stock de l'entrepôt est une validation métier.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
