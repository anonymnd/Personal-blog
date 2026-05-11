---
title: "Why You Should Create Custom Exceptions"
description: "Learn how to replace generic system errors with domain-specific exceptions to improve code readability and API error handling."
pubDate: 2026-10-10T13:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A user tries to approve a purchase request, but the request is already closed. If you throw a generic `RuntimeException`, your global error handler doesn't know if this was a database failure, a null pointer, or a business rule violation. You end up sending a vague 'Internal Server Error' to the user, which is useless for debugging and poor for UX.

## The Problem with Generic Exceptions
Using `IllegalArgumentException` or `RuntimeException` for everything creates 'semantic noise'. When you see `throw new RuntimeException("Invalid state")` in a service, you don't know which business rule was broken without reading the string message. Furthermore, catching a generic exception is dangerous because you might accidentally catch and hide a critical system failure while trying to handle a simple business validation.

## Defining Domain-Specific Exceptions
Custom exceptions allow you to categorize errors. Instead of a generic error, you create a class like `RequestAlreadyClosedException`. This tells any developer reading the code exactly what went wrong. In a Jakarta EE environment, these are typically unchecked exceptions that extend `RuntimeException` to avoid cluttering method signatures.

## Worked Example: Procurement Approval
Here is how you implement a custom exception for a procurement flow:

```java
public class RequestAlreadyClosedException extends RuntimeException {
    public RequestAlreadyClosedException(Long id) {
        super("Purchase request " + id + " is already closed and cannot be approved.");
    }
}

// In the Service layer
public void approveRequest(Long requestId) {
    PurchaseRequest request = repository.findById(requestId);
    if ("CLOSED".equals(request.getStatus())) {
        throw new RequestAlreadyClosedException(requestId);
    }
    request.setStatus("APPROVED");
}
```
Outcome: The application now distinguishes between a technical failure (like the DB being down) and a business failure (the request being closed). A `@ControllerAdvice` can now catch `RequestAlreadyClosedException` specifically and return a `400 Bad Request` instead of a `500 Internal Server Error`.

## Common Mistake: Over-reliance on @Valid
Developers often think `@Valid` or `@NotBlank` replaces custom exceptions. While `@NotBlank` ensures a string isn't empty, it cannot check if a purchase request is in the correct state for approval. Input validation handles the 'shape' of the data; custom exceptions handle the 'logic' of the business.

## Practical Exercise
Create a custom exception called `InsufficientFundsException` for a procurement app when a buyer tries to order an item that exceeds the remaining budget. 

**Check:** Your class should extend `RuntimeException` and accept the budget amount as a parameter in the constructor to provide a detailed error message.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
