---
title: "Qu'est-ce qu'une Transaction de Base de Données ?"
description: "Un guide complet pour comprendre les propriétés ACID et le mécanisme des transactions via un scénario d'achat."
pubDate: 2026-10-12T20:48:00.000Z
translationKey: 149-what-is-a-database-transaction
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une requête, et un manager l'approuve. Le système doit alors déduire le coût de l'article du budget du département et créer un enregistrement de commande. Si le budget est mis à jour mais que la création de la commande échoue à cause d'un bug réseau, vos données deviennent incohérentes : l'argent a disparu, mais aucune commande n'existe. C'est là qu'intervient la transaction de base de données.

## Le Concept d'Atomicité
Essentiellement, une transaction est une unité logique de travail contenant une ou plusieurs instructions SQL. La propriété la plus critique est l'Atomicité (le 'A' de ACID). L'atomicité garantit que soit toutes les opérations de la transaction réussissent, soit aucune d'entre elles n'est appliquée. Si une partie échoue, la base de données effectue un rollback, revenant à l'état initial.

## Explication des Propriétés ACID
Outre l'atomicité, les transactions reposent sur trois autres piliers :
- **Cohérence (Consistency)** : La base de données passe d'un état valide à un autre, respectant toutes les contraintes.
- **Isolation** : Les transactions concurrentes ne peuvent pas voir les modifications partielles des autres avant le commit.
- **Durabilité (Durability)** : Une fois commitée, la transaction est permanente, même en cas de panne serveur.

## Exemple Concret : Commande d'Achat
Voici une logique simplifiée utilisant Jakarta Persistence (@Transactional) :

```java
@Transactional
public void processOrder(Long requestId, double amount) {
    Budget budget = budgetRepo.findByDept(requestId);
    budget.setBalance(budget.getBalance() - amount);
    budgetRepo.save(budget);
    
    Order order = new Order(requestId, "PENDING");
    orderRepo.save(order);
    // Si une exception survient ici, la soustraction du budget est annulée
}
```
Ici, si `orderRepo.save()` lance une `RuntimeException`, le solde du budget est automatiquement restauré dans PostgreSQL.

## Erreur Courante : L'Effet de Bord Externe
Une erreur fréquente est de croire que les transactions peuvent tout annuler. Par exemple, si vous envoyez un e-mail de confirmation dans une méthode `@Transactional` avant que la commande ne soit sauvegardée, et que la transaction échoue ensuite, l'e-mail ne peut pas être « rappelé ». Déclenchez toujours les effets externes après le commit réussi.

## Exercice Pratique
**Scénario** : Vous avez une transaction qui met à jour le profil d'un utilisateur et enregistre le changement dans une table d'audit. La mise à jour de la table d'audit échoue à cause d'une violation de contrainte.

**Question** : Qu'arrive-t-il à la mise à jour du profil utilisateur ?

**Réponse** : La mise à jour du profil est annulée (rollback) ; aucun des deux changements n'est persisté.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
