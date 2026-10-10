---
title: "Database Transactions and Spring Transaction Boundaries"
description: "Deep dive into ACID, Spring's @Transactional proxy mechanism, propagation, and the limits of rollback."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 149-what-is-a-database-transaction
seriesOrder: 34
locale: en
tags: ["persistence","learning-series"]
draft: false
---

## The ACID Promise and the Database

A database transaction is a logical unit of work that ensures data integrity through ACID properties. In a PostgreSQL environment using Hibernate, the transaction ensures that if you are transferring reward credits from Account A to Account B, you don't end up in a state where credits are deducted from A but never added to B.

*   **Atomicity**: All operations succeed or none do.
*   **Consistency**: The database moves from one valid state to another, respecting all constraints.
*   **Isolation**: Concurrent transactions do not see each other's partial changes.
*   **Durability**: Once committed, the data survives system failures.

## Spring's @Transactional Mechanism

Spring implements transaction management using AOP (Aspect-Oriented Programming) proxies. When a method is marked `@Transactional`, Spring creates a proxy wrapper around the bean. The proxy intercepts the call, starts a transaction via the `PlatformTransactionManager`, executes the method, and then decides whether to commit or rollback based on the outcome.

### The Self-Invocation Trap

Because Spring uses proxies, the interception only happens when a call comes from *outside* the bean. If `methodA()` calls `methodB()` within the same class, the call bypasses the proxy and goes directly to the local method. Consequently, any `@Transactional` settings on `methodB()` are ignored.

### Propagation and Joining

Propagation defines how transactions behave when one transactional method calls another. The default `REQUIRED` means: if a transaction already exists, join it; otherwise, create a new one. This ensures that multiple service calls can participate in a single atomic unit.

## Worked Example: Reward Credit Transfer

Consider a scenario where we transfer credits and send an email receipt.

```java
@Service
public class RewardService {

    private final AccountRepository accountRepository;
    private final EmailService emailService;

    public RewardService(AccountRepository accountRepository, EmailService emailService) {
        this.accountRepository = accountRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void transferCredits(Long fromId, Long toId, Integer amount) {
        Account from = accountRepository.findById(fromId)
            .orElseThrow(() -> new IllegalArgumentException("Source not found"));
        Account to = accountRepository.findById(toId)
            .orElseThrow(() -> new IllegalArgumentException("Target not found"));

        from.setCredits(from.getCredits() - amount);
        to.setCredits(to.getCredits() + amount);

        // This call is internal (self-invocation)
        this.sendNotification(fromId, toId, amount);

        if (amount > 1000) {
            throw new RuntimeException("Limit exceeded");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Long from, Long to, Integer amount) {
        emailService.send("Credits transferred: " + amount);
    }
}
```

### Analysis of the Execution Trace

1.  **The Proxy Call**: An external controller calls `transferCredits()`. The proxy starts a transaction.
2.  **The Self-Invocation**: `transferCredits()` calls `sendNotification()`. Because this is a local call, the `REQUIRES_NEW` instruction is **ignored**. The notification logic runs inside the existing transaction.
3.  **The Side Effect**: `emailService.send()` is called. This is an external API call (SMTP/HTTP).
4.  **The Failure**: A `RuntimeException` is thrown because the amount exceeds 1000.
5.  **The Rollback**: Spring catches the unchecked exception and tells PostgreSQL to rollback. The credit balances in the DB are restored to their original values.
6.  **The Leak**: The email has already been sent. Database transactions **cannot** undo external side effects. The user receives a receipt for a transfer that technically never happened.

## Rollback Defaults

By default, Spring rolls back on `RuntimeException` and `Error` (unchecked exceptions). It does **not** roll back on checked exceptions (e.g., `IOException`, `SQLException`) unless explicitly configured via `@Transactional(rollbackFor = Exception.class)`.

## Exercise

**Scenario**: You have a method `processOrder()` marked `@Transactional`. Inside it, you call `updateInventory()`, which is also marked `@Transactional(propagation = Propagation.REQUIRED)`. `updateInventory()` throws a checked `InsufficientStockException`.

1. Does the transaction roll back by default?
2. If `processOrder()` calls `updateInventory()` via `this.updateInventory()`, does the propagation setting matter?

**Answer**:
1. No. Checked exceptions do not trigger rollback by default in Spring.
2. No. Self-invocation bypasses the proxy, so the propagation setting is ignored; it simply executes as a standard Java method call within the existing transaction started by `processOrder()`.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
