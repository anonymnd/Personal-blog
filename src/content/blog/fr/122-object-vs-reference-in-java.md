---
title: "Objets, Références et le mot-clé 'new' en Java"
description: "Analyse approfondie de l'allocation sur le tas, l'aliasing de références et la mécanique du passage par valeur."
pubDate: 2026-10-07T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
seriesOrder: 26
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## Allocation et Nature des Références

En Java, il existe une distinction fondamentale entre une variable de référence et l'objet qu'elle désigne. Lorsque vous déclarez `ShoppingBasket basket;`, vous créez une variable de référence—un emplacement mémoire capable de stocker une référence à un objet `ShoppingBasket`. À ce stade, aucun objet n'existe sur le tas (heap).

L'utilisation du mot-clé `new` déclenche trois actions distinctes :
1. **Allocation Mémoire** : La JVM alloue l'espace nécessaire sur le tas pour tous les champs d'instance de la classe.
2. **Initialisation** : Les champs sont mis à leurs valeurs par défaut (0, false, ou null), puis le constructeur est exécuté pour définir l'état initial.
3. **Assignation de Référence** : L'expression `new` retourne la référence du nouvel objet, qui est ensuite stockée dans la variable.

Il est crucial de noter que les références Java ne sont pas des pointeurs comme en C++. Vous ne pouvez pas effectuer d'arithmétique de pointeurs ni voir l'adresse physique réelle. La référence est un handle opaque géré par la JVM.

## Aliasing et Identité

L'aliasing se produit lorsque plusieurs variables de référence pointent vers le même objet sur le tas. Comme elles partagent la même valeur de référence, toute mutation effectuée via une variable est visible via toutes les autres.

L'identité est déterminée par le fait que deux références pointent vers le même objet sur le tas. On vérifie cela avec l'opérateur `==`. À l'inverse, `.equals()` est destiné à vérifier l'égalité logique (équivalence de valeur), bien qu'il se comporte comme `==` par défaut s'il n'est pas redéfini.

## Passage par Valeur : Le Piège de la Référence

Java utilise strictement le passage par valeur. Lorsque vous passez un objet à une méthode, vous ne passez pas l'objet lui-même, ni une référence à la variable. Vous passez une **copie de la valeur de la référence**.

Considérons ce scénario : deux variables référencent le même panier. Nous en passons une à une méthode qui modifie le panier puis tente de réassigner la référence.

### Exemple concret : Mutation du Panier

```java
import java.util.*;

public class BasketDemo {
    static class ShoppingBasket {
        List<String> items = new ArrayList<>();

        void addItem(String item) {
            items.add(item);
        }
    }

    public static void main(String[] args) {
        ShoppingBasket basketA = new ShoppingBasket();
        ShoppingBasket basketB = basketA; // Aliasing : les deux pointent vers le même objet

        System.out.println("Initial: basketA == basketB est " + (basketA == basketB));

        processBasket(basketB);

        System.out.println("Après méthode: basketA items: " + basketA.items);
        System.out.println("Après méthode: basketA == basketB est " + (basketA == basketB));
    }

    static void processBasket(ShoppingBasket localBasket) {
        // Mutation : affecte l'objet sur le tas
        localBasket.addItem("Apple");

        // Réassignation : change uniquement la copie locale de la référence
        localBasket = new ShoppingBasket();
        localBasket.addItem("Orange");
        // L'orange est ajoutée à un nouvel objet qui sera ramassé par le GC
    }
}
```

**Analyse du résultat :**
1. `Initial: basketA == basketB est true` : Les deux variables détiennent la même valeur de référence.
2. `Après méthode: basketA items: [Apple]` : La mutation `addItem("Apple")` a eu lieu sur l'objet dans le tas. Comme `basketA` et `basketB` pointent vers cet objet, `basketA` voit le changement.
3. `Après méthode: basketA == basketB est true` : La réassignation `localBasket = new ShoppingBasket()` a seulement modifié la variable locale `localBasket` à l'intérieur de la méthode. Elle n'a pas modifié `basketB` dans la méthode `main`.

## Variables Locales Non Initialisées et Nulls

Les variables de champ (instance) sont initialisées automatiquement. Cependant, les **variables locales** (dans les méthodes) ne le sont pas. Tenter d'utiliser une variable locale non initialisée provoque une erreur de compilation.

`null` est une valeur de référence spéciale indiquant que la variable ne pointe vers aucun objet. Appeler une méthode sur une référence `null` déclenche une `NullPointerException` car il n'y a aucun objet sur le tas pour exécuter l'appel.

## Exercice

Étant donné le code suivant, quel est l'état final de `list1` et `list2` ?

```java
List<Integer> list1 = new ArrayList<>(List.of(1, 2));
List<Integer> list2 = list1;
modify(list1, list2);

void modify(List<Integer> a, List<Integer> b) {
    a.add(3);
    a = new ArrayList<>();
    b.add(4);
}
```

**Réponse :**
`list1` et `list2` contiendront toutes deux `[1, 2, 3, 4]`.
- `a.add(3)` mute l'objet partagé.
- `a = new ArrayList<>()` réassigne seulement la copie locale `a` ; aucun effet sur `list1`.
- `b.add(4)` mute l'objet partagé car `b` pointe toujours vers la liste originale.

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
