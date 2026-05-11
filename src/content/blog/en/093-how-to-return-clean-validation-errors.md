---
title: "How to Return Clean Validation Errors"
description: "Learn how to transform messy Spring Boot validation exceptions into structured, user-friendly API responses."
pubDate: 2026-10-10T12:48:00.000Z
translationKey: 093-how-to-return-clean-validation-errors
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine your frontend developer is frustrated because your API returns a 500 Internal Server Error with a massive stack trace every time a user forgets to enter their email. The client doesn't know what went wrong, and you've accidentally leaked your internal package structure. The goal is to move from 'something broke' to 'the email field is required'.

## The Validation Mechanism
In Jakarta Bean Validation, annotations like `@NotBlank` and `@NotNull` check the input shape. When a request hits a controller method marked with `@Valid`, Spring throws a `MethodArgumentNotValidException` if constraints are violated. By default, this exception contains a complex tree of error objects that are too verbose for a JSON response.

## Structuring the Error Response
To clean this up, you need a Global Exception Handler using `@RestControllerAdvice`. Instead of returning the raw exception, map the errors to a simple Data Transfer Object (DTO) containing the field name and the specific error message.

## Worked Example: Procurement Request
Consider a procurement app where a requester submits a purchase request. The `RequestDTO` ensures the item name isn't empty.

```java
public class RequestDTO {
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    @NotNull(message = "Quantity cannot be null")
    private Integer quantity;
    // getters/setters
}
```

In the handler, you extract the errors like this:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```
**Outcome:** If `itemName` is missing, the API returns `400 Bad Request` with `{"itemName": "Item name is required"}`.

## Common Mistake: Confusing @NotNull and @NotBlank
A frequent error is using `@NotNull` for strings. `@NotNull` only checks if the reference is null; it allows empty strings (`""`) or strings with only spaces. For text fields, always use `@NotBlank` to ensure the input actually contains characters.

## Practical Exercise
Create a `ManagerApprovalDTO` with a boolean `isApproved` and a String `comments`. Ensure `comments` is not blank. How should the handler respond if `comments` is empty?

**Answer:** The handler should return a 400 status with a JSON body: `{"comments": "[Your custom message]"}`.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
