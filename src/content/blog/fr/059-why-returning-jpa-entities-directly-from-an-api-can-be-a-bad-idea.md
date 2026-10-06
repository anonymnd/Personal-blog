---
title: "Pourquoi retourner des entités JPA directement via une API est une mauvaise idée"
description: "Découvrez pourquoi le découplage de vos modèles de base de données et de vos réponses API via des DTO évite les fuites de sécurité et les erreurs de sérialisation."
pubDate: 2026-10-09T02:48:00.000Z
translationKey: 059-why-returning-jpa-entities-directly-from-an-api-can-be-a-bad-idea
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achat. Vous avez une entité `PurchaseRequest` contenant le nom du demandeur, l'article et un champ `auditLog` interne. Si vous retournez cette entité directement depuis votre `@RestController`, Jackson sérialisera chaque champ, exposant accidentellement des données d'audit internes à l'utilisateur final.

## Le piège de la sérialisation
Lorsqu'un contrôleur Spring Boot retourne une entité JPA, le convertisseur JSON tente de lire chaque getter. Si votre entité possède des références circulaires—comme une `PurchaseRequest` liée à un `User` qui possède lui-même une liste de `PurchaseRequests`—vous provoquerez une `StackOverflowError` car le sérialiseur entrera dans une boucle infinie.

## Fuite du schéma interne
Les entités sont conçues pour la base de données, pas pour le client. En les exposant, vous liez votre contrat API à la structure de vos tables. Si vous renommez une colonne pour améliorer la normalisation, vous cassez involontairement l'API pour toutes les applications mobiles ou web qui consomment votre service.

## La solution DTO
Les Data Transfer Objects (DTO) servent de tampon. Au lieu de retourner l'entité, vous la mappez vers un simple Java Record. Cela vous permet de contrôler exactement quels champs sont publics.

```java
// L'entité JPA
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item;
    private String internalNotes; // Doit être caché
    // getters/setters
}

// Le DTO (Record)
public record PurchaseRequestDTO(Long id, String item) {}

// Dans le Contrôleur
@GetMapping("/{id}")
public PurchaseRequestDTO getRequest(@PathVariable Long id) {
    PurchaseRequest entity = repository.findById(id).orElseThrow();
    return new PurchaseRequestDTO(entity.getId(), entity.getItem());
}
```

## Erreur courante : L'abus de @JsonIgnore
Beaucoup de développeurs utilisent `@JsonIgnore` pour masquer des champs sensibles. Bien que cela fonctionne pour un endpoint, c'est un réglage global. Si un Manager doit voir les `internalNotes` mais pas le Demandeur, `@JsonIgnore` ne peut pas gérer cette logique conditionnelle. Les DTO permettent de créer différentes vues selon les rôles.

## Exercice pratique
**Scénario :** Vous avez une entité `User` avec `id`, `username` et `passwordHash`. Vous voulez retourner le profil utilisateur au frontend.
**Question :** Pourquoi est-il dangereux de retourner l'entité `User` directement, et quelle est la solution ?
**Réponse :** Cela expose le `passwordHash` dans la réponse JSON. La solution est de créer un record `UserDTO` contenant uniquement l' `id` et le `username`.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
