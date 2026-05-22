---
title: "Records et Objets de Valeur Immuables : Qu'est-ce qui est Vraiment Immuable ?"
description: "Analyse de l'immuabilité superficielle vs profonde dans les records Java, avec focus sur la copie défensive des collections."
pubDate: 2026-10-07T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
seriesOrder: 25
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## L'illusion de l'immuabilité des Records

Les records Java sont souvent présentés comme des transporteurs de données immuables. S'il est vrai que les composants d'un record sont marqués `final`, cela ne procure qu'une **immuabilité superficielle** (shallow immutability). Un record n'est réellement immuable que si tous ses composants le sont également. Si un record contient une référence vers un objet mutable, comme une `List` ou une `Map`, la référence elle-même ne peut pas être changée, mais le contenu de cette liste peut toujours être modifié.

## Immuabilité Superficielle vs Profonde

L'immuabilité superficielle signifie que les champs de l'objet ne peuvent pas être réassignés. L'immuabilité profonde signifie que tout le graphe d'objets accessible depuis cet objet est inchangé.

Considérons un `RouteSummary` qui suit des noms d'arrêts. Si nous utilisons une `java.util.List` standard, nous créons une faille dans notre contrat d'immuabilité.

### Implémentation Vulnérable (Illustratif)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {}

// Utilisation
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// La faille : modifier la liste originale affecte le record
myStops.add("Tanger"); 
System.out.println(summary.stops()); // Résultat: [Casablanca, Rabat, Tanger]
```

Dans cet exemple, le record `RouteSummary` est superficiellement immuable. Le champ `stops` ne peut pas être remplacé par une nouvelle liste, mais l' `ArrayList` vers laquelle il pointe est mutable. Cela rompt la promesse fondamentale d'un Objet de Valeur : que son état reste constant durant tout son cycle de vie.

## Protéger l'État : Les Copies Défensives

Pour atteindre l'immuabilité profonde, nous devons nous assurer qu'aucune référence mutable ne s'échappe de l'objet ou n'est acceptée de l'extérieur sans être copiée. Pour les records, cela se fait en surchargeant le constructeur canonique.

L'utilisation de `List.copyOf()` (introduite dans Java 10) est l'approche standard. Elle retourne une liste non modifiable. Si la liste fournie est déjà une liste non modifiable produite par `List.copyOf`, elle retourne l'originale pour éviter des copies inutiles.

### Implémentation Robuste (Illustratif)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {
    public RouteSummary {
        // Copie défensive pour garantir l'immuabilité profonde
        stops = List.copyOf(stops);
    }
}

// Utilisation
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// Ceci lancera désormais une UnsupportedOperationException
try {
    summary.stops().add("Tanger");
} catch (UnsupportedOperationException e) {
    System.out.println("Immuable ! Impossible de modifier la liste.");
}

// Modifier la liste source n'affecte plus le record
myStops.add("Tanger");
System.out.println(summary.stops()); // Résultat: [Casablanca, Rabat]
```

## Immuabilité dans les Classes Standards

Les records simplifient la syntaxe, mais les classes peuvent être tout aussi immuables. Pour rendre une classe immuable, vous devez :
1. Déclarer la classe comme `final` pour empêcher l'héritage.
2. Rendre tous les champs `private` et `final`.
3. Ne fournir aucun setter.
4. Effectuer des copies défensives des champs mutables dans le constructeur et les getters.

## Conséquences pour l'Égalité

Les records implémentent automatiquement `equals()` et `hashCode()` basés sur l'état de leurs composants. Si un record contient une liste mutable qui est modifiée (cas de l'immuabilité superficielle), le `hashCode` du record change. C'est dangereux si le record est utilisé comme clé dans une `HashMap`, car l'objet devient "perdu" dans la map puisqu'il est désormais associé à un bucket différent.

## Exercice

**Scénario :** Vous avez un record `UserPreferences` contenant un `Set<String>` de tags. L'implémentation actuelle permet de modifier les tags depuis l'extérieur du record.

**Tâche :** Réécrire le record pour garantir que le `Set` est profondément immuable.

**Réponse :**
```java
import java.util.*;

public record UserPreferences(String userId, Set<String> tags) {
    public UserPreferences {
        tags = Set.copyOf(tags);
    }
}
```

copyOf rend la collection non modifiable, pas ses éléments mutables profondément immuables. Les String sécurisent ces exemples ; des valeurs mutables imbriquées demandent autre chose. Ces factories rejettent null et peuvent réutiliser une instance adaptée : ne dépendez pas de son identité.

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
