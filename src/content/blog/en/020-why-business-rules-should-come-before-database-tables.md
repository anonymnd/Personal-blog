---
title: "Why Business Rules Should Come Before Database Tables"
description: "Learn why defining the logic of your business domain must precede the creation of your database schema to avoid costly architectural rework."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 020-why-business-rules-should-come-before-database-tables
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You start by creating a `Requests` table with a status column. Later, you realize that a request cannot be 'Approved' unless the requester has a specific budget limit and the manager is from the same department. If you already built your tables, you now have to add complex constraints or trigger logic to a schema that wasn't designed for these dependencies. This is the 'database-first' trap.

## The Logic-First Approach
Business rules define the 'what' and 'how' of a process, while database tables only define 'where' data is stored. When you start with tables, you are designing for storage, not for behavior. By defining rules first, you identify the actual domain entities—like the Requester, the Manager, and the Order—and the strict conditions they must meet before a state change occurs.

## Mapping Rules to Entities
In our procurement example, the business rules are: 
1. A Requester (actor) submits a request.
2. A Manager (user with authority) must approve it if the amount exceeds $500.
3. A Buyer (domain entity) converts the approved request into a Purchase Order.

If we define these first, we realize we need a many-to-one relationship between Requests and Managers, and a strict validation rule for the amount. The database becomes a reflection of these rules, not the source of them.

## Worked Example: The Approval Flow
Instead of just a `status` string, the business rule dictates: *"A request cannot move to 'Ordered' unless it has an 'Approved' timestamp and a valid Buyer ID."*

```java
// Illustrative excerpt of a business rule check
public class ProcurementService {
    public void transitionToOrdered(Request request, User buyer) {
        if (!request.isApproved()) {
            throw new IllegalStateException("Request must be approved first");
        } 
        if (buyer.getRole() != Role.BUYER) {
            throw new UnauthorizedException("Only buyers can order");
        }
        request.setStatus(Status.ORDERED);
    }
}
```
Outcome: The system prevents invalid states regardless of how the SQL table is structured.

## Common Mistake: The 'God Table'
Developers often create one massive table with 50 columns to cover every possible scenario. This happens because they didn't define the business rules first. The correction is to split the table based on the actor's responsibility (e.g., separate `RequestDetails` from `ApprovalAudit`).

## Practical Exercise
Scenario: A rule states that a user cannot request a new laptop if they received one in the last 24 months.
Question: Should you handle this with a database `UNIQUE` constraint or a business rule check?

Answer: A business rule check. A `UNIQUE` constraint cannot calculate a date range (24 months); it only checks for exact duplicates.
