---
title: "Why Every Error Should Not Become HTTP 500"
description: "Learn how to distinguish between client-side mistakes and server-side failures to improve API reliability and security."
pubDate: 2026-10-10T19:48:00.000Z
translationKey: 100-why-every-error-should-not-become-http-500
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request, but they leave the 'item quantity' field empty. If your server crashes and returns a generic 'Internal Server Error 500', the user has no idea what went wrong, and your logs are flooded with noise that looks like a critical system failure. This is the danger of treating every exception as a 500 error.

## The Meaning of HTTP 500
An HTTP 500 error is a 'catch-all' for unexpected server failures—things like a database connection dropping or a NullPointerException in your business logic. When you return a 500 for a simple validation error, you hide the root cause from the client and make it impossible for monitoring tools to distinguish between a bug in your code and a mistake by the user.

## Validation vs. Business Eligibility
Not all errors are created equal. Input shape validation (e.g., using `@NotBlank` to ensure a field isn't empty) should result in a 400 Bad Request. However, business eligibility—such as a manager trying to approve a request that is already closed—is a domain error and should typically return a 422 Unprocessable Entity or 409 Conflict.

## Worked Example: Procurement Request
Consider a request submission. If the user sends a negative price, the `@Positive` validation triggers. If the user is not authorized to request that amount, the business logic triggers.

```java
// Illustrative excerpt of a Global Exception Handler
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorDto> handleValidation(MethodArgumentNotValidException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto("Invalid input"));
}

@ExceptionHandler(InsufficientBudgetException.class)
public ResponseEntity<ErrorDto> handleBudget(InsufficientBudgetException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new ErrorDto(ex.getMessage()));
}
```
Outcome: The user gets a clear 400 for typos and a 422 for budget issues, while the server only logs 500s for actual crashes.

## Common Mistake: Exposing Stack Traces
Developers often let the default server error page return the full Java stack trace to the client. This is a security risk as it reveals package names and library versions. Always map your exceptions to a clean DTO that contains only a message and a correlation ID.

## Practical Exercise
Which status code should you return if a buyer tries to order an item that was just deleted by another admin (a concurrency race)?

**Answer:** HTTP 409 Conflict, because the request is valid but conflicts with the current state of the server.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
