---
title: "How to Decide Module Boundaries"
description: "A guide to organizing domain capabilities to balance cohesion and coupling in software architecture."
pubDate: 2026-10-17T09:48:00.000Z
translationKey: 258-how-to-decide-module-boundaries
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. At first, you put everything in one package. But as you add features like 'Request Approval' and 'Vendor Ordering', your code becomes a 'big ball of mud'. Changing the approval logic accidentally breaks the ordering process because the classes are too intertwined. This is the classic struggle of deciding where one module ends and another begins.

## Understanding Cohesion and Coupling
Module boundaries are not just about creating folders; they are about grouping related behaviors. High cohesion means everything inside a module belongs together to achieve a single purpose. Low coupling means modules depend on each other as little as possible. If changing a field in the `Request` entity forces you to rewrite the `Buyer` service, your boundaries are likely misplaced.

## Domain-Driven Boundaries
Instead of technical layers (like 'services' or 'repositories'), define boundaries based on domain capabilities. In our procurement app, we can identify three distinct modules:
1. **Request Module**: Handles the submission and validation of requests.
2. **Approval Module**: Manages the workflow and manager signatures.
3. **Ordering Module**: Handles the interaction with external vendors.

## A Worked Example
Consider the transition from a request to an order. Instead of the `RequestService` directly calling `OrderService.create()`, we use a boundary-crossing mechanism. 

```java
// In Request Module
public class RequestService {
    public void finalizeRequest(Long requestId) {
        // Logic to mark request as approved
        // Emit event: RequestApprovedEvent
    }
}

// In Ordering Module
public class OrderListener {
    public void onRequestApproved(RequestApprovedEvent event) {
        // Logic to create a purchase order
    }
}
```
By using an event, the Request module doesn't need to know how the Ordering module works. The boundary is clean.

## Common Mistake: The Interface Illusion
Many developers believe that putting an interface between two classes eliminates coupling. It does not. If the `ApprovalInterface` requires a `Request` object that is deeply tied to the `RequestModule` internals, you still have tight coupling. The boundary is only effective if the data exchanged is a simple, stable contract.

## Practical Exercise
**Scenario**: You have a module that handles both 'User Profiles' and 'Payment Methods'. Users often change their profiles, but payment methods change rarely and require strict security. Should these stay in one module?

**Answer**: No. They should be split. They have different rates of change (volatility) and different security requirements, meaning they lack cohesion.
