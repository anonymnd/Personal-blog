---
title: "J'ai enfin compris pourquoi les backends utilisent des Controllers, Services et Repositories"
description: "Une analyse conceptuelle du pattern d'architecture en couches pour séparer les responsabilités dans les applications backend."
pubDate: 2026-10-17T15:48:00.000Z
translationKey: 264-i-finally-understand-why-backends-have-controllers-services-and-repositories
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Au début de mon apprentissage de Spring Boot, je mettais toute ma logique dans le Controller. Cela semblait plus rapide d'écrire une requête base de données là où la requête HTTP arrive. Mais avec le temps, mes contrôleurs sont devenus des 'God Classes' massives, impossibles à tester sans tout casser. J'ai fini par comprendre que le pattern Controller-Service-Repository n'est pas là pour multiplier les fichiers, mais pour donner à chaque morceau de code une responsabilité unique.

## Le Controller : Le Gardien
Le rôle du Controller est uniquement de gérer le protocole HTTP. Il écoute les requêtes, valide le format des entrées et retourne le code de statut HTTP approprié. Il ne doit jamais savoir comment calculer une remise ou comment sauvegarder un enregistrement. Il délègue simplement le travail au Service.

## Le Service : Le Cerveau
C'est ici que réside la logique métier. La couche Service est indépendante de la couche de transport ; elle ne sait pas si la requête provient d'une API REST, d'un endpoint GraphQL ou d'une tâche planifiée. Elle coordonne le flux de données et applique les règles de gestion.

## Le Repository : Le Bibliothécaire
Le Repository est la seule couche qui communique avec la base de données. Son seul but est d'effectuer des opérations CRUD. En isolant l'accès aux données, on peut modifier la technologie de base de données ou optimiser une requête sans toucher à la logique métier.

## Exemple concret : Demande d'achat
Imaginons une application de procurement où un utilisateur soumet une demande d'achat. (Note : Ce code est un extrait illustratif ; l'entité Request est supposée être une entité JPA standard).

```java
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 1000) {
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

@Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
Ici, le Controller gère le JSON, le Service décide du statut d'approbation selon le montant, et le Repository persiste la donnée.

## Erreur courante : La fuite de logique
Une erreur classique est de placer la logique métier dans le Repository (via du SQL complexe) ou dans le Controller. 
**Correction :** Déplacez tout 'if/else' lié aux règles métier dans la couche Service. Le Repository doit rester focalisé sur la récupération et la sauvegarde.

## Exercice pratique
Si vous devez envoyer une notification par email après l'approbation d'une demande d'achat, quelle couche doit déclencher le service d'email ?

**Réponse :** La couche Service, car l'envoi d'une notification est un processus métier, et non une opération de base de données ou une préoccupation HTTP.
