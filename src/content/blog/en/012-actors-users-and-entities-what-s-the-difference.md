---
title: "Actors, Users and Entities: What’s the Difference?"
description: "Learn how to distinguish between the roles that interact with your system and the data objects that live inside it."
pubDate: 2026-10-07T03:48:00.000Z
translationKey: 012-actors-users-and-entities-what-s-the-difference
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are designing a procurement system. You start by listing 'The Manager' in your requirements. But wait—is the Manager a person using a screen, a role with specific permissions, or a record in the database? Confusing these three concepts leads to rigid code and security holes.

## The External Actor
An Actor is any entity *outside* the system boundary that interacts with it. An actor is a role, not a specific person. For example, a 'Requester' is an actor. Interestingly, an actor doesn't have to be human; an external 'Accounting API' that sends payment confirmations is also an actor. Actors define *who* or *what* triggers a process.

## The Authenticated User
While an actor is a role, a User is a specific account. A User is the bridge between the physical person and the system. One User might play multiple Actor roles. For instance, 'Ahmed' is a User who can act as both a 'Requester' (to ask for a laptop) and a 'Manager' (to approve his team's requests). Users are tied to credentials and sessions.

## The Domain Entity
An Entity is a business object with a unique identity that persists over time. Unlike a User (which is about access), an Entity is about the business logic. In our procurement app, a `PurchaseRequest` is an entity. It has an ID, a status, and a total. Even if the User who created it leaves the company, the `PurchaseRequest` entity remains in the system.

## Worked Example: The Approval Flow
Consider this logic in a Java-like structure:

```java
// Entity: The business object
public class PurchaseRequest {
    private Long id;
    private String item;
    private RequestStatus status;
    // Getters and setters
}

// Logic: Actor role check
public void approveRequest(User user, PurchaseRequest request) {
    if (!user.hasRole("MANAGER")) {
        throw new UnauthorizedException("Only Managers can approve");
    }
    request.setStatus(RequestStatus.APPROVED);
}
```
Outcome: The system validates the User's role (Actor) before modifying the state of the business object (Entity).

## Common Mistake: The 'User-Entity' Merge
A frequent error is treating the User account as the primary business entity. If you store the 'Department' or 'Approval Limit' directly on the User object, you cannot easily track how those limits changed over time. Instead, create a `EmployeeProfile` entity linked to the User.

## Practical Exercise
In a system where a 'Buyer' places an order based on an approved request, identify the Actor, the User, and the Entity.

**Check:** Actor: Buyer; User: The person logged in (e.g., Sarah); Entity: Order.
