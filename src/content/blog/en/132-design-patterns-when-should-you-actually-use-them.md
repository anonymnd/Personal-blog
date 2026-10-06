---
title: "Design Patterns: When Should You Actually Use Them?"
description: "A practical guide to avoiding over-engineering by identifying the exact moment a design pattern becomes necessary."
pubDate: 2026-10-12T03:48:00.000Z
translationKey: 132-design-patterns-when-should-you-actually-use-them
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers fall into the trap of 'pattern-hunting,' where they try to force a Singleton or a Factory into a project before the problem even exists. This leads to bloated code and unnecessary abstraction layers that make the application harder to debug.

## The Trigger for a Pattern
A design pattern is not a starting point; it is a solution to a recurring problem. You should only implement one when you feel a specific 'friction' in your code. For example, if you find yourself writing the same complex initialization logic in five different classes, you have a creation problem. If changing one business rule requires modifying ten different files, you have a structural problem.

## Practical Example: Procurement Workflow
Imagine a procurement app where a `PurchaseRequest` needs different validation based on the department. Initially, you might use a long `if-else` chain. As you add more departments (IT, HR, Marketing), the code becomes unmanageable.

Instead of a massive conditional block, the **Strategy Pattern** becomes the right choice here. You define a `ValidationStrategy` interface and create specific implementations for each department.

```java
public interface ValidationStrategy {
    boolean validate(PurchaseRequest request);
}

public class ITValidation implements ValidationStrategy {
    public boolean validate(PurchaseRequest request) {
        // Check if hardware is in approved list
        return request.getAmount() < 5000;
    }
}
```
By switching to this pattern, you can add a new department without touching the existing validation logic, adhering to the Open/Closed Principle.

## The Common Mistake: Pre-emptive Abstraction
A frequent error is creating a `GenericManagerFactory` for a class that will only ever have one implementation. This adds three extra files and an interface for no reason. 

**Correction:** Start with a simple concrete class. Only extract an interface or implement a factory when you actually have a second implementation or a need to mock the class for unit testing.

## When to Walk Away
If a pattern makes the code harder to read for a junior developer without providing a clear benefit in flexibility or maintainability, remove it. Simplicity is a feature.

## Practical Exercise
You have a `NotificationService` that sends emails. Now, the client wants to add SMS and Push notifications. Should you use a pattern now or wait?

**Answer:** Now is the time. Use the Strategy or Observer pattern to decouple the notification trigger from the delivery method.


## Further reading

- [Java records](https://dev.java/learn/records/)
