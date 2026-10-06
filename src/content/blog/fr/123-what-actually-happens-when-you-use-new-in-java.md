---
title: "Que se passe-t-il réellement quand on utilise new en Java ?"
description: "Une analyse approfondie du processus d'allocation mémoire et d'initialisation lors de la création d'un objet Java."
pubDate: 2026-10-11T18:48:00.000Z
translationKey: 123-what-actually-happens-when-you-use-new-in-java
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de débutants pensent que `new` se contente de « créer un objet », mais cela masque une séquence complexe d'événements impliquant la JVM, le tas (heap) et le chargeur de classes. Si vous vous êtes déjà demandé pourquoi un constructeur est appelé ou où résident exactement vos données, vous explorez ici le cycle de vie de l'instanciation.

## La phase de chargement de la classe
Avant que `new` ne puisse allouer de la mémoire, la JVM doit s'assurer que la définition de la classe est disponible. Si la classe n'a pas encore été chargée, le ClassLoader recherche le fichier `.class`, vérifie le bytecode et crée un objet `java.lang.Class` dans le Metaspace. Sans ce plan, la JVM ne saurait pas combien d'octets allouer pour les champs de l'objet.

## L'allocation mémoire sur le Heap
Une fois le plan prêt, la JVM calcule la taille totale nécessaire pour toutes les variables d'instance. Elle alloue ensuite un bloc de mémoire contigu sur le Heap. À ce moment précis, l'objet existe dans un état « vierge » ; tous les champs numériques sont mis à 0, les booléens à `false` et les références d'objets à `null`. C'est pourquoi on peut parfois voir des valeurs par défaut avant même l'exécution du constructeur.

## La séquence d'initialisation
Ensuite, la JVM exécute la logique d'initialisation dans un ordre précis : d'abord, les initialiseurs d'instance et les assignations de champs sont traités, puis le constructeur est appelé. Si la classe a une super-classe, `super()` est implicitement appelé en premier pour garantir que l'état du parent est établi avant que l'enfant n'ajoute sa propre logique.

## Exemple concret : Demande d'achat
Considérons un objet de demande simple dans une application d'achats :

```java
public class PurchaseRequest {
    private double amount = 0.0;
    private String item;

    public PurchaseRequest(String item, double amount) {
        this.item = item;
        this.amount = amount;
    }
}

// Exécution
PurchaseRequest req = new PurchaseRequest("Laptop", 1200.00);
```
**Résultat :** La JVM alloue de la mémoire pour un `double` et une référence vers un `String`. Elle initialise `amount` à 0.0, puis le constructeur met à jour `item` pour pointer vers la chaîne "Laptop" et `amount` à 1200.00. Enfin, l'adresse de cette mémoire heap est assignée à la variable `req` sur la pile (stack).

## Erreur courante : Confondre référence et objet
Une erreur fréquente est de penser que `PurchaseRequest req;` crée un objet. Ce n'est pas le cas. Cela crée seulement une variable de référence sur la pile. L'objet n'est créé que lorsque `new` est invoqué. Assigner `req = null` ne supprime pas l'objet ; cela rompt simplement le lien, laissant l'objet au Garbage Collector.

## Exercice pratique
Quel est l'état des champs d'un objet immédiatement après l'allocation mémoire mais avant l'exécution du constructeur ?

**Réponse :** Ils sont initialisés à leurs valeurs par défaut (0, false, ou null).


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
