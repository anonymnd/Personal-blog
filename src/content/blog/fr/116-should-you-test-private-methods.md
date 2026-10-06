---
title: "Faut-il tester les méthodes privées ?"
description: "Une analyse sur la raison pour laquelle tester le comportement observable est préférable au ciblage des détails d'implémentation privés."
pubDate: 2026-10-11T11:48:00.000Z
translationKey: 116-should-you-test-private-methods
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez passé des heures à écrire un algorithme complexe dans une méthode privée. Vous vous sentez inquiet car cette logique spécifique n'est pas couverte par un test, alors vous envisagez d'utiliser la réflexion ou de changer le modificateur en 'protected' juste pour satisfaire votre suite de tests. C'est un piège courant qui rend les tests fragiles.

## La philosophie de l'API publique
Les tests unitaires doivent agir comme une spécification du comportement d'une classe, et non de son implémentation. Une méthode privée est un détail interne. Si vous la testez directement, vos tests deviennent étroitement liés à la structure interne. Lorsque vous décidez de refactoriser le code—par exemple, en divisant une méthode privée en deux—vos tests échoueront même si le résultat final reste correct.

## Tester via le comportement observable
Au lieu de cibler la méthode privée, vous devez tester la méthode publique qui l'appelle. Si la méthode privée est si complexe qu'elle semble "intestable" via l'API publique, c'est généralement le signe que la classe en fait trop. Dans ce cas, la logique devrait être extraite dans une nouvelle classe collaboratrice où cette logique deviendrait une responsabilité publique.

## Exemple concret : Approbation d'achat
Considérez un `RequestService` où une méthode privée `validateBudget()` vérifie si une demande d'achat dépasse la limite du département.

```java
public class RequestService {
    public boolean submitRequest(Request req) {
        if (!validateBudget(req)) return false;
        // traiter la demande
        return true;
    }

    private boolean validateBudget(Request req) {
        return req.getAmount() <= 1000;
    }
}
```

Pour tester `validateBudget`, appelez simplement `submitRequest` avec un montant de 1500 et affirmez qu'elle retourne `false`. Vous testez le *résultat* (la demande a été rejetée), pas le *mécanisme* (la méthode privée a été appelée).

## Erreur courante : Modifier la visibilité
Les développeurs changent souvent `private` en `package-private` et ajoutent `@VisibleForTesting`. Cela expose les détails d'implémentation aux autres classes du même package. La correction consiste à garder la méthode privée et à améliorer la couverture de test du point d'entrée public.

## Exercice pratique
Si vous avez une méthode privée `calculateTax()` utilisée par `processInvoice()`, comment devez-vous tester une erreur de calcul de taxe ?

**Réponse :** Appelez `processInvoice()` avec des données qui déclenchent l'erreur de taxe et vérifiez que la méthode publique renvoie la réponse d'erreur attendue ou lève l'exception appropriée.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
