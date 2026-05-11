---
title: "I Finally Understand Mockito"
description: "A conceptual deep dive into isolating units of code by replacing real dependencies with controlled doubles."
pubDate: 2026-10-17T19:48:00.000Z
translationKey: 268-i-finally-understand-mockito
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

For a long time, I struggled with the difference between a real object and a mock. I used to think mocking was just about avoiding database connections, but the real 'aha!' moment came when I realized that Mockito is about controlling the environment to test a single logic path in isolation.

## The Core Mechanism
Mockito creates a 'proxy' of a class. Instead of executing the actual logic inside a method, the proxy intercepts the call. You then tell this proxy exactly what to return using `when(...).thenReturn(...)`. This removes the unpredictability of external services, like an API that might be down or a database that requires complex setup.

## A Hypothetical Procurement Example
Imagine a `ProcurementService` where a requester submits a request. The service must check if the requester has enough budget via a `BudgetService` before saving the request.

```java
// Illustrative excerpt
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock BudgetService budgetService;
    @InjectMocks ProcurementService procurementService;

    @Test
    void testRequestApproval() {
        Request req = new Request("Laptop", 1200);
        // We force the mock to return true regardless of actual budget logic
        when(budgetService.hasEnoughFunds(req)).thenReturn(true);

        boolean result = procurementService.submitRequest(req);
        assertTrue(result);
        verify(budgetService).hasEnoughFunds(req);
    }
}
```
In this case, we aren't testing if the `BudgetService` works; we are testing if `ProcurementService` correctly reacts when the budget is sufficient.

## Common Mistake: Mocking the Class Under Test
A frequent error is applying `@Mock` to the class you are actually testing. If you mock the `ProcurementService` itself, you are calling a proxy method that does nothing, and your test will always pass or return null without executing your actual business logic. Always use `@InjectMocks` for the target class and `@Mock` for its dependencies.

## Verification vs. Stubbing
Stubbing (`when`) defines the behavior. Verification (`verify`) checks if a method was actually called. Use verification when the method returns `void` or when the side effect (like sending an email) is the primary goal of the test.

## Practical Exercise
How would you test a scenario where the `BudgetService` throws a `BudgetExceededException`?

**Answer:** Use `when(budgetService.hasEnoughFunds(req)).thenThrow(new BudgetExceededException());` and then use `assertThrows` to verify the `ProcurementService` handles the error correctly.
