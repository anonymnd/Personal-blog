---
title: "Interfaces Explained Through Real Application Architecture"
description: "Découvrez comment les interfaces Java découplent la logique métier des détails d'implémentation via un système d'achat."
pubDate: 2026-10-11T19:48:00.000Z
translationKey: 124-interfaces-explained-through-real-application-architecture
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achat où un demandeur soumet une requête. Au début, vous créez une classe qui envoie des notifications par Email. Mais que se passe-t-il si l'entreprise décide de passer à Slack ou SMS ? Si votre logique métier est liée directement à une classe `EmailService`, vous devrez modifier tout votre code central à chaque changement d'outil. C'est là que les interfaces règlent le problème du 'couplage fort'.

## Le Rôle de l'Interface
Une interface est un contrat. Elle indique à l'application *ce que* un service peut faire, sans préciser *comment* il le fait. Dans notre application, peu importe la méthode d'envoi ; nous voulons simplement qu'une méthode `sendNotification` existe. En programmant via une interface, la logique d'approbation du manager reste identique, que la notification arrive dans une boîte mail ou une application mobile.

## Conception du Contrat d'Achat
Voici comment définir le contrat pour notre système de notification :

```java
public interface NotificationService {
    void sendNotification(String recipient, String message);
}
```

Nous créons ensuite deux implémentations distinctes, l'une pour l'Email et l'autre pour Slack :

```java
public class EmailNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Envoi Email à " + recipient + ": " + message);
    }
}

public class SlackNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Post Slack pour " + recipient + ": " + message);
    }
}
```

## L'Interface en Action
Dans le flux d'achat, la classe `ProcurementManager` utilise l'interface plutôt qu'une classe spécifique. Cela permet de changer d'implémentation dynamiquement.

```java
public class ProcurementManager {
    private final NotificationService notificationService;

    public ProcurementManager(NotificationService service) {
        this.notificationService = service;
    }

    public void approveRequest(String requester) {
        notificationService.sendNotification(requester, "Votre demande a été approuvée !");
    }
}
```

## Erreur Courante : L'Excès d'Interfaces
Une erreur fréquente consiste à créer une interface pour chaque classe, même quand une seule implémentation existera. Cela alourdit le code inutilement. Utilisez les interfaces uniquement lorsque vous prévoyez plusieurs implémentations ou pour faciliter les tests unitaires.

## Exercice Pratique
**Tâche :** Créez une interface `PaymentProcessor` avec une méthode `processPayment(double amount)`. Implémentez-la pour `CreditCardPayment` et `PayPalPayment`.

**Vérification :** Votre `ProcurementManager` accepte-t-il `PaymentProcessor` dans son constructeur ? Si oui, vous avez réussi le découplage.


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
