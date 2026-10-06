---
title: "How to Know What Feature You Should Build First"
description: "A guide to prioritizing your first feature by focusing on user outcomes and vertical slices rather than exhaustive architecture."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 009-how-to-know-what-feature-you-should-build-first
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a long list of ideas: a complex reporting dashboard, a notification system, and a multi-level approval workflow. If you try to design the entire database schema and architecture for all these features before writing a single line of code, you risk building a system that doesn't actually solve the user's primary pain point.

## Focus on the User Outcome
Instead of asking 'What functionality do we need?', ask 'What is the smallest outcome that provides value?'. In a procurement app, the core outcome is not 'having a database of requests', but 'getting a request from a requester to a buyer'. Everything else is secondary. Define the business rules clearly: a requester submits a request, a manager approves it, and a buyer orders it. This is your North Star.

## The Power of the Vertical Slice
Avoid the 'horizontal' approach where you build the entire UI layer, then the entire API layer, then the database. Instead, build a vertical slice. This means implementing one tiny path from the UI to the database for a single feature. For example, build only the 'Submit Request' button, the corresponding API endpoint, and the table save logic. You now have a working piece of software, even if it's incomplete.

## Defining Acceptance Criteria
To know when a feature is 'done', you need acceptance criteria. For our procurement slice, the criteria might be: 'Given a logged-in requester, when they submit a valid form, the request status changes to PENDING and is visible to the manager.' This prevents scope creep and keeps you focused on the immediate goal.

## Iterative Architecture
Many developers fall into the trap of 'Big Design Up Front'. They spend weeks on a perfect class hierarchy. In reality, architecture should be iterative. Build the slice, see where it breaks, and refactor. Your initial `Request` entity might be simple, but it will evolve as you add the approval logic.

## Worked Example: The First Slice

**Goal:** Allow a user to submit a purchase request.

```java
// Illustrative excerpt of a simple Request entity
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemDescription;
    private Double estimatedCost;
    private String status = "PENDING";
    // Getters and setters
}
```
**Outcome:** The requester clicks 'Submit', the record hits the DB, and the manager can see it. The 'Reporting' and 'Notifications' features are ignored for now.

**Common Mistake:** Building a generic 'Notification Engine' before the 'Submit' button works. 
**Correction:** Hardcode a simple log message or email first; build the engine only when you have multiple features requiring it.

## Practical Exercise
Scenario: You are adding 'Manager Approval' to the app. What is the smallest vertical slice and one acceptance criterion for this feature?

**Answer:** Slice: A 'Approve' button on the manager's view that updates the status to 'APPROVED'. Criterion: The request status must change from PENDING to APPROVED in the database upon clicking.
