---
title: "Le Design Pattern Observer Expliqué Simplement"
description: "Découvrez comment créer une dépendance un-à-plusieurs entre objets pour que, lorsqu'un objet change d'état, tous ses dépendants soient notifiés automatiquement."
pubDate: 2026-10-12T02:48:00.000Z
translationKey: 131-the-observer-design-pattern-explained-simply
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'achats. Lorsqu'un manager approuve une demande, plusieurs actions doivent se déclencher : l'acheteur doit être prévenu pour passer la commande, le demandeur doit recevoir un email et le suivi budgétaire doit être mis à jour. Si vous codez tous ces appels directement dans le `ApprovalService`, votre code devient un mélange inextricable, difficile à modifier dès qu'un nouveau type de notification est ajouté.

## Le Mécanisme Principal
Le pattern Observer résout ce problème en découplant le 'Sujet' (l'objet surveillé) de ses 'Observateurs' (les objets qui attendent des mises à jour). Le Sujet maintient une liste d'observateurs et propose des méthodes pour les ajouter ou les supprimer. Lorsqu'un événement spécifique survient, le Sujet parcourt cette liste et appelle une méthode prédéfinie sur chaque observateur.

## Exemple d'Implémentation
Dans une application d'achats, la classe `PurchaseRequest` sert de Sujet. Nous définissons une interface `Observer` pour garantir que tous les écouteurs possèdent une méthode `update` cohérente.

```java
interface RequestObserver {
    void update(String status);
}

class PurchaseRequest {
    private List<RequestObserver> observers = new ArrayList<>();
    private String status;

    public void attach(RequestObserver observer) { observers.add(observer); }
    
    public void setStatus(String status) {
        this.status = status;
        notifyObservers();
    }

    private void notifyObservers() {
        for (RequestObserver obs : observers) {
            obs.update(status);
        }
    }
}

class BuyerNotification implements RequestObserver {
    public void update(String status) {
        if ("APPROVED".equals(status)) {
            System.out.println("Acheteur : Commande des articles !");
        }
    }
}
```
Quand `request.setStatus("APPROVED")` est appelé, `BuyerNotification` déclenche automatiquement sa logique sans que `PurchaseRequest` n'ait besoin de connaître les détails du flux de travail de l'acheteur.

## Erreur Courante : Fuites de Mémoire
Une erreur fréquente est l'oubli du détachement des observateurs. Si un objet observateur n'est plus utile mais reste attaché à un Sujet qui a une longue durée de vie, le Garbage Collector ne peut pas le récupérer, ce qui cause une fuite de mémoire. Prévoyez toujours une méthode `detach` et appelez-la à la fin du cycle de vie de l'observateur.

## Exercice Pratique
Créez une classe `BudgetTracker` qui implémente `RequestObserver`. Elle doit afficher "Budget Mis à Jour" uniquement quand le statut est "APPROVED".

**Vérification :** Votre classe doit implémenter l'interface et utiliser une condition `if` dans la méthode `update` pour filtrer la chaîne "APPROVED".


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
