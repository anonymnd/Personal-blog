---
title: "Choisir entre Boucles, Streams et Références de Méthodes pour la Lisibilité"
description: "Comparaison technique des styles itératif et fonctionnel en Java via le traitement de données de capteurs pour évaluer la lisibilité et les effets de bord."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 126-streams-vs-loops-when-should-you-use-each
seriesOrder: 27
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## Le Compromis : Impératif vs Fonctionnel

Lors du traitement de collections en Java, le choix entre une boucle `for-each` et un `Stream` n'est pas une question de performance, mais d'intention. Les boucles impératives décrivent *comment* faire (changements d'état étape par étape), tandis que les Streams décrivent *ce qui* doit être fait (un pipeline de transformations).

## Scénario : Synthèse de Données de Capteurs

Imaginons un système recevant des lectures de capteurs. Nous devons filtrer les valeurs invalides (null ou négatives) et compter combien de fois la température a dépassé un seuil spécifique.

### L'Approche Impérative (Boucle)

Dans une boucle, nous gérons manuellement l'état. C'est souvent plus lisible lorsque la logique implique des branchements complexes ou nécessite de modifier des variables externes (effets de bord).

```java
// Illustratif : Approche par boucle impérative
public long countThresholdCrossingsLoop(List<Double> readings, double threshold) {
    long count = 0;
    for (Double reading : readings) {
        if (reading != null && reading >= 0) {
            if (reading > threshold) {
                count++;
            }
        }
    }
    return count;
}
```

### L'Approche Fonctionnelle (Stream)

Les Streams permettent de chaîner les opérations. Le mécanisme clé ici est la **paresse (laziness)** : les opérations intermédiaires comme `filter` ne s'exécutent pas tant qu'une opération terminale comme `count()` n'est pas appelée. Cela permet à la JVM d'optimiser le pipeline.

```java
// Illustratif : Approche par Stream
public long countThresholdCrossingsStream(List<Double> readings, double threshold) {
    return readings.stream()
        .filter(Objects::nonNull)
        .filter(r -> r >= 0)
        .filter(r -> r > threshold)
        .count();
}
```

## Références de Méthodes et Lisibilité

Dans l'exemple du stream, `Objects::nonNull` est une référence de méthode. C'est un raccourci pour la lambda `r -> Objects.nonNull(r)`. Les références de méthodes améliorent la lisibilité en supprimant le "bruit" du nom de la variable pour se concentrer sur le comportement.

**Quand utiliser les références de méthodes :**
1. Lorsque la lambda appelle simplement une méthode existante avec les arguments fournis.
2. Lorsque le nom de la méthode décrit clairement l'intention (ex: `String::toUpperCase` au lieu de `s -> s.toUpperCase()`).

## Analyse des Effets de Bord et de l'Ordre

L'un des plus grands risques des Streams est l'"effet de bord". Un effet de bord se produit lorsqu'une opération de stream modifie une variable en dehors de son propre scope.

**Mauvaise Pratique (Effet de bord dans un Stream) :**
```java
List<Double> results = new ArrayList<>();
readings.stream().forEach(r -> results.add(r)); // À éviter !
```
C'est fragile. Si le stream était transformé en `.parallelStream()`, l' `ArrayList` (qui n'est pas thread-safe) subirait des conditions de concurrence, entraînant des pertes de données ou une `ConcurrentModificationException`.

**Ordre :**
Dans un stream séquentiel, l'ordre des éléments est préservé. Cependant, l'ordre des *opérations* est crucial. Filtrer tôt réduit le nombre d'éléments passant par les opérations suivantes, potentiellement plus coûteuses.

## Résumé Comparatif

| Caractéristique | Boucle For-Each | API Stream |
| :--- | :--- | :--- |
| **État** | Géré explicitement (mutable) | Encapsulé dans le pipeline |
| **Exécution** | Immédiate (Eager) | Paresseuse (Lazy) |
| **Effets de Bord** | Naturels et attendus | Déconseillés/Dangereux |
| **Lisibilité** | Meilleure pour logique complexe | Meilleure pour transformations linéaires |

## Exercice

Étant donné une liste de records `SensorReading` (contenant un `String id` et un `double value`), écrivez un pipeline de stream qui :
1. Filtre les lectures où l'ID est null.
2. Mappe les lectures vers leurs valeurs.
3. Filtre les valeurs supérieures à 100.0.
4. Retourne le compte.

**Réponse :**
```java
public long countHighReadings(List<SensorReading> readings) {
    return readings.stream()
        .filter(r -> r.id() != null)
        .map(SensorReading::value)
        .filter(v -> v > 100.0)
        .count();
}
```

Ces exemples supposent que ce capteur rejette les valeurs négatives ; des températures négatives sont valides ailleurs. L’exercice suppose des records non null : filtrez Objects::nonNull sinon. L’ordre dépend de la source et des opérations ; sequential ne crée pas d’ordre pour une source non ordonnée.

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
