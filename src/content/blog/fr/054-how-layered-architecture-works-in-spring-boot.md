---
title: "Comment fonctionne l'architecture en couches dans Spring Boot"
description: "Un guide pour débutants sur l'organisation des applications Spring Boot en couches Controller, Service et Repository."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 054-how-layered-architecture-works-in-spring-boot
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous créez une application d'achat où un demandeur soumet une requête. Si vous placez la validation, la logique métier et l'accès aux données dans une seule classe, votre code devient illisible et fragile. Modifier une règle d'approbation pourrait casser accidentellement la sauvegarde en base de données. C'est là qu'intervient l'architecture en couches.

## La couche Controller (Le point d'entrée)
Le Controller est la vitrine de votre application. Son seul rôle est de gérer les requêtes HTTP, de valider le format des données entrantes et de renvoyer une réponse. Il ne doit jamais contenir de logique métier. Par exemple, il ne décide pas si une demande est "trop chère" ; il se contente de la transmettre au service.

## La couche Service (Le cerveau)
C'est ici que résident les règles métier. Dans notre application d'achat, la couche Service vérifie si le demandeur a assez de budget ou si le manager a l'autorité pour approuver la commande. Elle coordonne le flux de données entre le contrôleur et le dépôt.

## La couche Repository (L'accès aux données)
Cette couche communique avec la base de données via Spring Data JPA. Elle se concentre sur les opérations CRUD. Elle ne se demande pas pourquoi une requête est enregistrée, mais seulement comment l'enregistrer efficacement.

## Exemple concret : Soumettre une demande
Voici comment une requête circule entre les couches :

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<RequestDTO> create(@RequestBody RequestDTO dto) {
        return ResponseEntity.ok(service.processRequest(dto));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private RequestRepository repository;

    public RequestDTO processRequest(RequestDTO dto) {
        // Règle métier : auto-approbation si < 1000
        // Règle métier : auto-approbation si < 1000
        String status = dto.amount() < 1000 ? "AUTO_APPROVED" : "PENDING";
        var entity = new RequestEntity(dto, status);
        entity = repository.save(entity);
        return new RequestDTO(entity);
    }
}

// Repository
public interface RequestRepository extends JpaRepository<RequestEntity, Long> {}
```

## Erreur courante : Logique dans le Repository
Beaucoup de débutants placent des vérifications métier (comme `if (amount > 1000)`) dans le Repository ou le Controller.
**Correction :** Déplacez toute la logique de décision dans la classe `@Service`. Le Repository ne doit contenir que des requêtes.

## Exercice pratique
Si vous devez ajouter une règle stipulant que "Les managers ne peuvent pas approuver leurs propres demandes", dans quelle couche ce code doit-il aller ?

**Réponse :** La couche Service, car il s'agit d'une règle métier.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
