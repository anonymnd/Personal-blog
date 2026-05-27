---
title: "Identité des Types Java : Packages et Class Loaders"
description: "Explication de pourquoi des classes avec des noms identiques sont des types distincts et comment gérer le mappage sécurisé."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
seriesOrder: 24
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## La Définition d'un Type en Java

En Java, une classe n'est pas identifiée par son nom simple (ex: `Money`), mais par son Nom Qualifié Complet (FQN - Fully Qualified Name). Le FQN se compose du nom du package et du nom de la classe. Si deux classes partagent le même nom simple mais résident dans des packages différents, la JVM les traite comme des types totalement distincts.

L'identité du type est également liée au ClassLoader. Une classe est identifiée de manière unique par la combinaison de son FQN et du ClassLoader qui l'a définie. Si le même fichier `.class` est chargé par deux ClassLoaders différents, les objets `Class` résultants sont distincts, et toute tentative de conversion (cast) de l'un vers l'autre déclenchera une `ClassCastException`.

## Scénario : Conflit avec un SDK Hérité

Imaginons un scénario où votre application définit un record `Money` pour la logique métier interne, mais vous devez intégrer un SDK hérité qui fournit également sa propre classe `Money`. Comme il s'agit de types différents, vous ne pouvez pas utiliser un cast pour convertir l'un en l'autre, même si leurs champs sont identiques.

### Implémentation Illustrative

```java
// Type du domaine applicatif
package com.app.domain;

public record Money(java.math.BigDecimal amount, String currency) {}

// Type du SDK hérité
package com.legacy.sdk;

public class Money {
    private final java.math.BigDecimal value;
    private final String isoCode;

    public Money(java.math.BigDecimal value, String isoCode) {
        this.value = value;
        this.isoCode = isoCode;
    }

    public java.math.BigDecimal getValue() { return value; }
    public String getIsoCode() { return isoCode; }
}
```

## Mappage Sécurisé aux Frontières

Lors du transfert de données entre le SDK et votre application, vous devez implémenter un mécanisme de mappage explicite. Un cast échoue car la JVM vérifie l'identité du type (FQN + ClassLoader) au moment de l'exécution.

### Exemple de Mappage Appliqué

```java
package com.app.service;

import java.util.Optional;
import com.app.domain.Money; // Type applicatif

public class CurrencyConverter {

    public com.app.domain.Money mapToDomain(com.legacy.sdk.Money sdkMoney) {
        if (sdkMoney == null) return null;

        // Conversion explicite : extraction des valeurs pour construire une nouvelle instance
        return new com.app.domain.Money(
            sdkMoney.getValue(),
            sdkMoney.getIsoCode()
        );
    }

    public void processPayment(com.legacy.sdk.Money sdkMoney) {
        // Ceci provoquerait une ClassCastException :
        // com.app.domain.Money domainMoney = (com.app.domain.Money) sdkMoney;

        com.app.domain.Money domainMoney = mapToDomain(sdkMoney);
        System.out.println("Traité : " + domainMoney.amount());
    }
}
```

### Analyse du Mécanisme
1. **Résolution du FQN** : Le compilateur utilise les imports pour distinguer `com.app.domain.Money` de `com.legacy.sdk.Money`. Dans un seul fichier, si les deux sont nécessaires, l'un ou les deux doivent être référencés par leur chemin complet.
2. **Allocation Mémoire** : `mapToDomain` crée un nouvel objet sur le tas (heap). Il ne modifie pas l'identité de l'objet du SDK ; il projette son état dans un type compris par l'application.
3. **Cas d'Échec** : Si un développeur tente d'utiliser une référence `Object` provenant du SDK et la cast vers le `Money` du domaine, la JVM verra que la classe a été chargée depuis le package `com.legacy.sdk` et rejettera le cast, quels que soient les noms des champs.

## Exercice

**Question** : Vous avez une classe `com.util.Config` et une classe `com.internal.Config`. Vous recevez un objet de type `Object` que vous savez être un `com.util.Config`. Que se passe-t-il si vous exécutez `(com.internal.Config) receivedObject` ? Comment transférer les données en toute sécurité de la config utilitaire vers la config interne ?

**Réponse** : Une `ClassCastException` est levée car les FQN diffèrent. Pour transférer les données, vous devez utiliser un mappeur explicite : instanciez `com.internal.Config` et passez manuellement les valeurs récupérées depuis l'instance `com.util.Config` via ses méthodes getters.

Les déclarations de package illustrées appartiennent à des fichiers séparés. Java ne possède pas de syntaxe d’alias d’import. Un cast direct entre ces types finaux sans relation peut être refusé à la compilation ; passer par Object peut compiler puis échouer à l’exécution. La distinction porte sur le loader qui définit la classe : deux loaders initiateurs peuvent déléguer à la même définition et obtenir le même type.

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
