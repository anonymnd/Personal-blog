---
title: "Why Good Architecture Is About Boundaries, Not Folder Names"
description: "Learn why logical separation of domain capabilities is more critical for maintainability than the physical organization of files."
pubDate: 2026-10-17T13:48:00.000Z
translationKey: 262-why-good-architecture-is-about-boundaries-not-folder-names
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers believe that creating a folder named `services` or `repositories` is the first step toward a clean architecture. However, you can have a perfectly organized folder structure while still possessing a 'Big Ball of Mud' where every class depends on every other class. The real struggle isn't where the file sits, but how the logic is bounded.

## The Illusion of Folder Organization
Folders are physical containers, but architecture is about logical boundaries. If your `OrderService` directly modifies the internal state of a `User` object without a defined interface, moving those files into separate folders doesn't stop the coupling. High cohesion means things that change together stay together; low coupling means different modules don't break each other when one changes.

## Defining Domain Boundaries
Instead of organizing by technical role (Controller, Service, DAO), organize by domain capability. In a procurement app, the 'Request' logic should be isolated from the 'Approval' logic. Even in a monolith, these should act as separate modules. If you decide to move to microservices later, these boundaries make the transition possible. Without them, you have a distributed monolith—the worst of both worlds.

## Worked Example: Procurement Logic
Consider a request submission. Instead of one giant `ProcurementService`, we define a boundary for the `RequestModule`.

```java
// Boundary: RequestModule
public class RequestService {
    public RequestId submitRequest(RequestDetails details) {
        // Logic for creating a request
        return new RequestId("REQ-123");
    }
}

// Boundary: ApprovalModule
public class ApprovalService {
    public void approve(RequestId id, Manager manager) {
        // Logic for manager approval
        // This module only knows the RequestId, not the internal RequestDetails
    }
}
```
Outcome: The `ApprovalService` cannot accidentally modify the `RequestDetails` because it only interacts with the `RequestId` boundary.

## Common Mistake: The Interface Trap
Developers often think adding an interface (`IOrderService`) automatically creates a boundary. It doesn't. If the interface simply mirrors every method of the implementation, you have 'leaky abstractions.' A true boundary hides complexity and only exposes what is necessary for the other module to function.

## Practical Exercise
Scenario: You have a `BuyerModule` and a `PaymentModule`. The `BuyerModule` needs to know if a payment was successful to ship an item. Should the `BuyerModule` call `PaymentRepository.findByTransactionId()` directly?

**Answer:** No. It should call a method in the `PaymentService` boundary (e.g., `isPaymentCleared(id)`). This prevents the `BuyerModule` from depending on the database schema of the payment system.
