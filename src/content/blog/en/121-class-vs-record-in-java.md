---
title: "Class vs Record in Java"
description: "Learn when to use a traditional Java class versus a Record for handling data-centric objects."
pubDate: 2026-10-11T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a `PurchaseRequest`. You need a way to move this data from the requester to the manager. If you use a standard class, you spend half your time writing getters, `equals()`, `hashCode()`, and `toString()` just to ensure the manager's approval logic compares the requests correctly. This boilerplate obscures the actual business logic.

## The core difference
A regular class can be mutable or immutable; you choose its fields, constructors and behavior. A record is a restricted class for transparent data carriers. Records were previewed in Java 14 and finalized in Java 16. The compiler supplies component fields, a canonical constructor, component accessors, and implementations of equals, hashCode and toString. A record can also declare validation and additional methods, but cannot extend another class or add arbitrary instance fields.
## Mechanism of Records
Records are shallowly immutable. This means the references they hold cannot be changed once assigned, but if a record contains a `List`, the contents of that list can still be modified. They are final by default, meaning you cannot extend a record.

## Worked Example: Procurement Request
Here is how we model a request using both approaches. Notice how the record eliminates the noise.

```java
// Traditional Class approach
public class RequestDTO {
    private final String item;
    private final int quantity;

    public RequestDTO(String item, int quantity) {
        this.item = item;
        this.quantity = quantity;
    }
    public String getItem() { return item; }
    public int getQuantity() { return quantity; }
    // equals(), hashCode(), and toString() would go here (20+ lines)
}

// Record approach
public record RequestRecord(String item, int quantity) {}
```

Outcome: `RequestRecord` provides the exact same functionality as `RequestDTO` but in one line. If you compare two `RequestRecord` objects with the same values, `equals()` returns `true` automatically.

## Common mistake: confusing shallow and deep immutability
A record component cannot be reassigned after construction, but its referenced object can still be mutable. Use `List.copyOf(items)` in a compact constructor to protect a list against later structural changes through the original list reference. That copy is unmodifiable, not deeply immutable: mutable elements can still change. Use immutable element types or defensive copies of elements when the domain requires stronger guarantees.
## Practical Exercise
Create a record called `Order` with a `String orderId` and a `double totalAmount`. How would you access the `orderId` of an instance named `myOrder`?

**Answer:** You use the accessor method `myOrder.orderId()` (note that records do not use the `get` prefix).


## Further reading

- [Java records](https://dev.java/learn/records/)
