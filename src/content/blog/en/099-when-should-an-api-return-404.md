---
title: "When Should an API Return 404?"
description: "A guide on distinguishing between missing resources and invalid requests to ensure a predictable API contract."
pubDate: 2026-10-10T18:48:00.000Z
translationKey: 099-when-should-an-api-return-404
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Imagine you are building a procurement app. A manager tries to approve a purchase request using the ID `REQ-123`. If the server returns a 404, does it mean the request ID is formatted incorrectly, or does it mean the request simply doesn't exist in the database? Confusing these two scenarios leads to poor client-side error handling and frustrating debugging.

## The Core Definition of 404
A `404 Not Found` status code should be used exclusively when the server cannot find the requested resource. In REST terms, the URI identifies a specific entity. If that entity is absent from the persistence layer, 404 is the correct response. It signals that the endpoint is valid, but the specific instance requested is not.

## 404 vs 400 Bad Request
A common mistake is returning 404 when the input is malformed. If a user sends a request ID that is too short or contains illegal characters, this is a validation error, not a missing resource error. You should return `400 Bad Request`. Validation (like using `@NotBlank` or `@NotNull` in Jakarta EE) happens before the database is even queried. If the input shape is wrong, stop there with a 400.

## Worked Example: Procurement Approval
Consider an endpoint `PUT /requests/{id}/approve`.

1. **Scenario A (400):** Client sends `PUT /requests/abc-123/approve` but the ID must be numeric. The server rejects it immediately. 
   *Outcome:* `400 Bad Request` - "Invalid ID format".
2. **Scenario B (404):** Client sends `PUT /requests/999/approve`. The ID is numeric, but no request with ID 999 exists in the database. 
   *Outcome:* `404 Not Found` - "Purchase request 999 not found".

## Common Mistake: The Generic Error
Developers often use a generic `try-catch` block that returns 404 for any exception. For example, if a database connection fails or a null pointer occurs during business logic, returning 404 misleads the client into thinking the data is gone, when in reality, the server is broken. Always map specific domain exceptions (e.g., `ResourceNotFoundException`) to 404, and let unexpected errors result in a `500 Internal Server Error`.

## Practical Exercise
Which status code should be returned if a user requests `/orders/55` but the order exists and the user simply doesn't have permission to see it?

**Answer:** `403 Forbidden` (or `404` if you wish to hide the existence of the resource for security reasons), but never `400` because the request was syntactically correct.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
