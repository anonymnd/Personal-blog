---
title: "High Cohesion and Low Coupling Explained Simply"
description: "Apprenez à organiser vos modules de code pour réduire les dépendances et améliorer la maintenance grâce aux principes de cohésion et de couplage."
pubDate: 2026-10-17T11:48:00.000Z
translationKey: 260-high-cohesion-and-low-coupling-explained-simply
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous commencez par placer le formulaire du demandeur, la logique d'approbation du manager et le système de commande de l'acheteur dans une seule classe géante nommée `ProcurementManager`. Au début, cela semble simple, mais bientôt, modifier la façon dont un manager approuve une demande casse accidentellement la logique de commande de l'acheteur.

## Comprendre la Cohésion
La cohésion désigne à quel point les responsabilités à l'intérieur d'un seul module sont liées. Une cohésion élevée signifie qu'un module fait une seule chose et la fait bien. Dans notre application, si l' `ApprovalService` gère uniquement la vérification des permissions du manager et la mise à jour des statuts, il a une cohésion élevée. S'il gère aussi l'envoi d'emails et le calcul des taxes, sa cohésion diminue.

## Comprendre le Couplage
Le couplage est le degré d'interdépendance entre différents modules. Un couplage faible signifie qu'un module peut changer sans forcer des modifications dans les autres. Si le `BuyerService` accède directement aux tables de base de données internes du `RequesterService`, ils sont fortement couplés. S'il utilise une méthode simple comme `getRequestDetails()`, le couplage est plus faible car les détails de stockage sont masqués.

## Exemple Concret
Considérons deux approches pour gérer une demande d'achat :

**Couplage Fort / Cohésion Faible :**
```java
public class ProcurementSystem {
    public void processRequest(Request req) {
        // Logique de validation
        // Logique d'approbation
        // Logique de commande
        // Logique d'email
    }
}
```
**Couplage Faible / Cohésion Élevée :**
```java
public class ApprovalService {
    public boolean approve(Request req) { /* logique */ return true; }
}

public class OrderService {
    public void placeOrder(Request req) { /* logique */ }
}
```
Dans la deuxième version, l' `OrderService` ne se soucie pas du fonctionnement de l' `ApprovalService` ; il sait seulement que la demande a été approuvée.

## Erreur Courante : L'Illusion de l'Interface
Beaucoup de développeurs pensent qu'ajouter une interface (ex: `IApprovalService`) crée automatiquement un couplage faible. Pourtant, si la méthode de l'interface nécessite un objet complexe lié aux détails internes d'un autre module, le couplage reste élevé. Le couplage concerne la *dépendance*, pas seulement la *syntaxe*.

## Exercice Pratique
**Scénario :** Vous avez un `NotificationModule` qui contient du code pour envoyer des SMS, des Emails, et qui calcule aussi la remise mensuelle de l'utilisateur.
**Question :** S'agit-il d'une cohésion élevée ou faible ? Comment corriger cela ?

**Réponse :** C'est une cohésion faible. La logique de facturation n'a rien à faire dans un module de notification. Corrigez cela en déplaçant le calcul des remises vers un `BillingService` séparé.
