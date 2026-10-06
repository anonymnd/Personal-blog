---
title: "How to Organize a Large Spring Boot Project"
description: "A guide to structuring complex Spring Boot applications using a modular monolith approach to prevent the 'big ball of mud'."
pubDate: 2026-10-17T08:48:00.000Z
translationKey: 257-how-to-organize-a-large-spring-boot-project
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers start a project with a simple package structure, but as the application grows, they hit a wall where every class seems to depend on every other class. This 'big ball of mud' makes it impossible to change one feature without breaking three others. The solution isn't immediately jumping to microservices, but rather organizing your monolith into distinct modules based on domain boundaries.

## Domain-Driven Packaging
Instead of organizing by technical layer (putting all controllers in one folder and all services in another), organize by feature. In a procurement app, you would have separate packages for `request`, `approval`, and `ordering`. This ensures that the logic for a purchase request stays close to its data model, increasing cohesion.

## Defining Module Boundaries
To prevent tight coupling, each module should have a clear entry point. Only the service layer of a module should be accessible to other modules. If the `Ordering` module needs to know if a request is approved, it should call an `ApprovalService` interface, not manipulate the `ApprovalEntity` directly.

## Worked Example: Procurement Flow
Consider this simplified structure:
- `com.app.request`: Handles submission of needs.
- `com.app.approval`: Handles manager sign-offs.
- `com.app.ordering`: Handles vendor communication.

```java
// In com.app.ordering.OrderingService
public void placeOrder(Long requestId) {
    // Correct: Call the approval module's service
    if (approvalService.isApproved(requestId)) {
        // logic to order from vendor
    }
}
```
Outcome: The `Ordering` module doesn't need to know how the approval logic works internally; it only cares about the result.

## Common Mistake: Circular Dependencies
A frequent error is when `RequestService` calls `ApprovalService`, and `ApprovalService` calls `RequestService`. This creates a circular dependency that prevents the application from starting or makes testing impossible. 

**Correction:** Introduce a third 'Orchestration' layer or use Spring Application Events to decouple the modules. Instead of calling the other service, the `ApprovalService` can publish an `ApprovalGrantedEvent` that the `Ordering` module listens for.

## Practical Exercise
If you have a `User` module and a `Notification` module, and the `User` module needs to send a welcome email, where should the logic reside to avoid tight coupling?

**Answer:** The `User` module should trigger a notification event, and the `Notification` module should handle the actual email sending logic.
