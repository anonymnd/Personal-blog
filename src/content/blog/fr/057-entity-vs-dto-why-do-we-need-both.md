---
title: "Entity vs DTO : Pourquoi avons-nous besoin des deux ?"
description: "Apprenez à découpler votre schéma de base de données de vos réponses API en utilisant les Entités et les DTO."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 057-entity-vs-dto-why-do-we-need-both
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Votre entité `PurchaseRequest` contient des données internes sensibles, comme les journaux d'audit ou la clé primaire de la base de données. Si vous retournez cette entité directement via votre contrôleur REST, vous exposez accidentellement la structure de votre base de données au client et vous risquez de divulguer des informations confidentielles.

## Le rôle de l'Entité
Une Entité est le reflet de votre table en base de données. Dans Spring Boot, avec `jakarta.persistence`, elle définit le schéma et gère le cycle de vie des données. Les entités sont conçues pour la persistance ; elles contiennent souvent des relations complexes (comme `@OneToMany`) qui peuvent provoquer des boucles infinies lors de la sérialisation JSON.

## Le rôle du DTO
Un Data Transfer Object (DTO) est un simple POJO ou un Java Record utilisé spécifiquement pour transporter des données entre les processus. Contrairement aux entités, les DTO n'ont aucune logique de persistance. Ils permettent de façonner les données exactement comme le frontend en a besoin. Par exemple, là où l'entité a un objet `User`, le DTO ne contiendra peut-être qu'une chaîne `userName`.

## Exemple concret : Demande d'achat
Considérons une demande où un manager approuve un achat. L'entité contient tout l'historique, mais le DTO n'envoie que les champs nécessaires.

```java
// Le modèle de base de données
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item;
    private Double amount;
    private String internalAuditNote; // Sensible !
}

// Le modèle API (DTO)
public record PurchaseRequestDTO(String item, Double amount) {}
```

Lorsque le contrôleur reçoit une requête, il mappe le DTO vers l'Entité avant d'appeler `repository.save()`. Cela garantit que `internalAuditNote` ne peut pas être modifié par l'utilisateur via l'API.

## Erreur courante : Retourner les Entités directement
Une erreur fréquente consiste à retourner l'Entité dans la méthode du `@RestController`. Cela conduit souvent à une `LazyInitializationException` car le convertisseur JSON (Jackson) tente d'accéder à une relation chargée en mode "lazy" après la fermeture de la session.

**Correction :** Mappez toujours votre Entité vers un DTO dans la couche service avant de le renvoyer au contrôleur.

## Exercice pratique
Si vous avez une entité `User` avec `password` et `email`, et que vous voulez afficher une liste d'utilisateurs sur une page publique, devez-vous utiliser l'Entité ou un DTO ?

**Réponse :** Utilisez un DTO qui exclut le champ `password` pour éviter les failles de sécurité.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
