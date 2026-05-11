---
title: "Input Validation vs Business Validation"
description: "Learn the critical distinction between checking if data is well-formed and verifying if it is logically permissible within your business domain."
pubDate: 2026-10-10T10:48:00.000Z
translationKey: 091-input-validation-vs-business-validation
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A user submits a request for a new laptop. The system accepts the request, but later, the manager rejects it because the department budget is empty. The first check (is the request formatted correctly?) and the second check (can we actually afford this?) are two entirely different layers of validation.

## Input Validation: The First Gate
Input validation focuses on the 'shape' and 'type' of the data. It ensures that the incoming request is syntactically correct before it even reaches your business logic. In Java with Jakarta Bean Validation, we use annotations like `@NotBlank` for strings or `@NotNull` for objects. It is important to note that `@NotNull` will not reject an empty string; you must use `@NotBlank` for that. When you use `@Valid` in a controller, it triggers a cascading check to ensure the object structure is sound.

## Business Validation: The Domain Logic
Business validation happens after the input is proven to be well-formed. It checks for 'eligibility' and 'state'. For example, a procurement request might be syntactically perfect (valid ID, valid amount), but business rules might dictate that a requester cannot order more than $5,000 without VP approval. This requires checking the database or external services, which is too heavy for simple input annotations.

## Worked Example: Procurement Request
Consider this excerpt of a request DTO and a service check:

```java
public class RequestDTO {
    @NotBlank
    private String itemDescription;
    
    @NotNull
    @Positive
    private BigDecimal amount;
    // getters/setters
}

// In the Service Layer
public void processRequest(RequestDTO dto) {
    if (budgetService.getRemainingBudget() < dto.getAmount()) {
        throw new InsufficientBudgetException("Budget exceeded");
    }
}
```
Outcome: If `itemDescription` is null, the API returns a 400 Bad Request immediately. If the description is fine but the budget is $0, the service throws a domain-specific exception.

## Common Mistake: Relying Solely on Annotations
A common error is trying to put business logic inside a custom validation annotation. While possible, it often leads to tight coupling between the API layer and the database. Furthermore, remember that `@Valid` is not a database constraint. Even with perfect validation, you still need unique constraints in your database to prevent race conditions where two users claim the same resource simultaneously.

## Practical Exercise
Scenario: A user submits a 'Quantity' field. You want to ensure it is not null and that the warehouse actually has that many items in stock.

Question: Which check is Input Validation and which is Business Validation?

Answer: Checking if the field is null is Input Validation; checking the warehouse stock is Business Validation.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
