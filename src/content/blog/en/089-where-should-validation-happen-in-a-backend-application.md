---
title: "Where Should Validation Happen in a Backend Application?"
description: "A guide to separating input shape validation, business logic eligibility, and database constraints to build robust backend systems."
pubDate: 2026-10-10T08:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request for 100 laptops. The request arrives as a JSON object. If the `quantity` field is missing or is a string instead of a number, the system crashes. If the quantity is -5, it's logically impossible. If the requester has already spent their entire annual budget, the request is ineligible. Each of these failures happens at a different layer.

## Input Shape Validation
The first line of defense is the API layer. This is where you check if the data 'looks' right. In Java with Jakarta Bean Validation, you use annotations like `@NotNull` or `@NotBlank`. It is important to note that `@NotNull` only checks if the reference is null; it will not reject an empty string. For strings, `@NotBlank` is required. When you use `@Valid` in a controller, it triggers a cascading validation of the object's fields before the code even enters your service method.

## Business Eligibility Validation
Once the data shape is correct, you must check if the action is allowed. This happens in the Service Layer. For our procurement app, the service checks if the requester has enough remaining budget. This isn't a 'shape' issue—the number 100 is a valid integer—but it is a business violation. These checks should throw custom domain exceptions that the API layer can translate into meaningful error messages without exposing internal stack traces.

## Database Constraints and Concurrency
Even with perfect service checks, two requests could hit the server at the exact same millisecond. If a user tries to create two requests with the same unique reference ID, the service layer might see both as 'valid' because neither exists in the DB yet. This is why database unique constraints are mandatory. They act as the final safety net against race conditions.

## Worked Example: Purchase Request

```java
public class PurchaseRequest {
    @NotBlank // Ensures not null and not empty
    private String itemCode;

    @NotNull // Ensures the field exists
    @Min(1)   // Ensures positive number
    private Integer quantity;
}

// Service Layer Logic
public void processRequest(PurchaseRequest req) {
    if (budgetService.isExceeded(req.getUserId())) {
        throw new BudgetExceededException("Insufficient funds");
    }
    repository.save(req);
}
```

**Outcome:** A request with a null `itemCode` is rejected immediately by the API (400 Bad Request). A request for 100 laptops by a user with $0 budget is rejected by the Service (422 Unprocessable Entity).

## Common Mistake: Over-reliance on @Valid
Developers often think `@Valid` replaces all checks. However, `@Valid` cannot check the database or complex business rules. 
**Correction:** Use `@Valid` for syntax/shape and a Service method for state/eligibility.

## Practical Exercise
Which layer should check if a `username` already exists in the database: the Controller (via `@Valid`) or the Service layer?

**Answer:** The Service layer (and ultimately the DB unique constraint), because it requires a database lookup which is a business rule, not a shape validation.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
