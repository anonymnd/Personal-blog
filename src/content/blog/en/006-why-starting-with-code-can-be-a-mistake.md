---
title: "Why Starting With Code Can Be a Mistake"
description: "Learn why jumping straight into implementation often leads to wasted effort and how to focus on business outcomes first."
pubDate: 2026-10-06T21:48:00.000Z
translationKey: 006-why-starting-with-code-can-be-a-mistake
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You immediately start writing a `PurchaseRequest` class and setting up a database schema. Two weeks later, you realize the manager doesn't just 'approve' a request; they might need to 'send it back for revision' or 'delegate it' to another manager. Because you started with code, you now have to rewrite your entire data model and logic flow.

## The Trap of Immediate Implementation
Many beginners treat coding as the primary act of software engineering. However, code is merely the final translation of a solution. When you start with code, you are guessing the requirements while simultaneously trying to solve the technical implementation. This cognitive overload leads to 'tunnel vision,' where you optimize a function that shouldn't even exist because the business rule was misunderstood.

## Focus on the User Outcome
Before opening your IDE, define the specific outcome. In our procurement app, the outcome isn't 'a database table for requests,' but 'a requester successfully getting the items they need.' Once the outcome is clear, identify the business rules: who can request, who can approve, and what happens when a budget is exceeded. This ensures the code serves the business, not the other way around.

## The Vertical Slice Approach
Instead of building the entire architecture, focus on a small vertical slice. Define a simple path: Requester submits → Manager approves → Buyer orders. Create acceptance criteria for this slice (e.g., 'The manager must receive a notification when a request is submitted').

## Worked Example: The Wrong vs. Right Way

**Wrong Way:**
```java
// Starting with a generic entity without clear rules
public class Request {
    private Long id;
    private String status; // "PENDING", "APPROVED"
    // ... getters and setters
}
```
*Outcome:* You miss the 'Revision' state, requiring a database migration later.

**Right Way:**
1. **Outcome:** Request approval flow.
2. **Rule:** Requests can be Approved, Rejected, or Sent Back for Revision.
3. **Code:** Implement only the logic needed for these three states.

## Common Mistake: Over-Engineering Architecture
A frequent error is trying to design a 'perfect' scalable architecture before knowing the business rules. Architecture should be iterative. Start simple; refine the design as the requirements evolve.

## Practical Exercise
You are asked to build a 'Budget Alert' feature for the procurement app. Instead of writing the `AlertService` class immediately, list two business rules and one acceptance criterion.

**Check:**
*Rule 1: Alert triggers when request > 1000$. Rule 2: Only the Finance Head gets the alert. Criterion: Verify that a $500 request does not trigger a notification.
