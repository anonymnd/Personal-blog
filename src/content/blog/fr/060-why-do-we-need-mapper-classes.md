---
title: "Pourquoi avons-nous besoin de classes Mapper ?"
description: "Découvrez comment les classes mapper découplent vos entités de base de données de vos réponses API pour garantir la sécurité et la flexibilité."
pubDate: 2026-10-09T03:48:00.000Z
translationKey: 060-why-do-we-need-mapper-classes
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Votre entité `PurchaseRequest` contient un `requesterId`, un `totalAmount` et une `secretInternalNote` utilisée uniquement par l'équipe administrative. Si vous retournez cette entité directement depuis votre contrôleur REST, la note interne secrète est envoyée au navigateur de l'utilisateur. C'est un piège architectural classique où le schéma de la base de données dicte le contrat de l'API.

## La Séparation des Responsabilités
Les classes Mapper servent de couche de traduction entre vos Entités de Domaine (qui reflètent la base de données) et vos Objets de Transfert de Données (DTO, qui reflètent l'API). En séparant les deux, vous garantissez que les modifications d'une table ne cassent pas automatiquement l'application frontend. Les DTO permettent de simplifier des relations complexes ou de combiner plusieurs entités dans une seule réponse.

## Le fonctionnement concret des Mappers
Au lieu de laisser le contrôleur gérer la conversion, une classe Mapper dédiée encapsule cette logique. Cela permet de garder vos règles métier propres et vos contrôleurs légers.

```java
// DTO pour la réponse API
public record RequestResponse(Long id, String item, double amount) {}

// Classe Mapper
@Component
public class PurchaseMapper {
    public RequestResponse toResponse(PurchaseRequest entity) {
        return new RequestResponse(
            entity.getId(), 
            entity.getItemName(), 
            entity.getTotalAmount()
        );
    }
}
```
Ici, la `secretInternalNote` est volontairement ignorée pour protéger les données sensibles.

## Erreur Courante : Mapper dans l'Entité
Beaucoup de débutants ajoutent des méthodes `toDto()` directement dans la classe JPA Entity. C'est une erreur car cela couple la couche de persistance à la couche de présentation. Si vous devez modifier votre version d'API sans toucher à la base de données, votre entité deviendra encombrée de multiples méthodes de mapping.

## Le Résultat
Grâce au mapper, votre contrôleur appelle simplement `mapper.toResponse(entity)`. Le résultat est un contrat API propre où vous contrôlez exactement les champs exposés, tandis que l'entité reste une représentation pure du stockage.

## Exercice Pratique
Scénario : Vous avez une entité `Manager` avec `id`, `name` et `salary`. Vous avez besoin d'un `ManagerDTO` qui affiche uniquement `id` et `name`.

**Tâche :** Écrivez la logique de mapping pour la méthode `toDto`.

**Vérification :** Votre méthode doit instancier `ManagerDTO` en utilisant uniquement les getters `id` et `name` de l'entité, sans toucher au champ `salary`.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
