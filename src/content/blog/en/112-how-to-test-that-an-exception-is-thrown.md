---
title: "How to Test That an Exception Is Thrown"
description: "Learn how to validate that your Java application correctly handles error scenarios using JUnit 5's assertThrows."
pubDate: 2026-10-11T07:48:00.000Z
translationKey: 112-how-to-test-that-an-exception-is-thrown
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where a requester submits a purchase request. You have a business rule: a request cannot be submitted if the amount is negative. You write the logic to throw an `IllegalArgumentException`, but how do you prove in a test that this exception actually happens? Many beginners mistakenly use try-catch blocks in tests, which leads to verbose and fragile code.

## The assertThrows Mechanism
JUnit 5 provides the `assertThrows` method specifically for this purpose. Instead of waiting for the test to crash, `assertThrows` intercepts the exception. It takes two arguments: the expected exception class and a lambda expression containing the code that should trigger the error. If the code throws the specified exception, the test passes; otherwise, it fails.

## Worked Example: Procurement Validation
Consider a `RequestService` that validates the amount of a purchase request before processing it.

```java
public class RequestService {
    public void submitRequest(double amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        // Logic for submission
    }
}
```

To test this, we use `assertThrows` to ensure the negative amount triggers the exception:

```java
@Test
void shouldThrowExceptionWhenAmountIsNegative() {
    RequestService service = new RequestService();
    
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
        service.submitRequest(-100.0);
    });
    
    assertEquals("Amount cannot be negative", exception.getMessage());
}
```
In this case, the test confirms that the logic blocks invalid data and provides the correct error message to the user.

## Common Mistake: The Generic Catch
A frequent error is wrapping the call in a try-catch and calling `fail()` at the end. This is outdated and makes the test harder to read.

**Incorrect:**
```java
try {
    service.submitRequest(-1);
    fail("Should have thrown exception");
} catch (IllegalArgumentException e) {
    // pass
}
```
**Correction:** Use `assertThrows`. It is more concise and explicitly tells the reader that the exception is the expected outcome, not a failure.

## Practical Exercise
Create a method `approveRequest(Request req)` that throws a `NullPointerException` if the request object is null. Write a JUnit 5 test to verify this behavior.

**Check:** Your test should use `assertThrows(NullPointerException.class, () -> service.approveRequest(null));`.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
