---
title: "Je connaissais Spring Boot, mais je ne savais pas comment démarrer une vraie application"
description: "Apprenez à passer de l'écriture de contrôleurs isolés à la structuration d'une application réelle via l'approche par tranche verticale."
pubDate: 2026-10-06T16:48:00.000Z
translationKey: 001-i-knew-spring-boot-but-i-didn-t-know-how-to-start-a-real-application
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs tombent dans le 'piège du tutoriel' : ils savent créer un contrôleur REST, mais se retrouvent bloqués devant un IDE vide et un besoin métier. L'erreur classique est de vouloir concevoir toute l'architecture—chaque table et service—avant d'écrire la moindre ligne de code. En ingénierie logicielle, on commence par une 'tranche verticale' (vertical slice).

## Se concentrer sur le résultat utilisateur
Au lieu de penser à la 'Couche Base de Données', pensez à l'objectif de l'utilisateur. Pour une application d'achats, le premier but n'est pas la 'Gestion des Utilisateurs', mais 'Un demandeur doit pouvoir soumettre une demande d'achat'. Ce résultat définit votre point de départ.

## Définir les règles métier et les critères d'acceptation
Avant de coder, listez les règles. Pour la soumission d'une demande :
1. La demande doit avoir une description et un coût estimé.
2. Le coût ne peut pas être négatif.
3. Le statut doit être 'PENDING' par défaut.

Les critères d'acceptation sont les tests de succès : 'Étant donné une demande valide, le système retourne un code 201 Created et l'enregistrement existe en BDD'.

## Implémenter la tranche verticale
Commencez par une implémentation minimale. Créez une entité `PurchaseRequest`, un `PurchaseRequestRepository` et un `PurchaseRequestService`.

```java
@Service
public class PurchaseRequestService {
    @Autowired
    private PurchaseRequestRepository repository;

    public PurchaseRequest createRequest(RequestDTO dto) {
        if (dto.getAmount() < 0) throw new IllegalArgumentException("Le montant doit être positif");
        PurchaseRequest request = new PurchaseRequest(dto.getDescription(), dto.getAmount(), "PENDING");
        return repository.save(request);
    }
}
```

## Architecture itérative
Une fois que le demandeur peut soumettre, ajoutez la tranche suivante : l'approbation du manager. Vous ne développez la logique d'approbation que lorsque la soumission fonctionne. L'architecture évolue avec ces tranches.

## Erreur courante : La sur-ingénierie
Les débutants créent souvent des classes `BaseService` ou `AbstractEntity` génériques avant même d'avoir une seule fonctionnalité. Cela ajoute de la complexité inutile. Appliquez la 'Règle de Trois' : n'abstraisez que lorsque vous avez répété le même motif trois fois.

## Exercice pratique
Définissez la tranche verticale pour la fonctionnalité 'L'acheteur commande l'article'. Quel est le résultat utilisateur et une règle métier ?

**Réponse :** Résultat : L'acheteur marque la demande comme 'COMMANDÉE'. Règle : Seules les demandes avec le statut 'APPROUVÉ' peuvent être commandées.
