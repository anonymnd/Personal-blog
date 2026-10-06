---
title: "Which UML Diagram Should You Use?"
description: "A practical guide to selecting the right UML diagram based on whether you need to model goals, logic, interactions, or structure."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 024-which-uml-diagram-should-you-use
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imagine you are tasked with designing a procurement system where a requester submits a purchase request, a manager approves it, and a buyer places the order. You start drawing boxes and arrows, but you quickly realize that a single diagram cannot explain both the business rules and the technical object structure. This confusion is where many beginners struggle: they try to force one diagram to do everything.

## Modeling Goals with Use Case Diagrams
When you need to define *who* uses the system and *what* they want to achieve, use a Use Case Diagram. It focuses on the 'what' rather than the 'how'. In our procurement app, the actors are the Requester, Manager, and Buyer. The use cases would be 'Submit Request', 'Review Request', and 'Place Order'. This diagram is your contract with the stakeholders to ensure no functional requirement is missed.

## Mapping Logic with Activity Diagrams
If you need to visualize the workflow or a business process involving decisions, the Activity Diagram is the correct choice. It behaves like a sophisticated flowchart. For example, after a manager reviews a request, there is a decision diamond: if 'Approved', the flow moves to the Buyer; if 'Rejected', it loops back to the Requester for corrections. This captures the sequential and conditional logic of the business flow.

## Detailing Interactions with Sequence Diagrams
When the focus shifts to how specific objects or services communicate over time, use a Sequence Diagram. It shows the chronological order of messages. 

Example interaction:
1. `Requester` -> `RequestService`: `createRequest(data)`
2. `RequestService` -> `Database`: `save(request)`
3. `RequestService` -> `NotificationService`: `notifyManager(requestId)`

This helps developers identify exactly which methods need to be implemented in which class.

## Defining Structure with Class Diagrams
To model the static blueprint of the system, use a Class Diagram. A common mistake is treating UML classes as SQL tables. While they look similar, a UML class includes behaviors (methods), not just data columns. In our app, a `PurchaseRequest` class would have attributes like `totalAmount` and methods like `calculateTax()`.

## Common mistake: asking one diagram to answer every question
Choose a diagram according to the question you need to answer. Actors can appear as lifelines in sequence diagrams, and sequence diagrams can show alternatives, loops and parallel interactions. They are useful for message order; activity diagrams are usually clearer for an overall workflow. A class diagram describes structure rather than the step-by-step execution of a method. These views complement each other; UML does not require rigidly excluding actors from every diagram except use cases.
## Practical Exercise
Scenario: You need to show the exact order of API calls between a Mobile App, an Auth Server, and a Database. Which diagram do you use?
**Answer:** A Sequence Diagram, because it focuses on the chronological exchange of messages between components.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
