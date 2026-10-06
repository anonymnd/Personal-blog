---
title: "Object vs Reference in Java"
description: "Understand the critical distinction between a Java object and the reference variable used to access it to avoid common NullPointerException and logic bugs."
pubDate: 2026-10-11T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You create a `PurchaseRequest` object, but when you try to update its status in a method, the change doesn't seem to persist, or you suddenly encounter a `NullPointerException`. This usually happens because developers confuse the actual object (the data in memory) with the reference (the address to that data).

## An object and the values that refer to it
An object has state and identity; a reference value lets Java code access it. References are not limited to local variables: an object field or an array element can hold a reference too. The JVM presents objects through its runtime memory model, and optimizations can change their physical placement. You do not need an exposed numeric memory address to reason about aliasing. Two variables can hold reference values referring to the same object.
## Pass-by-Value Mechanism
A common misconception is that Java passes objects by reference. In reality, Java is always pass-by-value. When you pass an object to a method, you are passing a copy of the reference value. 

Consider this example:
```java
public void processRequest(PurchaseRequest request) {
    request.setStatus("APPROVED"); // Modifies the object on the heap
    request = new PurchaseRequest(); // Reassigns the local copy of the reference
}
```
In the code above, changing the status works because both the original and the copied reference point to the same object. However, reassigning `request` to a new object only changes the local copy; the original variable outside the method still points to the first object.

## Null versus an uninitialized local variable
A reference can have the value `null`, meaning it refers to no object. Dereferencing it, for example calling a method, normally throws a NullPointerException. An object field of reference type defaults to null unless initialized. A local variable declared as `PurchaseRequest req;` is different: Java will not let you use it before definite assignment, so you get a compile error. Writing `PurchaseRequest req = null;` assigns a value, but calling `req.setStatus(...)` then fails at runtime.
## Identity versus equality defined by the type
For references, `a == b` asks whether both refer to the same object, including the case where both are null. `a.equals(b)` asks the equality question implemented by the class. The inherited Object implementation also uses identity; a class must override equals to define value equality. String and records provide useful value comparisons. `Objects.equals(a, b)` is a null-safe way to invoke the appropriate equality logic. Choose identity or value equality according to the domain, rather than always replacing every == comparison.
## Practical Exercise
If you have `PurchaseRequest a = new PurchaseRequest("Laptop");` and `PurchaseRequest b = a;`, what happens to `a` if you call `b.setAmount(1000);`?

**Answer:** `a` will also reflect the amount as 1000 because both `a` and `b` are references to the same single object on the heap.


## Further reading

- [Java records](https://dev.java/learn/records/)
