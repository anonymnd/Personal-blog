---
title: "Dependency Injection, Inversion of Control and Interface Contracts"
description: "A deep dive into component construction, constructor injection, and the reality of semantic coupling via interfaces."
pubDate: 2026-10-07T04:48:00.000Z
translationKey: 055-what-is-dependency-injection
seriesOrder: 13
locale: en
tags: ["spring-architecture","learning-series"]
draft: false
---

## The Shift in Control

In traditional programming, a class is responsible for creating its own dependencies. If a `TaxCalculator` needs a `RateSource` to fetch current tax percentages, it might instantiate a `RemoteRateSource` directly inside its constructor. This creates a hard-coded dependency: the calculator cannot function without that specific implementation, making it impossible to test in isolation without a live network connection.

Inversion of Control (IoC) flips this relationship. Instead of the `TaxCalculator` controlling the creation of the `RateSource`, the control is handed to an external entity (the IoC container or a manual bootstrap class). The calculator simply declares what it needs, and the environment provides it. Dependency Injection (DI) is the specific mechanism used to achieve IoC, most commonly through constructor injection.

## Constructor Injection and the Contract

Constructor injection ensures that a component is never in an invalid state. By requiring dependencies at instantiation, the compiler guarantees that the `TaxCalculator` has a `RateSource` before any method is called. 

To make this flexible, we use an interface. The interface defines the *contract*—the set of methods the calculator expects—without specifying *how* those methods are implemented. This allows us to substitute a production implementation with a test implementation without changing a single line of code in the calculator.

## Worked Example: Tax Calculation System

Consider a system where tax rates are fetched from an external API in production but should be fixed during unit testing to ensure deterministic results.

### The Contract
```java
public interface RateSource {
    double getRate(String regionCode);
}
```

### The Implementations
```java
// Production implementation: Hits a remote API
public class RemoteRateSource implements RateSource {
    @Override
    public double getRate(String regionCode) {
        // Illustrative: In reality, this would use a RestClient
        System.out.println("Fetching from remote API...");
        return 0.20; 
    }
}

// Test implementation: Returns a hard-coded value
public class FixedRateSource implements RateSource {
    @Override
    public double getRate(String regionCode) {
        return 0.15;
    }
}
```

### The Component
```java
public class TaxCalculator {
    private final RateSource rateSource;

    // Constructor Injection
    public TaxCalculator(RateSource rateSource) {
        this.rateSource = rateSource;
    }

    public double calculateTax(double amount, String region) {
        return amount * rateSource.getRate(region);
    }
}
```

### Execution Trace

**Scenario A: Production Bootstrap**
1. `RemoteRateSource remote = new RemoteRateSource();`
2. `TaxCalculator prodCalc = new TaxCalculator(remote);`
3. `prodCalc.calculateTax(100, "US")` → calls `RemoteRateSource.getRate` → returns `20.0`.

**Scenario B: Test Bootstrap**
1. `FixedRateSource fixed = new FixedRateSource();`
2. `TaxCalculator testCalc = new TaxCalculator(fixed);`
3. `testCalc.calculateTax(100, "US")` → calls `FixedRateSource.getRate` → returns `15.0`.

## The Myth of Total Decoupling

There is a common misconception that interfaces remove all coupling. While they remove *implementation coupling* (the calculator doesn't know about `RemoteRateSource`), they do not remove *semantic coupling*. 

Semantic coupling occurs when the caller expects the implementation to behave in a specific way that isn't captured by the method signature. For example, if `TaxCalculator` assumes that `getRate` will never return a negative number or will always respond within 100ms, it is still coupled to the *behavior* of the implementation. If a new `DatabaseRateSource` is introduced that throws a `SQLException` (wrapped in a RuntimeException), the calculator may crash despite the interface contract being technically satisfied. Interfaces define the *what*, but the *how* (performance, error handling, side effects) still impacts the caller.

## Exercise

**Task:** You have a `NotificationService` that depends on a `MessageSender` interface. You have two implementations: `SmsSender` and `EmailSender`. You want to create a `BulkNotifier` that can switch between these senders based on a configuration setting at startup.

1. How should the `BulkNotifier` receive the `MessageSender`?
2. If `SmsSender` requires a paid API key and `EmailSender` requires an SMTP server, where should these credentials be handled?
3. If `SmsSender` fails silently but `EmailSender` throws an exception on failure, is the `BulkNotifier` truly decoupled from the implementation?

**Answer:**
1. Via constructor injection: `public BulkNotifier(MessageSender sender) { ... }`.
2. Credentials should be handled inside the specific implementation classes (or passed to their constructors during bootstrap), not inside the `BulkNotifier`.
3. No. This is semantic coupling. The `BulkNotifier`'s error-handling logic will behave differently depending on which implementation is injected, proving that the interface contract alone doesn't eliminate behavioral dependencies.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Java records](https://dev.java/learn/records/)
