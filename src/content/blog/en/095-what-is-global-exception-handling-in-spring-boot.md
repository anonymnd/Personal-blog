---
title: "What Is Global Exception Handling in Spring Boot?"
description: "Learn how to centralize error management in Spring Boot using @ControllerAdvice to avoid repetitive try-catch blocks across your controllers."
pubDate: 2026-10-10T14:48:00.000Z
translationKey: 095-what-is-global-exception-handling-in-spring-boot
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. In every single controller method—whether it is for submitting a request or approving an order—you find yourself writing the same try-catch blocks to handle `ResourceNotFoundException` or `InvalidRequestException`. This duplication makes your code messy and hard to maintain. Global Exception Handling allows you to move this logic to one single place.

## The Mechanism of @ControllerAdvice
Spring Boot provides the `@ControllerAdvice` annotation, which acts as an interceptor for exceptions thrown by any method in any controller. When an exception occurs, Spring looks for a method annotated with `@ExceptionHandler` inside a class marked as `@ControllerAdvice`. If it finds a match for the exception type, it executes that method instead of letting the server return a generic 500 Internal Server Error page.

## Implementing a Global Handler
To implement this, you create a specialized class. You should define a custom error response object to ensure the client receives a consistent JSON structure rather than a raw stack trace, which could leak sensitive server details.

```java
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleNotFound(ResourceNotFoundException ex) {
        ErrorDetails error = new ErrorDetails("NOT_FOUND", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGeneral(Exception ex) {
        ErrorDetails error = new ErrorDetails("SERVER_ERROR", "An unexpected error occurred");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## Worked Example: Procurement Request
Suppose a manager tries to approve a request using an ID that doesn't exist. The service throws a `ResourceNotFoundException`. Instead of the controller catching it, the `GlobalExceptionHandler` intercepts it and returns a 404 status with the body: `{"code": "NOT_FOUND", "message": "Request ID 123 not found"}`. This keeps the controller method clean, focusing only on the successful path.

## Common Mistake: Exposing Stack Traces
A frequent error is returning the entire `Exception` object or the stack trace in the response body. This is a security risk because it reveals your package structure and library versions to potential attackers. Always map the exception to a simplified DTO (Data Transfer Object).

## Practical Exercise
Create a handler for a custom `InsufficientFundsException` that returns a 400 Bad Request status.

**Check:** Your method should be annotated with `@ExceptionHandler(InsufficientFundsException.class)` and return `HttpStatus.BAD_REQUEST`.

## What global actually covers
Controller advice participates in Spring MVC exception handling; it does not catch every failure in security filters, background jobs or other processes. Configure handlers at those boundaries too. Inheriting `ResponseEntityExceptionHandler` in the example preserves built-in MVC handling, such as malformed-input and validation responses. Add specific domain handlers before treating genuinely unexpected failures as 500 errors.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
