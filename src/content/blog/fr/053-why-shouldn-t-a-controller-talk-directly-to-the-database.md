---
title: "Pourquoi un Contrôleur ne doit-il pas parler directement à la Base de Données ?"
description: "Découvrez pourquoi la séparation de la couche web et de la couche de données évite la dégradation architecturale dans Spring Boot."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 053-why-shouldn-t-a-controller-talk-directly-to-the-database
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. Pour gagner du temps, vous injectez directement `PurchaseRequestRepository` dans votre `PurchaseController`. Tout fonctionne bien au début. Mais ensuite, le manager demande que toute requête dépassant 1 000 $ soit marquée pour 'Révision Senior' avant d'être enregistrée. Soudain, vous vous retrouvez à écrire des logiques complexes de if-else dans votre gestionnaire HTTP, mélangeant le routage web et les règles métier.

## Le Problème des Abstractions Fuyantes
Lorsqu'un contrôleur communique directement avec la base de données, on parle d'abstractions fuyantes. Le contrôleur ne devrait s'occuper que des requêtes HTTP, des codes de statut et du mapping JSON. S'il gère la logique de base de données, il devient étroitement lié au schéma des données. Si vous modifiez une colonne ou changez de type de base de données, vous devez réécrire votre couche web, alors que celle-ci devrait rester indépendante du stockage.

## Le Rôle de la Couche Service
L'introduction d'une couche Service crée un tampon. Le Contrôleur gère le *quoi* (la requête) et le Service gère le *comment* (la logique métier). C'est ici que vous imposez des règles que le Repository ne peut pas gérer. Par exemple, vérifier si un demandeur a assez de budget avant d'appeler `.save()` est une règle métier, pas une opération de base de données.

## Exemple concret : Approbation d'achat
Considérons ce flux : un manager approuve une demande.

```java
// MAUVAIS : Le contrôleur fait tout
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    var req = repository.findById(id).orElseThrow();
    req.setStatus("APPROVED"); // Logique métier dans le contrôleur !
    repository.save(req);
    return ResponseEntity.ok().build();
}

// BON : Le contrôleur délègue au Service
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    service.approveRequest(id);
    return ResponseEntity.ok().build();
}
```
Dans la version 'Bonne', le `PurchaseService` gère le changement de statut et les effets secondaires (comme l'envoi d'un email), gardant le contrôleur léger.

## Erreur Courante : Trop compter sur les Repositories
Une erreur fréquente est de penser que les méthodes de `JpaRepository` suffisent pour la logique métier. Bien que `.save()` gère la persistance, il ne sait pas qu'une demande ne peut pas être approuvée si elle est déjà annulée. Vous devez encapsuler l'appel au repository dans une méthode de service pour valider ces états.

## Exercice Pratique
**Scénario :** Vous devez vous assurer qu'une `PurchaseRequest` a une description de plus de 10 caractères avant l'enregistrement.
**Question :** Où doit se situer cette logique de validation pour respecter l'architecture discutée ?
**Réponse :** Dans la couche Service, avant l'appel à la méthode save du repository.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
