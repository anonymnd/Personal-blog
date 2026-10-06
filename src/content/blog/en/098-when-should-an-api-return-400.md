---
title: "When Should an API Return 400?"
description: "Learn how to distinguish between client-side input errors and server-side business logic failures in REST APIs."
pubDate: 2026-10-10T17:48:00.000Z
translationKey: 098-when-should-an-api-return-400
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request, but the server rejects it. Should the API return a 400 Bad Request or a 422 Unprocessable Entity? Many developers use 400 for everything, which confuses the client about whether the JSON was malformed or the data was logically invalid.

## The Role of 400 Bad Request
A 400 status code indicates that the server cannot process the request due to something that is perceived to be a client error. This specifically refers to the *syntax* or *shape* of the request. If the JSON is malformed, a required field is missing, or a string is provided where an integer is expected, 400 is the correct choice.

## Input Validation vs. Business Logic
It is crucial to separate input shape validation from business eligibility. For example, using Jakarta Bean Validation, `@NotNull` ensures a field exists, while `@NotBlank` ensures a string isn't just whitespace. These are structural checks. However, checking if a requester has enough budget for a purchase is a *business rule*. While some use 400 for this, 422 is often more precise for semantic errors where the syntax is correct but the values are invalid for the current state of the system.

## Worked Example: Procurement Request
Consider a request to create a purchase order:

```java
public class PurchaseRequest {
    @NotBlank
    private String itemDescription;
    
    @NotNull
    @Min(1)
    private Integer quantity;
}
```

If the client sends `{"quantity": 0}`, the `@Min(1)` constraint is violated. The API returns a **400 Bad Request** because the input fails the basic structural contract. If the client sends a valid request but the item is banned by company policy, that is a domain error, not a 400.

## Common Mistake: Relying Solely on @Valid
A common error is assuming `@Valid` prevents all bad data. `@Valid` triggers cascading validation, but it does not replace database unique constraints. For instance, if two users submit the same request ID simultaneously, the validation passes, but the database will throw a constraint violation. You must handle this exception and return a meaningful error rather than a 500 Internal Server Error.

## Practical Exercise
Scenario: A client sends a JSON body where a date field is formatted as "January 5th" instead of "2024-01-05". Which status code should the API return?

**Answer:** 400 Bad Request, because the data format (syntax) is incorrect for the expected type.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
