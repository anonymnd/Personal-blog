---
title: "How to Write Use Cases Without Making Them Complicated"
description: "Learn how to document system interactions clearly by focusing on actors and goals rather than technical implementation."
pubDate: 2026-10-07T08:48:00.000Z
translationKey: 017-how-to-write-use-cases-without-making-them-complicated
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Many developers start writing use cases by describing every single button click or database update. This leads to 'specification bloat,' where the document becomes so complex that it is impossible to maintain. The secret to simplicity is focusing on the *goal* of the actor, not the *mechanism* of the software.

## Distinguishing Actor, User, and Entity
Before writing, you must define who is interacting with the system. An **Actor** is a role (e.g., 'Procurement Manager'), not a specific person. A **User** is the account holder who logs in. A **Domain Entity** is the object being manipulated (e.g., 'Purchase Request'). Mixing these up creates confusion; for example, a 'Request' cannot be an actor because it cannot initiate an action.

## The Happy Path and the Unhappy Path
A good use case describes the 'Happy Path'—the ideal sequence where everything goes right. However, real software fails. You must document 'Unhappy Paths' (Alternative Flows), such as what happens when a manager rejects a request or when a buyer finds an item out of stock. This ensures the developer handles errors before they happen in production.

## Worked Example: Procurement Request
Consider a simple procurement flow:
- **Actor**: Requester
- **Goal**: Submit a request for a new laptop.
- **Main Flow**:
  1. Requester fills out the request form.
  2. System validates the budget availability.
  3. System notifies the Manager for approval.
- **Alternative Flow (Budget Exceeded)**:
  2a. System alerts the Requester that the amount exceeds the limit.
  2b. Requester modifies the request or cancels it.

## Common Mistake: Adding Technical Details
A frequent error is writing: "The user clicks the Submit button, which triggers a POST request to /api/requests." This is too detailed. If the UI changes to a voice command, your use case is now wrong. Instead, write: "The Requester submits the request." Keep the *what* separate from the *how*.

## Practical Exercise
**Scenario**: A Manager needs to approve a procurement request. Write one Happy Path step and one Unhappy Path step.

**Check**: 
- Happy Path: Manager reviews the request and marks it as 'Approved'.
- Unhappy Path: Manager rejects the request due to insufficient justification.
