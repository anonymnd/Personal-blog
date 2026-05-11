---
title: "Controller, Service et Repository Expliqués Simplement"
description: "Un guide pour débutants sur l'architecture à trois niveaux dans Spring Boot pour séparer les responsabilités et améliorer la maintenance du code."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous créez une application d'achats. Vous avez une demande pour un nouvel ordinateur, mais si vous placez la validation, la requête base de données et la réponse API dans une seule classe, votre code devient un "plat de spaghettis". Il devient impossible de tester ou de modifier une partie sans tout casser. C'est pourquoi nous utilisons le modèle Controller-Service-Repository.

## Le Controller : Le Réceptionniste
Le Controller est le point d'entrée de votre application. Son seul rôle est de gérer les requêtes HTTP entrantes et de renvoyer une réponse. Il ne doit contenir aucune logique métier. Considérez-le comme un réceptionniste : il prend votre demande, la transmet au bon service et vous donne la réponse une fois prête.

## Le Service : Le Cerveau
La couche Service est l'endroit où résident les règles métier. C'est ici que vous décidez si une requête est valide. Par exemple, dans notre application d'achats, le Service vérifie si le demandeur a assez de budget avant d'autoriser la demande. Il coordonne le flux de données entre le Controller et le Repository.

## Le Repository : Le Bibliothécaire
Le Repository est la couche d'accès aux données. Il communique directement avec la base de données via Spring Data JPA. Il ne se soucie pas des règles métier ; il s'occupe uniquement des opérations CRUD (Créer, Lire, Mettre à jour, Supprimer). Il agit comme un bibliothécaire qui sait exactement où se trouve un enregistrement.

## Exemple Concret : Demande d'Achat
Voici comment une requête circule à travers ces couches :

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 5000) {
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

// Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
**Résultat :** Le Controller reçoit le JSON, le Service applique la règle budgétaire, et le Repository sauvegarde les données.

## Erreur Courante : Logique dans le Repository
Une erreur fréquente consiste à placer la logique métier dans le Repository ou le Controller. Par exemple, vérifier si un utilisateur est administrateur directement dans le Repository.
**Correction :** Déplacez toute la logique de décision dans la couche Service. Le Repository ne doit exécuter que des requêtes.

## Exercice Pratique
Si vous devez envoyer une notification par email après l'approbation d'une demande d'achat, quelle couche doit déclencher le service d'email ?

**Réponse :** La couche Service, car l'envoi d'une notification est une règle de processus métier.

## Des couches, pas trois serveurs
Il s'agit de responsabilités logiques dans le backend. Elles peuvent fonctionner dans un seul processus Spring Boot : trois couches n'impliquent pas trois serveurs. L'extrait illustre cette séparation. Pour une véritable API, utilisez des DTO d'entrée et de sortie distincts, validez les données et vérifiez les autorisations avant d'enregistrer une demande.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
