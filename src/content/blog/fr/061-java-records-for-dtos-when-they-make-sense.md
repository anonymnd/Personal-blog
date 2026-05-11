---
title: "Java Records pour les DTO : Quand sont-ils pertinents ?"
description: "Découvrez comment utiliser les Java Records pour simplifier vos Objets de Transfert de Données et pourquoi ils ne conviennent pas aux entités JPA."
pubDate: 2026-10-09T04:48:00.000Z
translationKey: 061-java-records-for-dtos-when-they-make-sense
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement où un demandeur soumet une requête d'achat. Vous devez déplacer ces données du contrôleur REST vers la couche service. Traditionnellement, vous créeriez un POJO avec des champs privés, des getters, `equals()`, `hashCode()` et `toString()`, aboutissant à 50 lignes de code répétitif pour seulement trois champs.

## Le passage aux Records
Introduits comme fonctionnalité standard dans Java 16, les Records sont des transporteurs de données immuables. Lorsque vous déclarez un record, le compilateur Java génère automatiquement le constructeur, les champs privés finaux et les méthodes d'accès. Cela les rend idéaux pour les Objets de Transfert de Données (DTO), car les DTO sont destinés à transporter des données sans les modifier pendant le transit.

## Implémentation dans une application d'achat
Dans notre scénario, un `PurchaseRequestDTO` doit simplement capturer le nom de l'article et la quantité. Au lieu d'une classe verbeuse, nous utilisons un record :

```java
public record PurchaseRequestDTO(String itemName, int quantity, String requesterId) {}
```

Lorsqu'un manager approuve cette demande, le contrôleur reçoit un corps JSON que Jackson lie directement à ce record. Les données sont immuables, garantissant que le `itemName` ne peut pas être modifié accidentellement par un développeur avant d'atteindre la logique d'approbation.

## Records vs Entités JPA
Une erreur courante consiste à essayer d'utiliser des Records comme classes `@Entity` JPA. Cela échoue car JPA nécessite un constructeur sans argument et des champs non finaux pour supporter le chargement différé (lazy loading) et le proxying. Les Records sont finaux, ce qui les rend incompatibles avec le mécanisme de proxy de Hibernate. Utilisez les Records pour la couche API (DTO) et des classes standards pour la couche base de données (Entités).

## Tableau Comparatif

| Caractéristique | Java Record | POJO Standard |
| :--- | :--- | :--- |
| Immuabilité | Native (Final) | Manuelle |
| Code répétitif | Minimal | Élevé |
| Entité JPA | Inadapté | Idéal |
| Cas d'usage | DTO, Réponses API | Entités Base de données |

## Exercice Pratique
Créez un record nommé `OrderResponseDTO` qui retourne un `orderId` (String) et un `status` (String).

**Réponse :** `public record OrderResponseDTO(String orderId, String status) {}`

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
