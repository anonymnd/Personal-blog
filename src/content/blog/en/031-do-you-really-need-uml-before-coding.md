---
title: "Do You Really Need UML Before Coding?"
description: "An exploration of whether Unified Modeling Language is a necessity or an overhead during the initial phases of software development."
pubDate: 2026-10-07T22:48:00.000Z
translationKey: 031-do-you-really-need-uml-before-coding
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imagine you are building a procurement system where a requester submits a purchase request, a manager approves it, and a buyer finally places the order. You start coding immediately, but halfway through, you realize the manager's approval logic conflicts with the buyer's notification trigger. You spend three days refactoring code that could have been solved with a ten-minute sketch. This is where the debate about UML begins.

## The Purpose of Modeling
UML is not about creating art; it is about reducing ambiguity. While many developers view it as 'corporate overhead,' it serves as a blueprint. A Use Case diagram identifies who the actors are (Requester, Manager, Buyer) and their goals, ensuring no functional requirement is forgotten. An Activity diagram maps the decision flow—such as what happens if a manager rejects a request—before a single line of Java is written.

## Sequence Diagrams vs. Code
While a class diagram shows structure, a Sequence Diagram shows time and interaction. In our procurement app, a sequence diagram would explicitly show the order of calls: `RequestService` calling `NotificationService` only after `ApprovalService` returns a success status. This prevents the common mistake of triggering emails before the database transaction is actually confirmed.

## UML Classes are not SQL Tables
A frequent beginner mistake is treating a UML Class diagram as a direct database schema. A UML class represents behavior and state (methods and attributes), whereas a SQL table represents data persistence. For example, a `ProcurementRequest` class might have a method `calculateTotalTax()`, which has no direct equivalent in a relational table.

## A Worked Example: The Approval Flow
If we model the approval process, we define the interaction:
1. **Actor**: Manager
2. **Action**: `approveRequest(requestId)`
3. **Logic**: Check if `request.status == PENDING` $ightarrow$ Update to `APPROVED` $ightarrow$ Notify Buyer.

Without this model, a developer might forget to check the current status, allowing a request to be approved multiple times.

## Common Mistake: Over-Modeling
Many teams fall into the trap of 'Analysis Paralysis,' trying to model every single getter and setter. The correction is to model only the complex parts. Use a Sequence diagram for tricky logic and a Use Case diagram for scope, but skip the detailed Class diagram for simple POJOs.

## Practical Exercise
**Scenario**: The Buyer needs to mark a request as 'Ordered'. Which UML diagram best illustrates the step-by-step interaction between the Buyer, the OrderService, and the InventorySystem?

**Answer**: A Sequence Diagram, because it focuses on the chronological exchange of messages between objects.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
