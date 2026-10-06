---
title: "Request DTO vs Response DTO"
description: "Découvrez pourquoi la séparation des objets de transfert de données pour les flux entrants et sortants évite les fuites de sécurité."
pubDate: 2026-10-09T01:48:00.000Z
translationKey: 058-request-dto-vs-response-dto
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats où un demandeur soumet une requête. Vous pourriez être tenté d'utiliser un seul `PurchaseRequestDTO` pour recevoir la demande et envoyer la confirmation. Cependant, vous réaliserez vite que le demandeur ne doit pas voir le `approvalStatus` interne lors de la soumission, et vous ne voulez surtout pas qu'il puisse « injecter » un statut approuvé dans votre API en l'envoyant dans le corps de la requête.

## La distinction fondamentale

Un Request DTO est conçu pour la validation des entrées et la capture de l'intention de l'utilisateur. Il ne contient que les champs que le client est autorisé à fournir. Un Response DTO est conçu pour la présentation des données, garantissant que le client ne reçoit que les informations autorisées, formatées selon ses besoins.

## Pourquoi cette séparation est cruciale

L'utilisation du même objet pour les deux directions crée un couplage fort entre votre structure de données interne et votre API publique. Si vous ajoutez un champ sensible à votre entité et l'incluez dans un DTO partagé, vous risquez de divulguer accidentellement cette donnée. De plus, les contraintes de validation (comme `@NotNull`) sont souvent nécessaires pour une requête mais inutiles pour une réponse.

## Exemple concret : Demande d'achat

Dans un système d'achats, l'entrée doit être concise, tandis que la sortie doit être informative.

```java
// Entrée : Uniquement ce que l'utilisateur fournit
public record PurchaseRequestDTO(
    String itemName,
    int quantity,
    double estimatedPrice
) {}

// Sortie : Ce que le système retourne
public record PurchaseResponseDTO(
    Long requestId,
    String status,
    LocalDateTime submissionDate,
    String itemName
) {}
```

Lorsque le contrôleur reçoit le `PurchaseRequestDTO`, il le mappe vers une entité, l'enregistre, puis mappe l'entité résultante vers un `PurchaseResponseDTO` pour retourner l'ID généré et le statut par défaut.

## Erreur courante : Le 'God DTO'

Les développeurs créent souvent un seul grand DTO avec de nombreux champs optionnels pour tous les scénarios. Cela crée une confusion : « Ce champ est-il nul parce que l'utilisateur ne l'a pas envoyé, ou parce que le serveur ne l'a pas rempli ? »

**Correction :** Créez des records spécifiques pour des actions spécifiques. Utilisez `PurchaseCreateRequest` et `PurchaseDetailsResponse` pour rendre le contrat de l'API explicite.

## Exercice pratique

Si vous avez un `UserDTO` utilisé pour l'inscription et la vue du profil, et que vous ajoutez un champ `password` pour l'inscription, que se passe-t-il lorsque vous retournez ce même DTO dans la vue du profil ?

**Réponse :** Vous risquez de divulguer le mot de passe haché au client. La solution est de créer un `UserRegistrationRequest` (avec mot de passe) et un `UserProfileResponse` (sans mot de passe).

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
