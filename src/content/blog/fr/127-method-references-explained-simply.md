---
title: "Method References Explained Simply"
description: "Apprenez à remplacer les expressions lambda verbeuses par des références de méthode claires en Java pour améliorer la lisibilité du code."
pubDate: 2026-10-11T22:48:00.000Z
translationKey: 127-method-references-explained-simply
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous avez écrit une expression lambda comme `(s) -> System.out.println(s)`, et vous réalisez que c'est redondant. Vous dites simplement à Java de prendre une valeur et de la passer directement à une autre méthode. C'est là qu'interviennent les références de méthode, un raccourci pour les lambdas qui ne font qu'appeler une méthode existante.

## Fonctionnement des références de méthode
Une référence de méthode est un moyen compact de désigner une méthode sans l'exécuter immédiatement. Elle utilise l'opérateur double deux-points `::`. Au lieu de définir la logique dans une lambda, vous indiquez à Java la méthode qui contient déjà cette logique. Cela ne fonctionne que si la signature de la méthode correspond aux exigences de l'interface fonctionnelle.

## Les types de références
Il existe quatre types principaux : les méthodes statiques (`ClassName::method`), les méthodes d'instance d'un objet spécifique (`obj::method`), les méthodes d'instance d'un objet arbitraire d'un type donné (`ClassName::method`), et les constructeurs (`ClassName::new`).

## Exemple pratique : Application d'achats
Imaginons un système d'achats où nous devons filtrer une liste de demandes et afficher les identifiants de celles qui nécessitent une approbation.

```java
import java.util.*;
import java.util.stream.*;

public class ProcurementSystem {
    public static void main(String[] args) {
        List<Request> requests = List.of(new Request(101, "Laptop"), new Request(102, "Mouse"));
        
        // Version Lambda
        requests.forEach(r -> System.out.println(r.getId()));
        
        // Version Référence de méthode (méthode d'instance d'objet arbitraire)
        requests.stream()
                 .map(Request::getId)
                 .forEach(System.out::println);
    }
}

class Request {
    private int id; private String item; 
    public Request(int id, String item) { this.id = id; this.item = item; }
    public int getId() { return id; }
}
```
Dans cet exemple, `Request::getId` remplace `r -> r.getId()`. Le résultat est identique : les IDs 101 et 102 sont affichés.

## Erreur courante : Mauvais contexte
Les développeurs tentent souvent d'utiliser des références de méthode pour des fonctions nécessitant des arguments supplémentaires. Par exemple, `System.out::println` fonctionne car `println` prend un seul argument. Si vous voulez ajouter du texte comme `r -> System.out.println("ID: " + r.getId())`, la référence de méthode est impossible ; vous devez garder la lambda.

## Exercice rapide
Convertissez cette lambda en référence de méthode : `list.stream().filter(s -> s.isEmpty()).collect(Collectors.toList());` 

**Réponse :** `list.stream().filter(String::isEmpty).collect(Collectors.toList());`


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
