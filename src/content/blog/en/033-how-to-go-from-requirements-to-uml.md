---
title: "How to Go From Requirements to UML"
description: "Learn how to transform raw business requirements into structured UML diagrams to bridge the gap between stakeholders and developers."
pubDate: 2026-10-08T00:48:00.000Z
translationKey: 033-how-to-go-from-requirements-to-uml
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imagine you are handed a document stating: 'Employees must submit a procurement request, which a manager then approves before a buyer places the order.' If you start coding immediately, you risk missing edge cases, like what happens when a manager rejects the request. This gap between a written sentence and a line of code is where UML (Unified Modeling Language) becomes essential.

## Identifying Actors and Goals
The first step is extracting the 'who' and the 'what'. In our procurement scenario, the actors are the Requester, the Manager, and the Buyer. Their goals are to submit, approve, and order. You map these directly into a Use Case Diagram. This diagram doesn't show the order of events; it simply defines the boundaries of the system and who interacts with which feature.

## Mapping the Business Flow
Once goals are clear, you need to model the logic. A business flow is not a UML diagram by itself; it is the source material. To visualize the decision-making process, use an Activity Diagram. For example, after the 'Submit Request' action, the flow hits a decision diamond: 'Is it approved?'. If yes, it moves to the Buyer; if no, it loops back to the Requester for corrections.

## Modeling Ordered Interactions
While activity diagrams show logic, Sequence Diagrams show time and responsibility. Here, you map the objects involved. 

Example interaction:
1. `Requester` -> `RequestService`: `createRequest(details)`
2. `RequestService` -> `Database`: `save(request)`
3. `Manager` -> `RequestService`: `approveRequest(id)`

This ensures you know exactly which class handles which piece of data at a specific moment.

## Defining the Structure
Finally, you move to a Class Diagram. A common mistake is treating a Class Diagram as a database schema. While a SQL table stores data, a UML class defines behavior. A `ProcurementRequest` class should have methods like `calculateTotal()` or `validateBudget()`, not just columns.

## Common Pitfall: The 'Everything' Diagram
A frequent error is trying to put every detail into one diagram. If your Sequence Diagram has 50 arrows, it is no longer a tool for communication but a source of confusion. The correction is to decompose the system into smaller, focused scenarios.

## Practical Exercise
**Scenario:** A user wants to change their password. They must provide the old password, and the system must verify it before allowing a new one.
**Task:** Which two UML diagrams would best represent the 'decision logic' and the 'object interaction' for this feature?

**Answer:** An Activity Diagram for the verification logic (Yes/No) and a Sequence Diagram for the interaction between the User, PasswordController, and UserAccount object.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
