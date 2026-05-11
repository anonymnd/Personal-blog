---
title: "What Is a Modular Monolith?"
description: "An exploration of how to organize a single deployment unit into independent domain modules to avoid the 'big ball of mud'."
pubDate: 2026-10-17T06:48:00.000Z
translationKey: 255-what-is-a-modular-monolith
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. At first, everything is simple. But as you add features for requesters, managers, and buyers, your code becomes a tangled web. Changing the approval logic accidentally breaks the ordering process. This is the 'Big Ball of Mud'—a classic monolithic failure where every part of the system depends on every other part.

## The Concept of Modular Monoliths
A Modular Monolith is an architectural pattern where the application is deployed as a single unit (one JAR or one process), but the internal code is strictly partitioned into independent modules. Unlike a traditional monolith, where classes are organized by technical layers (controllers, services, repositories), a modular monolith organizes code by domain capabilities. Each module owns its own business logic and data structures, interacting with others only through well-defined interfaces.

## Boundaries and Cohesion
The goal is high cohesion within a module and low coupling between them. A boundary isn't just a folder; it is a rule. For example, the `Procurement` module should not directly access the `Inventory` module's internal database tables. Instead, it calls a public API provided by the `Inventory` module. This ensures that if you change how inventory is tracked, you only update one module, not the entire system.

## Worked Example: Procurement Flow
Consider these three modules: `Request`, `Approval`, and `Ordering`.

```java
// Inside Approval Module
public class ApprovalService {
    public void approveRequest(Long requestId) {
        // Logic to mark request as approved
        // Then notify Ordering module via an internal event or interface
        orderingClient.createPurchaseOrder(requestId);
    }
}
```
In this setup, the `Approval` module doesn't need to know how a `PurchaseOrder` is created; it only knows that the `Ordering` module provides a method to do it. The outcome is a system that is easy to navigate and test, while remaining simple to deploy.

## Common Mistake: The Interface Illusion
A frequent error is thinking that putting an interface between two modules automatically removes coupling. If the `Request` module's interface requires a complex object that belongs to the `Ordering` module, they are still tightly coupled. To fix this, use simple Data Transfer Objects (DTOs) or primitive IDs to pass information across boundaries.

## Practical Exercise
**Scenario:** You have a `User` module and a `Notification` module. The `User` module needs to send a welcome email when a user signs up.
**Question:** Should the `User` module call the `Notification` module's internal database to find the email template, or call a public `sendEmail()` method?
**Answer:** It must call the public `sendEmail()` method to maintain the boundary and avoid coupling.
