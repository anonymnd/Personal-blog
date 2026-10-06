---
title: "Pourquoi commencer par le code peut être une erreur"
description: "Découvrez pourquoi se lancer directement dans l'implémentation mène souvent à des efforts inutiles et comment privilégier les résultats métier."
pubDate: 2026-10-06T21:48:00.000Z
translationKey: 006-why-starting-with-code-can-be-a-mistake
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous créez une application d'achats. Vous commencez immédiatement par écrire une classe `PurchaseRequest` et à configurer le schéma de la base de données. Deux semaines plus tard, vous réalisez que le manager ne se contente pas d'« approuver » une demande ; il peut aussi la « renvoyer pour révision » ou la « déléguer ». Comme vous avez commencé par le code, vous devez maintenant réécrire tout votre modèle de données.

## Le piège de l'implémentation immédiate
Beaucoup de débutants considèrent le codage comme l'acte principal du génie logiciel. Pourtant, le code n'est que la traduction finale d'une solution. En commençant par le code, vous devinez les besoins tout en essayant de résoudre l'implémentation technique. Cette surcharge cognitive mène à une « vision tunnel », où vous optimisez une fonction qui ne devrait même pas exister car la règle métier a été mal comprise.

## Se concentrer sur le résultat utilisateur
Avant d'ouvrir votre IDE, définissez le résultat attendu. Dans notre application d'achats, le résultat n'est pas « une table de base de données », mais « un demandeur qui obtient les articles dont il a besoin ». Une fois le résultat clair, identifiez les règles métier : qui peut demander, qui approuve et que se passe-t-il en cas de dépassement de budget.

## L'approche par tranche verticale
Au lieu de construire toute l'architecture, concentrez-vous sur une petite tranche verticale. Définissez un chemin simple : Demandeur soumet → Manager approuve → Acheteur commande. Établissez des critères d'acceptation pour cette tranche (ex: « Le manager doit recevoir une notification lors de la soumission »).

## Exemple concret : La mauvaise vs la bonne méthode

**Mauvaise méthode :**
```java
// Commencer par une entité générique sans règles claires
public class Request {
    private Long id;
    private String status; // "PENDING", "APPROVED"
    // ... getters et setters
}
```
*Résultat :* Vous oubliez l'état « Révision », ce qui impose une migration de base de données coûteuse.

**Bonne méthode :**
1. **Résultat :** Flux d'approbation des demandes.
2. **Règle :** Les demandes peuvent être Approuvées, Refusées ou Renvoyées pour Révision.
3. **Code :** Implémenter uniquement la logique nécessaire pour ces trois états.

## Erreur courante : Le sur-dimensionnement architectural
Une erreur fréquente est de vouloir concevoir une architecture « parfaite » et scalable avant de connaître les règles métier. L'architecture doit être itérative. Commencez simplement ; affinez la conception à mesure que les besoins évoluent.

## Exercice pratique
On vous demande de créer une fonctionnalité d'« Alerte Budget » pour l'application. Au lieu d'écrire la classe `AlertService`, listez deux règles métier et un critère d'acceptation.

**Vérification :**
*Règle 1 : L'alerte se déclenche si la demande > 1000$. Règle 2 : Seul le chef financier reçoit l'alerte. Critère : Vérifier qu'une demande de 500$ ne déclenche pas de notification.
