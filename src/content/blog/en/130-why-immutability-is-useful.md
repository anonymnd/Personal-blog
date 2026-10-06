---
title: "Why Immutability Is Useful"
description: "Explore how creating objects that cannot change after instantiation prevents bugs and simplifies state management in Java applications."
pubDate: 2026-10-12T01:48:00.000Z
translationKey: 130-why-immutability-is-useful
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a `PurchaseRequest` is submitted. A requester creates the request, a manager approves it, and a buyer processes it. If the request object is mutable, a developer might accidentally change the requested amount after the manager has already approved it, leading to financial discrepancies and hard-to-track bugs.

## The Core Mechanism
Immutability means that once an object is created, its state cannot be modified. In Java, this is achieved by declaring fields as `final` and ensuring no setter methods exist. When you need to change a value, you don't modify the existing object; instead, you create a new instance with the updated data. This ensures that any part of the system holding a reference to the object can trust that its data remains constant.

## Practical Implementation with Records
Java Records provide a concise way to implement shallow immutability. Since all fields in a record are final by default, they are ideal for Data Transfer Objects (DTOs).

```java
public record PurchaseRequest(long id, String item, double amount) {}

// Usage
PurchaseRequest request = new PurchaseRequest(101, "Laptop", 1200.00);
// request.amount = 1500.00; // Compilation error: fields are final
```

## Thread Safety and Predictability
In a multi-threaded environment, mutable objects require complex synchronization (like `synchronized` blocks) to prevent race conditions. Immutable objects are inherently thread-safe. Because their state never changes, multiple threads can read them simultaneously without any risk of seeing a partially modified state or causing data corruption.

## Common Mistake: Shallow vs. Deep Immutability
A frequent error is assuming a `record` or a class with `final` fields is fully immutable if it contains a mutable collection. 

*Wrong:* `public record Order(List<String> items) {}` — The list reference is final, but the contents of the list can still be changed via `.add()`.
*Correction:* Use `List.copyOf()` in the constructor to ensure the collection itself is unmodifiable.

## Practical Exercise
Create an immutable class `UserSession` with a `userId` and a `token`. How would you "update" the token for an existing session?

**Answer:** Since the object is immutable, you cannot update the token. You must create a new `UserSession` instance passing the existing `userId` and the new `token` value.


## Further reading

- [Java records](https://dev.java/learn/records/)
