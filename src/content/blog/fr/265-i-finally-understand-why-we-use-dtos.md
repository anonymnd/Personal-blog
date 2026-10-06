---
title: "J'ai enfin compris pourquoi on utilise les DTO"
description: "Une exploration conceptuelle de l'importance des Data Transfer Objects pour découpler votre domaine interne de votre API externe."
pubDate: 2026-10-17T16:48:00.000Z
translationKey: 265-i-finally-understand-why-we-use-dtos
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. Au début, vous pourriez simplement retourner votre entité `PurchaseRequest` directement depuis votre contrôleur. Cela semble rapide. Mais un problème surgit : votre entité contient un champ `secretInternalNote` que le demandeur ne doit jamais voir, et un champ `version` utilisé par Hibernate qui n'intéresse pas le frontend. En exposant l'entité, vous exposez votre schéma de base de données au monde entier.

## Le mécanisme de découplage

Un Data Transfer Object (DTO) est un simple POJO utilisé pour transporter des données entre processus. Au lieu d'envoyer l'entité de base de données, vous créez une classe spécifique contenant uniquement les champs nécessaires pour cette requête ou réponse précise. Cela crée une zone tampon. Si vous renommez une colonne dans votre base de données, vous ne modifiez que la logique de mapping, et non le contrat API dont dépend votre frontend.

## Exemple concret

Considérons une entité `PurchaseRequest` avec les champs : `id`, `item`, `quantity`, `status`, et `internalAuditCode`. Nous voulons que le demandeur ne voie que l'article et le statut.

```java
// L'Entité de Domaine
public class PurchaseRequest {
    private Long id;
    private String item;
    private int quantity;
    private String status;
    private String internalAuditCode; // Sensible !
}

// Le DTO
public class PurchaseRequestDTO {
    private String item;
    private String status;
}
```

Dans la couche service, vous mappez l'entité vers le DTO. Le résultat est une réponse JSON contenant uniquement `item` et `status`, gardant l' `internalAuditCode` sécurisé sur le serveur.

## Erreur courante : Le DTO "Miroir"

Une erreur fréquente est de créer un DTO qui est une copie exacte de l'entité. On peut alors penser que le DTO est inutile car les champs sont identiques. L'erreur est là : la valeur n'est pas dans les champs, mais dans la *séparation*. Sans DTO, tout changement d'entité casse automatiquement l'API.

## Exercice pratique

**Scénario :** Vous avez une entité `Buyer` avec `name`, `email`, et `hashedPassword`. Vous devez créer un DTO pour une page de profil public.

**Question :** Quels champs doivent figurer dans le `BuyerProfileDTO` ?

**Réponse :** Uniquement `name` et `email`. Le `hashedPassword` ne doit jamais quitter la couche service.
