---
title: "How to Identify the Actors of an Application"
description: "Learn to distinguish between actors, users, and entities to build a precise foundation for your application's business logic."
pubDate: 2026-10-07T04:48:00.000Z
translationKey: 013-how-to-identify-the-actors-of-an-application
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imagine you are tasked with building a procurement system. You start listing 'The Employee' and 'The Request' as the main players. Suddenly, you realize you are mixing people with data. This is a common hurdle: confusing the *actor* (who triggers the action) with the *entity* (what is being acted upon) or the *user* (the account credentials). Identifying actors correctly is the only way to define clear boundaries for your use cases.

## Actor vs. User vs. Entity
An actor is a role played by an external entity that interacts with your system to achieve a goal. It is not a specific person, but a functional role. A *user* is a technical implementation of an actor (an account with a password). An *entity* is a business object (like an Invoice) that exists within the system but cannot "do" anything on its own.

| Concept | Nature | Example | Action |
| :--- | :--- | :--- | :--- |
| Actor | Role | Procurement Manager | Approves a request |
| User | Account | john_doe_92 | Logs into the system |
| Entity | Data | Purchase Request | Is updated to 'Approved' |

## Mapping the Procurement Flow
In a procurement app, we identify actors by looking at who initiates a process. 
1. **Requester**: The person who needs a tool and submits a request.
2. **Manager**: The person who reviews the budget and grants approval.
3. **Buyer**: The person who contacts the vendor to place the order.
4. **External Vendor System**: An API that sends a shipping notification (Actors can be other systems).

## Worked Example: The Approval Trigger
Consider the action: "Approve Purchase Request".
- **Actor**: Manager.
- **Goal**: Ensure the spend is within budget.
- **Outcome**: The request status changes from `PENDING` to `APPROVED`.
- **Unhappy Path**: The Manager rejects the request due to insufficient funds. The system must notify the Requester.

## Common Mistake: The 'System' Actor
Beginners often list "The System" as an actor. The system is what you are building; it cannot be its own actor. If the system performs a scheduled task (like a midnight report), the actor is actually a **Timer** or a **Scheduler**.

## Practical Exercise
Scenario: A library app where a member borrows a book and a librarian manages the inventory.
**Question**: Identify the actors and one entity.
**Check**: Actors: Member, Librarian. Entity: Book.
