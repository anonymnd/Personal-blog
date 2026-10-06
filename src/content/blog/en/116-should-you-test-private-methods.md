---
title: "Should You Test Private Methods?"
description: "An exploration of why testing observable behavior is superior to targeting private implementation details in unit tests."
pubDate: 2026-10-11T11:48:00.000Z
translationKey: 116-should-you-test-private-methods
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have spent hours writing a complex algorithm inside a private method. You feel uneasy because that specific logic isn't covered by a test, so you consider using reflection or changing the modifier to 'protected' just to satisfy your test suite. This is a common trap that leads to brittle tests.

## The Philosophy of Public API
Unit tests should act as a specification for how a class behaves, not how it is implemented. A private method is an internal detail. If you test it directly, your tests become tightly coupled to the internal structure. When you decide to refactor the code—perhaps by splitting one private method into two—your tests will fail even if the final result remains correct. This defeats the purpose of refactoring.

## Testing via Observable Behavior
Instead of targeting the private method, you should test the public method that calls it. If the private method is so complex that it feels 'untestable' through the public API, it is usually a signal that the class is doing too much. In such cases, the logic should be extracted into a new collaborator class where that logic becomes a public responsibility.

## Worked Example: Procurement Approval
Consider a `RequestService` where a private method `validateBudget()` checks if a procurement request exceeds the department limit.

```java
public class RequestService {
    public boolean submitRequest(Request req) {
        if (!validateBudget(req)) return false;
        // process request
        return true;
    }

    private boolean validateBudget(Request req) {
        return req.getAmount() <= 1000;
    }
}
```

To test `validateBudget`, you simply call `submitRequest` with an amount of 1500 and assert that it returns `false`. You are testing the *outcome* (the request was rejected), not the *mechanism* (the private method was called).

## Common Mistake: Changing Visibility
Developers often change `private` to `package-private` and add `@VisibleForTesting`. This leaks implementation details to other classes in the same package. The correction is to keep the method private and improve the test coverage of the public entry point.

## Practical Exercise
If you have a private method `calculateTax()` used by `processInvoice()`, how should you test a tax calculation error?

**Answer:** Call `processInvoice()` with data that triggers the tax error and verify that the public method returns the expected error response or throws the appropriate exception.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
