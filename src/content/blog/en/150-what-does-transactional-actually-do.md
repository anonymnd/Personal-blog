---
title: "What Does @Transactional Actually Do?"
description: "An exploration of how Spring's @Transactional manages database consistency and the common pitfalls of proxy-based interception."
pubDate: 2026-10-12T21:48:00.000Z
translationKey: 150-what-does-transactional-actually-do
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request, and the system must simultaneously update the request status to 'SUBMITTED' and deduct the estimated cost from the department's budget. If the budget update fails due to insufficient funds, but the status remains 'SUBMITTED', your data is corrupted. This is where `@Transactional` becomes essential.

## Proxy interception and propagation
With Spring’s usual proxy-based configuration, an enabled transactional bean is called through a JDK or CGLIB proxy. By default, REQUIRED propagation joins an existing transaction or creates one when none exists. The transaction manager coordinates completion at the owning boundary; participating methods do not each independently commit the shared transaction. An internal call bypasses that method’s proxy advice, but an already active outer transaction may still remain in effect.
## Atomic Operations in Action
Consider this simplified procurement service excerpt:

```java
@Service
public class ProcurementService {
    @Transactional
    public void processRequest(Long requestId) {
        Request req = requestRepo.findById(requestId).orElseThrow();
        req.setStatus(Status.SUBMITTED);
        
        Budget budget = budgetRepo.findByDept(req.getDept());
        budget.setAmount(budget.getAmount() - req.getCost());
        // Hibernate dirty checking saves both entities at the end
    }
}
```
In this case, if `budgetRepo.findByDept` throws an exception, the status change to `SUBMITTED` is never committed to PostgreSQL. Both operations succeed or fail as a single unit of work.

## The Self-Invocation Trap
A common mistake is calling a `@Transactional` method from another method within the same class. Because the call happens inside the target object and not through the proxy, the interception is bypassed. The transaction never starts.

**Wrong:**
```java
public void submit(Long id) { 
    this.processRequest(id); // Proxy bypassed!
}
@Transactional
public void processRequest(Long id) { ... }
```
**Correction:** Move the transactional logic to a separate service or call the method from an external bean.

## Rollback Behavior and Limitations
By default, Spring rolls back for `RuntimeException` and `Error`, but not for checked exceptions. You can change this using `@Transactional(rollbackFor = Exception.class)`. Crucially, remember that transactions only affect the database. If your method sends an email before an exception triggers a rollback, that email cannot be 'undone' by the database.

## Practical Exercise
**Scenario:** You have a method that updates a user's profile and logs the change in a history table. You want the log to be saved even if the profile update fails.
**Question:** Should both operations be in the same `@Transactional` method?
**Answer:** No. You should use a separate transaction (e.g., `@Transactional(propagation = Propagation.REQUIRES_NEW)`) for the logging method to ensure it commits independently.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
