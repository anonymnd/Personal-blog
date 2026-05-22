---
title: "Records and Immutable Value Objects: What Is Really Immutable?"
description: "An analysis of shallow vs deep immutability in Java records and classes, focusing on defensive copying of mutable collections."
pubDate: 2026-10-07T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
seriesOrder: 25
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## The Illusion of Record Immutability

Java records are often marketed as immutable data carriers. While it is true that record components are marked `final`, this only provides **shallow immutability**. A record is immutable only if all its components are themselves immutable. If a record contains a reference to a mutable object, such as a `List` or a `Map`, the reference cannot be changed to point to a different list, but the contents of that list can still be modified.

## Shallow vs. Deep Immutability

Shallow immutability means the fields of the object cannot be reassigned. Deep immutability means the entire object graph reachable from that object is unchangeable.

Consider a `RouteSummary` that tracks stop names. If we use a standard `java.util.List`, we create a leak in our immutability contract.

### The Vulnerable Implementation (Illustrative)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {}

// Usage
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// The leak: modifying the original list affects the record
myStops.add("Tangier"); 
System.out.println(summary.stops()); // Output: [Casablanca, Rabat, Tangier]
```

In this example, the `RouteSummary` record is shallowly immutable. The `stops` field cannot be replaced with a new list, but the `ArrayList` it points to is mutable. This breaks the core promise of a Value Object: that its state remains constant throughout its lifecycle.

## Protecting the State: Defensive Copies

To achieve deep immutability, we must ensure that no mutable references escape the object or are accepted from the outside without being copied. For records, this is achieved by overriding the canonical constructor.

Using `List.copyOf()` (introduced in Java 10) is the standard approach. It returns an unmodifiable list. If the provided list is already an unmodifiable list produced by `List.copyOf`, it returns the original to avoid redundant copying.

### The Robust Implementation (Illustrative)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {
    public RouteSummary {
        // Defensive copy to ensure deep immutability
        stops = List.copyOf(stops);
    }
}

// Usage
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// This will now throw UnsupportedOperationException
try {
    summary.stops().add("Tangier");
} catch (UnsupportedOperationException e) {
    System.out.println("Immutable! Cannot modify the list.");
}

// Modifying the original source list no longer affects the record
myStops.add("Tangier");
System.out.println(summary.stops()); // Output: [Casablanca, Rabat]
```

## Immutability in Standard Classes

Records simplify the syntax, but classes can be equally immutable. To make a class immutable, you must:
1. Declare the class as `final` so it cannot be subclassed.
2. Make all fields `private` and `final`.
3. Provide no setter methods.
4. Perform defensive copies of mutable fields in the constructor and getters.

## Consequences for Equality

Records automatically implement `equals()` and `hashCode()` based on the state of their components. If a record contains a mutable list that is modified (in the shallowly immutable case), the `hashCode` of the record changes. This is dangerous if the record is used as a key in a `HashMap`, as the object will become "lost" in the map because it is now stored under the wrong bucket.

## Exercise

**Scenario:** You have a record `UserPreferences` containing a `Set<String>` of tags. The current implementation allows the tags to be modified from outside the record.

**Task:** Rewrite the record to ensure that the `Set` is deeply immutable.

**Answer:**
```java
import java.util.*;

public record UserPreferences(String userId, Set<String> tags) {
    public UserPreferences {
        tags = Set.copyOf(tags);
    }
}
```

List.copyOf and Set.copyOf make the collection unmodifiable, not mutable elements deeply immutable. Strings make these specific examples safe; nested mutable values need additional design. These factories reject nulls and may reuse suitable instances, so do not depend on returned object identity.

## Further reading

- [Java records](https://dev.java/learn/records/)
