---
title: "How to Understand a Business Workflow Before Designing the Backend"
description: "Learn how to map business processes and identify actors and entities to avoid costly architectural rework."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 011-how-to-understand-a-business-workflow-before-designing-the-backend
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imagine you start coding a procurement system the moment you hear 'employees need to request laptops.' You build a simple table and an API, only to discover a week later that requests need manager approval, budget verification, and a buyer's confirmation. Your database schema is now obsolete because you missed the state transitions of the business logic.

## Identifying Actors vs. Users
A common mistake is treating every person as a 'User' object. In a workflow, you must distinguish between the **Actor** (the role interacting with the system) and the **User** (the account identity). For example, in a procurement app, the 'Requester' and 'Approver' are Actors. One person might hold both roles, but the business logic cares about the role, not the person.

## Mapping Domain Entities
Entities are the 'things' the business tracks. While a User is an identity, a `PurchaseRequest` is a domain entity. It has a lifecycle: *Draft* → *Pending Approval* → *Ordered* → *Received*. Understanding these states prevents you from creating a rigid system that cannot handle a request being 'Rejected' or 'Sent back for edit'.

## Capturing the Unhappy Path
Most developers only design the 'Happy Path' (where everything works). A robust backend design must account for: 
1. **Authorization failures**: What happens if a requester tries to approve their own laptop?
2. **Business constraints**: What if the budget is exceeded?
3. **Timeouts**: What if a manager doesn't approve the request for 10 days?

## Worked Example: Procurement Flow
Consider this simplified logic for a request:
- **Actor: Requester** → creates `PurchaseRequest` (State: PENDING).
- **Actor: Manager** → checks budget; if OK, updates state to APPROVED.
- **Actor: Buyer** → places order with vendor; updates state to ORDERED.

If you only modeled a `Request` table with a `status` string, you might miss the need for an `ApprovalLog` entity to track who approved what and when for auditing purposes.

## Common Mistake: Jumping to Tables
**Mistake**: Creating a `Users` table and a `Requests` table immediately.
**Correction**: First, draw a flow chart of the process. Define the transitions. Only then decide if you need a `Role` table or a `State` enum.

## Practical Exercise
**Scenario**: A library system where a member borrows a book, but it must be approved by a librarian if the book is 'Rare'.
**Question**: Identify the Actors and the Domain Entity.
**Answer**: Actors: Member, Librarian. Domain Entity: LoanRequest (with states like Pending, Approved, Borrowed).
