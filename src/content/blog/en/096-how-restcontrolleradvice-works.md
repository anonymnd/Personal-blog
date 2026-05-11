---
title: "How @RestControllerAdvice Works"
description: "Learn how to centralize error handling in Spring Boot to keep your controllers clean and your API responses consistent."
pubDate: 2026-10-10T15:48:00.000Z
translationKey: 096-how-restcontrolleradvice-works
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. In your `PurchaseRequestController`, you have five different methods. If a user submits an invalid request or a manager tries to approve a non-existent order, you might find yourself writing the same try-catch blocks in every single method. This duplication makes your code messy and hard to maintain.

## The Centralized Interceptor
`@RestControllerAdvice` acts as a global interceptor for exceptions thrown by any controller in your application. Instead of handling errors locally, Spring redirects the exception to a class annotated with `@RestControllerAdvice`. Inside this class, you define methods annotated with `@ExceptionHandler`, which specify exactly which exception type they should handle.

## The Mechanism of Action
When a request hits a controller and an exception is thrown, Spring looks for a matching `@ExceptionHandler` within the advice class. If found, it executes that method and returns the result as the HTTP response body. This separates your business logic (what the app does) from your error logic (how the app fails).

## Worked Example: Procurement Validation
Suppose a requester submits a `PurchaseRequest` with a blank description. Using `@NotBlank` on the DTO triggers a `MethodArgumentNotValidException`.

```java
@RestControllerAdvice
public class GlobalErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<String> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
```
If a user sends an empty description, the outcome is a `400 Bad Request` with a JSON body like `{"description": "cannot be blank"}` instead of a massive stack trace.

## Common Mistake: Exposing Internals
A frequent error is returning the raw exception object or the full stack trace to the client. This is a security risk as it reveals package names and database versions. 

**Correction:** Always map exceptions to a custom `ErrorResponse` DTO that contains only a user-friendly message and a timestamp.

## Practical Exercise
Create a method in a `@RestControllerAdvice` class to handle a custom `InsufficientBudgetException` and return a `422 Unprocessable Entity` status.

**Check:** Your method should be annotated with `@ExceptionHandler(InsufficientBudgetException.class)` and return `ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Budget exceeded");`.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
