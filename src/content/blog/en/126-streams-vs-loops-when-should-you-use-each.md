---
title: "Choose Loops, Streams and Method References by Readability"
description: "A technical comparison of iterative and functional styles in Java using sensor data processing to evaluate readability and side effects."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 126-streams-vs-loops-when-should-you-use-each
seriesOrder: 27
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## The Trade-off: Imperative vs. Functional

When processing collections in Java, the choice between a `for-each` loop and a `Stream` is rarely about performance and almost always about intent. Imperative loops describe *how* to do something (step-by-step state changes), while Streams describe *what* should happen (a pipeline of transformations).

## Scenario: Sensor Data Summarization

Consider a system receiving sensor readings. We need to filter out invalid readings (null or negative) and count how many times the temperature exceeded a specific threshold. 

### The Imperative Approach (Loop)

In a loop, we manually manage the state. This is often more readable when the logic involves complex branching or when you need to modify external variables (side effects).

```java
// Illustrative: Imperative loop approach
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

### The Functional Approach (Stream)

Streams allow us to chain operations. The key mechanism here is **laziness**: intermediate operations like `filter` do not execute until a terminal operation like `count()` is called. This allows the JVM to optimize the pipeline.

```java
// Illustrative: Stream approach
public long countThresholdCrossingsStream(List<Double> readings, double threshold) {
    return readings.stream()
        .filter(Objects::nonNull)
        .filter(r -> r >= 0)
        .filter(r -> r > threshold)
        .count();
}
```

## Method References and Readability

In the stream example, `Objects::nonNull` is a method reference. It is a shorthand for the lambda `r -> Objects.nonNull(r)`. Method references improve readability by removing the "noise" of the variable name and focusing on the behavior.

**When to use method references:**
1. When the lambda simply calls an existing method with the provided arguments.
2. When the method name clearly describes the intent (e.g., `String::toUpperCase` vs `s -> s.toUpperCase()`).

## Analysis of Side Effects and Ordering

One of the biggest risks in Streams is the "side effect." A side effect occurs when a stream operation modifies a variable outside its own scope.

**Bad Practice (Side Effect in Stream):**
```java
List<Double> results = new ArrayList<>();
readings.stream().forEach(r -> results.add(r)); // Avoid this!
```
This is fragile. If the stream were changed to `.parallelStream()`, the `ArrayList` (which is not thread-safe) would suffer from race conditions, leading to missing data or `ConcurrentModificationException`.

**Ordering:**
In a sequential stream, the order of elements is preserved. However, the order of *operations* matters. Filtering early reduces the number of elements passing through subsequent, potentially more expensive, operations.

## Comparison Summary

| Feature | For-Each Loop | Stream API |
| :--- | :--- | :--- |
| **State** | Explicitly managed (mutable) | Encapsulated in pipeline |
| **Execution** | Eager | Lazy (until terminal op) |
| **Side Effects** | Natural and expected | Discouraged/Dangerous |
| **Readability** | Better for complex logic | Better for linear transformations |

## Exercise

Given a list of `SensorReading` records (containing a `String id` and `double value`), write a stream pipeline that:
1. Filters out readings where the ID is null.
2. Maps the readings to their values.
3. Filters values greater than 100.0.
4. Returns the count.

**Answer:**
```java
public long countHighReadings(List<SensorReading> readings) {
    return readings.stream()
        .filter(r -> r.id() != null)
        .map(SensorReading::value)
        .filter(v -> v > 100.0)
        .count();
}
```

These examples assume the sensor domain rejects negative readings; negative temperatures are valid in other domains. The exercise assumes non-null SensorReading objects; filter Objects::nonNull first if null records are possible. Encounter order depends on the source and operations; a sequential stream does not create an order for an unordered source.

## Further reading

- [Java records](https://dev.java/learn/records/)
