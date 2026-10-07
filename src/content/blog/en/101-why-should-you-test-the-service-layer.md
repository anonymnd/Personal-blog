---
title: "Choose Tests by the Risk They Can Actually Detect"
description: "A strategic guide to mapping failure modes to the correct test level using a currency conversion scenario."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
seriesOrder: 21
locale: en
tags: ["backend-testing","learning-series"]
draft: false
---

## The Fallacy of the 'Green' Suite

A common realization for developers is that a project can have 100% test coverage and still fail in production. This happens when we test the *implementation* (how the code is written) rather than the *risk* (what can actually break). If you mock your database repository in a unit test, you are testing your ability to call a method, not whether your SQL query is valid or your ORM mapping is correct.

## Mapping Risks to Test Levels

To build a resilient portfolio, you must assign each potential failure to the specific test level capable of detecting it. Consider a currency conversion feature: it calculates a value based on a remote rate feed, applies rounding logic, and saves the transaction history to a database.

### 1. Unit Tests: Logic and Edge Cases
Unit tests should target the 'pure' logic. In our scenario, the rounding logic is the highest risk. Does it round half-up? Does it handle negative amounts?

**What it detects:** Algorithmic errors, off-by-one mistakes, and null pointer exceptions in business logic.
**What it misses:** Database constraint violations, network timeouts, or incorrect JSON parsing from the API.

### 2. Integration Tests: The Boundaries
Integration tests validate the contract between your code and an external system (Database, API, Message Broker).

**What it detects:** Incorrect SQL syntax, missing database columns, mismatched JSON field names from the rate feed, or transaction rollback failures.
**What it misses:** Complex business logic permutations (which would make the test suite too slow if tested here).

### 3. The Private Method Dilemma
Developers often struggle with whether to test private methods. If a private method contains complex logic (like our rounding), the correct approach is not to make it public or use reflection. Instead, test the public behavior that relies on that private method. If the private logic is so complex that it requires its own suite, it is a signal that the logic belongs in a separate, injectable 'Strategy' or 'Utility' class where it can be tested publicly as a unit.

## Worked Example: Risk Distribution Plan

Below is the mapping of failure modes for the Currency Conversion feature to the appropriate test level.

| Failure Mode | Risk Level | Correct Test Level | Why? |
| :--- | :--- | :--- | :--- |
| Rounding $1.005 to $1.01 fails | High | Unit Test | Pure logic; fast to execute many permutations. |
| Remote API returns 404 or malformed JSON | Medium | Integration Test | Validates the HTTP client and DTO mapping. |
| `amount` column in DB is too small for the value | High | Integration Test | Only a real DB (or Testcontainer) catches schema mismatches. |
| Service fails to call the Repository | Low | Unit Test (Mock) | Verifies the orchestration flow (interaction). |
| Transaction doesn't commit after conversion | Medium | Integration Test | Requires a real transaction manager to verify. |

## Implementation Trace: Logic vs. Persistence

Consider this illustrative snippet of a conversion service:

```java
public record ConversionResult(BigDecimal amount, LocalDateTime timestamp) {}

public class CurrencyService {
    private final RateClient rateClient;
    private final HistoryRepository repository;

    public CurrencyService(RateClient rateClient, HistoryRepository repository) {
        this.rateClient = rateClient;
        this.repository = repository;
    }

    public ConversionResult convert(BigDecimal amount, String from, String to) {
        BigDecimal rate = rateClient.getRate(from, to);
        BigDecimal result = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        var entity = new ConversionEntity(result, from, to);
        repository.save(entity);

        return new ConversionResult(result, LocalDateTime.now());
    }
}
```

**The Failure Case:** If the `ConversionEntity` has a `@Column(precision = 5, scale = 2)` but the result is `123456.78`, a unit test using a mocked `HistoryRepository` will **pass** because `repository.save()` is just a mocked interaction. Only an integration test hitting a real database will throw a `DataIntegrityViolationException`.

## Focused Exercise

**Scenario:** You are adding a feature that calculates a discount based on a user's loyalty points. It fetches points from a Redis cache and saves the discount application to a PostgreSQL DB.

**Question:** Where do you place the following tests and why?
1. Testing that a user with 0 points gets 0% discount.
2. Testing that the Redis connection timeout is handled.
3. Testing that the discount value is stored in the DB without precision loss.

**Answer:**
1. **Unit Test:** Pure logic mapping points to percentage.
2. **Integration Test:** Validates the actual network boundary and timeout configuration of the Redis client.
3. **Integration Test:** Validates the DB column type (e.g., `NUMERIC` vs `FLOAT`) and the ORM mapping.

For that numeric overflow example, use an actual PostgreSQL NUMERIC(5,2) column and force flush/commit in the integration test. The mapping annotation alone does not change an existing schema, and exception wrapping depends on the persistence boundary. Pure JSON parsing can also be unit tested; a boundary test adds evidence that the actual client configuration handles real responses.

## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
