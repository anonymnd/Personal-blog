---
title: "Pourquoi une bonne architecture concerne les frontières, pas les noms de dossiers"
description: "Découvrez pourquoi la séparation logique des capacités du domaine est plus cruciale pour la maintenance que l'organisation physique des fichiers."
pubDate: 2026-10-17T13:48:00.000Z
translationKey: 262-why-good-architecture-is-about-boundaries-not-folder-names
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs pensent que créer un dossier nommé `services` ou `repositories` est la première étape vers une architecture propre. Pourtant, on peut avoir une structure de dossiers parfaitement organisée tout en ayant une 'Big Ball of Mud' où chaque classe dépend de toutes les autres. Le vrai défi n'est pas l'emplacement du fichier, mais la manière dont la logique est délimitée.

## L'illusion de l'organisation par dossiers
Les dossiers sont des conteneurs physiques, mais l'architecture concerne les frontières logiques. Si votre `OrderService` modifie directement l'état interne d'un objet `User` sans interface définie, déplacer ces fichiers dans des dossiers séparés n'élimine pas le couplage. Une cohésion élevée signifie que les éléments qui évoluent ensemble restent ensemble ; un couplage faible signifie que les différents modules ne se cassent pas mutuellement lors d'un changement.

## Définir les frontières du domaine
Au lieu d'organiser par rôle technique (Contrôleur, Service, DAO), organisez par capacité métier. Dans une application d'achat, la logique de 'Demande' doit être isolée de la logique d' 'Approbation'. Même dans un monolithe, ceux-ci doivent agir comme des modules distincts. Si vous décidez de passer aux microservices plus tard, ces frontières rendront la transition possible.

## Exemple concret : Logique d'approvisionnement
Considérons la soumission d'une demande. Au lieu d'un seul `ProcurementService` géant, nous définissons une frontière pour le `RequestModule`.

```java
// Frontière : RequestModule
public class RequestService {
    public RequestId submitRequest(RequestDetails details) {
        // Logique de création de demande
        return new RequestId("REQ-123");
    }
}

// Frontière : ApprovalModule
public class ApprovalService {
    public void approve(RequestId id, Manager manager) {
        // Logique d'approbation par le manager
        // Ce module connaît seulement le RequestId, pas les RequestDetails
    }
}
```
Résultat : L' `ApprovalService` ne peut pas modifier accidentellement les `RequestDetails` car il n'interagit qu'avec la frontière `RequestId`.

## Erreur courante : Le piège de l'interface
Certains pensent qu'ajouter une interface (`IOrderService`) crée automatiquement une frontière. C'est faux. Si l'interface reflète simplement chaque méthode de l'implémentation, vous avez des 'abstractions fuyantes'. Une vraie frontière cache la complexité et n'expose que le strict nécessaire.

## Exercice pratique
Scénario : Vous avez un `BuyerModule` et un `PaymentModule`. Le `BuyerModule` doit savoir si un paiement a réussi pour expédier un article. Le `BuyerModule` doit-il appeler directement `PaymentRepository.findByTransactionId()` ?

**Réponse :** Non. Il doit appeler une méthode dans la frontière du `PaymentService` (ex: `isPaymentCleared(id)`). Cela évite que le `BuyerModule` ne dépende du schéma de base de données du système de paiement.
