---
title: "Object vs Reference in Java"
description: "Comprenez la distinction critique entre un objet Java et la variable de référence utilisée pour y accéder afin d'éviter les NullPointerException."
pubDate: 2026-10-11T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous créez un objet `PurchaseRequest`, mais lorsque vous tentez de modifier son statut dans une méthode, le changement ne semble pas persister, ou vous rencontrez soudainement une `NullPointerException`. Cela arrive généralement quand on confond l'objet réel (les données en mémoire) avec la référence (l'adresse de ces données).

## Un objet et les valeurs qui le référencent
Un objet possède un état et une identité ; une valeur de référence permet au code Java d'y accéder. Les références ne sont pas limitées aux variables locales : un champ d'objet ou un élément de tableau peut aussi en contenir une. La JVM fournit un modèle mémoire et peut optimiser le placement physique. Il n'est pas nécessaire de connaître une adresse numérique pour comprendre les alias : deux variables peuvent référencer le même objet.
## Le mécanisme du passage par valeur
Une idée reçue est que Java passe les objets par référence. En réalité, Java utilise toujours le passage par valeur. Lorsque vous passez un objet à une méthode, vous passez une copie de la valeur de la référence.

Exemple concret :
```java
public void processRequest(PurchaseRequest request) {
    request.setStatus("APPROUVÉ"); // Modifie l'objet sur le heap
    request = new PurchaseRequest(); // Réassigne la copie locale de la référence
}
```
Ici, modifier le statut fonctionne car la référence originale et la copie pointent vers le même objet. Cependant, réassigner `request` à un nouvel objet ne change que la copie locale ; la variable originale à l'extérieur de la méthode pointe toujours vers le premier objet.

## Null et variable locale non initialisée
Une référence peut valoir `null` : elle ne désigne aucun objet. La déréférencer, par exemple en appelant une méthode, provoque normalement une NullPointerException. Un champ d'objet de type référence vaut null par défaut. Une variable locale déclarée par `PurchaseRequest req;` est différente : Java interdit son utilisation avant une affectation certaine, ce qui produit une erreur de compilation. Avec `PurchaseRequest req = null;`, l'affectation est faite, mais `req.setStatus(...)` échoue à l'exécution.
## Identité et égalité définie par le type
Pour des références, `a == b` indique si elles désignent le même objet, y compris si elles valent toutes deux null. `a.equals(b)` applique la définition d'égalité de la classe. L'implémentation héritée d'Object utilise aussi l'identité ; la classe doit redéfinir equals pour comparer des valeurs. String et les records fournissent de telles comparaisons. `Objects.equals(a, b)` gère les valeurs null. Choisissez identité ou égalité métier selon le besoin, sans remplacer systématiquement tous les ==.
## Exercice pratique
Si vous avez `PurchaseRequest a = new PurchaseRequest("Laptop");` et `PurchaseRequest b = a;`, qu'arrive-t-il à `a` si vous appelez `b.setAmount(1000);` ?

**Réponse :** `a` affichera également un montant de 1000 car `a` et `b` sont deux références pointant vers le même objet unique sur le heap.


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
