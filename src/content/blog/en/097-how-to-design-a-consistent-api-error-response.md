---
title: "How to Design a Consistent API Error Response"
description: "Learn how to create a standardized error structure that helps frontend developers debug issues without exposing sensitive server internals."
pubDate: 2026-10-10T16:48:00.000Z
translationKey: 097-how-to-design-a-consistent-api-error-response
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine a frontend developer calling your API. For a validation error, they get a simple string; for a database error, they get a massive HTML stack trace; and for a business logic failure, they get a null body. This inconsistency forces the client to write fragile 'if-else' blocks for every single endpoint just to show a basic error message.

## The Anatomy of a Standard Response
To fix this, you need a dedicated Error Response DTO. A consistent response should always contain a machine-readable code, a human-readable message, and an optional list of field-specific errors. This ensures that whether the error is a 400 Bad Request or a 422 Unprocessable Entity, the JSON shape remains identical.

## Implementing the Error Model
In a Jakarta EE environment, you can define a record to hold these details. This structure separates the general error from specific validation failures, such as when a user submits an empty string to a field marked `@NotBlank`.

```java
public record ApiError(String code, String message, List<FieldError> details) {}
public record FieldError(String field, String reason) {}
```

## Worked Example: Procurement Request
Consider a procurement app where a requester submits a purchase request. If the requester tries to submit a request with a negative amount, the API shouldn't just crash. Instead, it should return a 400 status with this body:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "The request contains invalid data",
  "details": [
    { "field": "amount", "reason": "Amount must be greater than zero" }
  ]
}
```
If the request is valid but the manager has already rejected the item (a business eligibility error), the API returns a 422 status with the code `ITEM_ALREADY_REJECTED`.

## Common Mistake: Leaking Internals
A frequent error is passing the `exception.getMessage()` directly to the client. If a database unique constraint is violated during a race condition, the client might see `SQLIntegrityConstraintViolationException: Duplicate entry 'REQ-101'`, which reveals your table structure. Instead, catch the exception and map it to a generic `CONFLICT` code.

## Practical Exercise
Create a JSON response for a scenario where a buyer tries to order an item that is out of stock. Use a 409 Conflict status.

**Check:** The response should have a `code` like `OUT_OF_STOCK`, a clear `message`, and an empty or null `details` list since it is a domain error, not a field validation error.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
