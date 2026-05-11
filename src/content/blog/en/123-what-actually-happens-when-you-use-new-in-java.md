---
title: "What Actually Happens When You Use new in Java?"
description: "A deep dive into the memory allocation and initialization process that occurs when creating a Java object."
pubDate: 2026-10-11T18:48:00.000Z
translationKey: 123-what-actually-happens-when-you-use-new-in-java
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many beginners think `new` simply 'creates an object', but this hides a complex sequence of events involving the JVM, the heap, and the class loader. If you have ever wondered why a constructor is called or where exactly your data lives, you are looking at the lifecycle of object instantiation.

## The Class Loading Phase
Before `new` can allocate memory, the JVM must ensure the class definition is available. If the class hasn't been loaded yet, the ClassLoader finds the `.class` file, verifies the bytecode, and creates a `java.lang.Class` object in the Metaspace. Without this blueprint, the JVM wouldn't know how many bytes to allocate for the object's fields.

## Memory Allocation on the Heap
Once the blueprint is ready, the JVM calculates the total size needed for all instance variables. It then allocates a contiguous block of memory on the Heap. At this exact moment, the object exists in a 'blank' state; all numeric fields are set to 0, booleans to `false`, and object references to `null`. This is why you can sometimes see default values before the constructor even runs.

## The Initialization Sequence
Now, the JVM executes the initialization logic in a specific order: first, the instance initializers and field assignments are processed, and then the constructor is called. If the class has a superclass, `super()` is implicitly called first to ensure the parent state is established before the child adds its own logic.

## Worked Example: Procurement Request
Consider a simple request object in a procurement app:

```java
public class PurchaseRequest {
    private double amount = 0.0;
    private String item;

    public PurchaseRequest(String item, double amount) {
        this.item = item;
        this.amount = amount;
    }
}

// Execution
PurchaseRequest req = new PurchaseRequest("Laptop", 1200.00);
```
**Outcome:** The JVM allocates memory for one `double` and one reference to a `String`. It sets `amount` to 0.0, then the constructor updates `item` to point to the "Laptop" string and `amount` to 1200.00. Finally, the address of this heap memory is assigned to the variable `req` on the stack.

## Common Mistake: Confusing Reference with Object
A frequent error is thinking that `PurchaseRequest req;` creates an object. It does not. It only creates a reference variable on the stack. The object is only created when `new` is invoked. Assigning `req = null` doesn't delete the object; it just breaks the link, leaving the object for the Garbage Collector.

## Practical Exercise
What is the state of an object's fields immediately after memory allocation but before the constructor runs?

**Answer:** They are initialized to their default values (0, false, or null).


## Further reading

- [Java records](https://dev.java/learn/records/)
