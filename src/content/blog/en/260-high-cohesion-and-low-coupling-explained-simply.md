---
title: "High Cohesion and Low Coupling Explained Simply"
description: "Learn how to organize your code modules to reduce dependencies and increase maintainability using the core principles of cohesion and coupling."
pubDate: 2026-10-17T11:48:00.000Z
translationKey: 260-high-cohesion-and-low-coupling-explained-simply
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You start by putting the requester's form, the manager's approval logic, and the buyer's ordering system all inside one giant class called `ProcurementManager`. At first, it seems easy, but soon, changing how a manager approves a request accidentally breaks the buyer's ordering logic. This is the classic struggle of poor architectural boundaries.

## Understanding Cohesion
Cohesion refers to how closely related the responsibilities inside a single module are. High cohesion means a module does one thing and does it well. In our procurement app, if the `ApprovalService` only handles the logic for verifying manager permissions and updating request statuses, it has high cohesion. If it also handles sending emails and calculating taxes, its cohesion drops because it's trying to be too many things at once.

## Understanding Coupling
Coupling is the degree of interdependence between different modules. Low coupling means one module can change without forcing changes in others. If the `BuyerService` directly accesses the internal database tables of the `RequesterService`, they are tightly coupled. If the `BuyerService` instead calls a simple method like `getRequestDetails()`, the coupling is lower because the internal storage details are hidden.

## A Worked Example
Consider these two approaches for handling a purchase request:

**Tightly Coupled/Low Cohesion:**
```java
public class ProcurementSystem {
    public void processRequest(Request req) {
        // Validation logic
        // Approval logic
        // Ordering logic
        // Email logic
    }
}
```
**Loosely Coupled/High Cohesion:**
```java
public class ApprovalService {
    public boolean approve(Request req) { /* logic */ return true; }
}

public class OrderService {
    public void placeOrder(Request req) { /* logic */ }
}
```
In the second version, the `OrderService` doesn't care how the `ApprovalService` works; it only cares that the request was approved. This separation allows you to change the approval workflow without touching the ordering code.

## Common Mistake: The Interface Illusion
Many developers think that simply adding an interface (e.g., `IApprovalService`) automatically creates low coupling. However, if the interface method requires a complex object that is tightly bound to another module's internals, you still have high coupling. Coupling is about the *dependency*, not just the *syntax*.

## Practical Exercise
**Scenario:** You have a `NotificationModule` that contains code for sending SMS, Emails, and also calculates the user's monthly billing discount.
**Question:** Is this high or low cohesion? How do you fix it?

**Answer:** This is low cohesion. The billing logic does not belong in a notification module. Fix it by moving the discount calculation to a separate `BillingService`.
