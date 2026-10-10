---
title: "Définir les Responsabilités : Contrôleurs, Services et Repositories"
description: "Analyse approfondie de l'allocation des responsabilités via un scénario d'expédition d'entrepôt pour séparer la traduction HTTP, l'orchestration métier et la persistance."
pubDate: 2026-10-07T03:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
seriesOrder: 12
locale: fr
tags: ["spring-architecture","learning-series"]
draft: false
---

## La Logique du Découpage en Couches

L'architecture en couches est souvent mal comprise comme un ensemble de règles rigides sur l'emplacement des instructions 'if'. En réalité, il s'agit de gérer le périmètre d'autorité. Chaque couche ne doit se soucier que des préoccupations de ses voisins immédiats. Lorsque ces frontières deviennent floues, le système devient fragile : une modification du schéma de la base de données peut forcer une modification du contrat d'API, ou un changement de règle métier peut nécessiter la mise à jour de cinq contrôleurs différents.

## Allocation des Responsabilités

### Le Contrôleur : Le Traducteur HTTP
Le contrôleur est le point d'entrée. Sa seule responsabilité est de traduire le monde extérieur (HTTP) vers le monde interne (Java). Il gère la liaison des requêtes (binding), la validation basique des entrées (ex: vérifier qu'un champ n'est pas nul) et la conversion du résultat d'une opération métier en un code de statut HTTP. Il ne doit pas savoir *comment* une expédition est traitée, mais seulement *quel* service appeler et *quoi* répondre au client.

### Le Service : L'Orchestrateur
La couche service est le lieu où réside le processus métier. Elle coordonne le flux de données entre le contrôleur et les repositories. Elle impose les invariants du domaine — des règles qui doivent toujours être vraies pour que le métier fonctionne. Par exemple, "une expédition ne peut être créée si le stock est à zéro" est un invariant métier. Le service orchestre la séquence : vérifier le stock → choisir le transporteur → enregistrer l'expédition.

### Le Repository : La Passerelle de Persistance
Le repository est une abstraction sur le stockage des données. Il ne doit pas contenir de logique métier. Son rôle est de fournir un moyen de récupérer ou de sauvegarder des entités. Bien qu'il puisse gérer une logique spécifique aux requêtes (comme trouver un transporteur par un statut précis), il ne décide pas *si* un transporteur est éligible pour une commande donnée ; cette décision appartient au service ou au modèle de domaine.

## Exemple Concret : Expédition d'Entrepôt

Considérons un scénario où un entrepôt doit expédier une commande. Le processus nécessite la vérification du stock, la sélection d'un transporteur disponible et l'enregistrement de l'expédition.

### Trace d'Implémentation

```java
// Illustratif : Entité de Domaine
public class Shipment {
    private Long id;
    private Long orderId;
    private String carrierName;
    // Getters, constructeur
}

// Illustratif : Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    // Persistance pure : pas de règles métier ici
}

// Illustratif : Service
@Service
public class DispatchService {
    private final ShipmentRepository shipmentRepo;
    private final StockRepository stockRepo;
    private final CarrierRepository carrierRepo;

    public DispatchService(ShipmentRepository sr, StockRepository str, CarrierRepository cr) {
        this.shipmentRepo = sr;
        this.stockRepo = str;
        this.carrierRepo = cr;
    }

    @Transactional
    public Shipment dispatchOrder(Long orderId) {
        // 1. Invariant du domaine : Le stock doit exister
        var stock = stockRepo.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalStateException("Aucun stock disponible pour la commande"));

        if (stock.getQuantity() <= 0) {
            throw new IllegalStateException("Stock insuffisant");
        }

        // 2. Décision métier : Choisir un transporteur éligible
        var carrier = carrierRepo.findFirstAvailable()
            .orElseThrow(() -> new IllegalStateException("Aucun transporteur disponible"));

        // 3. Orchestration : Créer et persister
        Shipment shipment = new Shipment(orderId, carrier.getName());
        return shipmentRepo.save(shipment);
    }
}

// Illustratif : Contrôleur
@RestController
@RequestMapping("/dispatch")
public class DispatchController {
    private final DispatchService dispatchService;

    public DispatchController(DispatchService ds) {
        this.dispatchService = ds;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<ShipmentResponse> handleDispatch(@PathVariable Long orderId) {
        try {
            var shipment = dispatchService.dispatchOrder(orderId);
            return ResponseEntity.ok(new ShipmentResponse(shipment.getId(), "Expédié"));
        } catch (IllegalStateException e) {
            // Traduire l'exception métier en HTTP 400/422
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### Analyse du Flux
1. **Contrôleur** : Reçoit l' `orderId` via l'URL. Il ne connaît pas le `StockRepository`. Si le service lève une `IllegalStateException`, le contrôleur décide que cela correspond à un `400 Bad Request` pour le client.
2. **Service** : C'est le "cerveau". Il s'assure que le stock est vérifié avant que le transporteur ne soit choisi. Si on déplaçait la vérification du stock dans le repository, celui-ci devrait soudainement connaître la définition métier d'un "stock disponible". Si on la déplaçait dans le contrôleur, on ne pourrait pas réutiliser la logique d'expédition dans une tâche planifiée ou un écouteur de file de messages.
3. **Repository** : Exécute simplement `findByOrderId` ou `save`. Il ne se soucie pas de *pourquoi* l'expédition est sauvegardée ; il s'assure seulement que le SQL est valide.

## Cas d'Échec et Mauvais Placements

- **Le "Contrôleur Obèse"** : Placer la vérification `if (stock <= 0)` dans le contrôleur. Résultat : Si vous ajoutez un second point d'entrée API pour une "Expédition en Masse", vous devez dupliquer la logique de vérification du stock.
- **Le "Service Anémique"** : Le service se contente d'appeler `repository.save(entity)`. Résultat : Le contrôleur est forcé de gérer la logique métier, ou la logique fuit dans la base de données via des triggers, rendant le système impossible à tester sans base de données.
- **Le "Repository Intelligent"** : Ajouter une méthode `saveIfStockAvailable()`. Résultat : Le repository dépend désormais de la table `Stock` et des règles métier, violant le principe de responsabilité unique.

## Exercice Ciblé

**Scénario** : Vous ajoutez une fonctionnalité d'"Expédition Prioritaire". Seules les commandes de plus de 100 $ peuvent utiliser des transporteurs prioritaires. Où ce contrôle doit-il se situer et comment affecte-t-il les couches ?

**Réponse** :
1. **Contrôleur** : Aucun changement, si ce n'est peut-être l'acceptation d'un indicateur `priority` dans la requête.
2. **Service** : La vérification `if (order.getTotal() < 100 && priorityRequested) throw ...` doit se trouver ici. C'est un invariant métier.
3. **Repository** : Aucun changement. Il continue simplement de récupérer la commande ou de sauvegarder l'expédition. Le repository ne doit pas connaître le seuil des 100 $.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
