---
title: "What Is a Database Transaction?"
description: "A comprehensive guide to understanding the ACID properties and the mechanism of database transactions using a procurement scenario."
pubDate: 2026-10-12T20:48:00.000Z
translationKey: 149-what-is-a-database-transaction
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request, and a manager approves it. Now, the system must subtract the item cost from the department budget and create an order record. If the budget is updated but the order creation fails due to a network glitch, your data becomes inconsistent: money is gone, but no order exists. This is where a database transaction saves the day.

## The Concept of Atomicity
At its core, a transaction is a logical unit of work that contains one or more SQL statements. The most critical property is Atomicity (the 'A' in ACID). Atomicity ensures that either every operation within the transaction succeeds, or none of them do. If any part fails, the database performs a rollback, returning the data to its original state as if nothing happened.

## ACID Properties Explained
Beyond atomicity, transactions rely on three other pillars:
- **Consistency**: The database moves from one valid state to another, maintaining all constraints (like foreign keys).
- **Isolation**: Concurrent transactions cannot see each other's partial changes until they are committed.
- **Durability**: Once a transaction is committed, the changes are permanent, even if the server crashes immediately after.

## Worked Example: Procurement Order
Consider this simplified logic using Jakarta Persistence (@Transactional):

```java
@Transactional
public void processOrder(Long requestId, double amount) {
    Budget budget = budgetRepo.findByDept(requestId);
    budget.setBalance(budget.getBalance() - amount);
    budgetRepo.save(budget);
    
    Order order = new Order(requestId, "PENDING");
    orderRepo.save(order);
    // If an exception occurs here, the budget subtraction is rolled back
}
```
In this case, if `orderRepo.save()` throws a `RuntimeException`, the budget balance is automatically restored to its previous value in PostgreSQL.

## Common Mistake: The External Side Effect
A frequent error is assuming transactions can undo everything. For example, if you send a confirmation email inside a `@Transactional` method before the order is saved, and the database transaction later rolls back, the email cannot be "unsent." Always trigger external side effects (emails, API calls) only after the transaction has successfully committed.

## Practical Exercise
**Scenario**: You have a transaction that updates a user's profile and logs the change in an audit table. The audit table update fails due to a constraint violation.

**Question**: What happens to the user's profile update?

**Answer**: The profile update is rolled back; neither change is persisted in the database.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
