---
title: "Qu'est-ce que la Séparation des Préoccupations ?"
description: "Un principe architectural fondamental qui organise le code en divisant un programme en sections distinctes, chacune traitant d'un aspect spécifique."
pubDate: 2026-10-17T10:48:00.000Z
translationKey: 259-what-is-separation-of-concerns
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Au début, vous écrivez une seule fonction qui vérifie si le demandeur a assez de budget, enregistre la demande dans la base de données et envoie un e-mail au manager. Cela fonctionne pour une démo, mais dès que l'application grandit, changer de fournisseur d'e-mails vous oblige à modifier la logique du budget. C'est le problème de la 'Boule de Boue', où tout le code est entremêlé.

## Comprendre le Mécanisme
La Séparation des Préoccupations (SoC) consiste à partitionner un programme afin que chaque section s'occupe d'une 'préoccupation' spécifique. L'objectif est d'obtenir une cohésion élevée (les éléments liés restent ensemble) et un couplage faible (les sections dépendent le moins possible les unes des autres).

## Application au Flux d'Achats
Dans une architecture professionnelle, on divise le flux en couches. La couche Web gère les requêtes HTTP, la couche Service gère les règles métier (comme les flux d'approbation) et la couche de Données gère la persistance.

```java
// Couche Service : Se concentre uniquement sur la logique métier
public class ProcurementService {
    private RequestRepository repository;
    private NotificationService notifier;

    public void submitRequest(PurchaseRequest request) {
        if (request.getAmount() > 1000) {
            repository.save(request);
            notifier.sendApprovalEmail(request.getManager());
        }
    }
}
```

## Monolithes vs Microservices
Beaucoup de débutants pensent que la SoC n'existe que dans les microservices. C'est une erreur. Un monolithe peut être parfaitement séparé en modules au sein d'un seul déploiement. Les microservices poussent la SoC plus loin en offrant une indépendance opérationnelle, mais ils introduisent des complexités comme la latence réseau.

## Erreur Courante : L'Illusion de l'Interface
Certains développeurs croient que l'ajout d'une interface élimine automatiquement le couplage. Si votre interface `ProcurementService` nécessite toujours un objet `SqlDatabase` spécifique dans son constructeur, vous êtes toujours lié à une technologie précise. La vraie séparation signifie que le service dépend d'une abstraction.

## Exercice Pratique
Scénario : Vous avez une classe `OrderManager` qui calcule les taxes, valide les permissions utilisateur et écrit des logs dans un fichier. Comment appliquer la SoC ici ?

**Réponse :** Divisez-la en trois classes : `TaxCalculator` (logique), `PermissionChecker` (sécurité) et `Logger` (infrastructure). `OrderManager` coordonne ensuite ces trois services.
