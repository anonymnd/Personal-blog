---
title: "Database Constraints vs Application Validation"
description: "Learn how to balance input validation in Java with integrity constraints in the database to prevent data corruption and race conditions."
pubDate: 2026-10-10T11:48:00.000Z
translationKey: 092-database-constraints-vs-application-validation
locale: en
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You add a check in your Java code to ensure the `requestAmount` is not negative. Everything works during testing, but in a high-traffic production environment, two simultaneous requests might bypass your logic, or a direct SQL script might insert invalid data, leading to corrupted financial reports.

## The Role of Application Validation
Application validation, often implemented using Jakarta Bean Validation (`jakarta.validation.constraints`), acts as the first line of defense. It ensures the input shape is correct before the business logic even starts. For example, using `@NotBlank` on a requester's name ensures the string isn't null or just whitespace. However, it is important to remember that `@NotNull` does not reject empty strings; it only checks for nullity. These annotations provide immediate feedback to the user without hitting the database, reducing unnecessary server load.

## The Necessity of Database Constraints
While Java checks are fast, they cannot guarantee integrity against concurrent requests (race conditions). If you have a rule that a `requestReference` must be unique, a Java check like `if (repository.exists(ref))` is not enough. Two threads could check the database at the exact same millisecond, both see that the reference doesn't exist, and both insert it. A `UNIQUE` constraint at the database level is the only way to absolutely prevent this duplication.

## Worked Example: Procurement Request
Consider a request entity where the `amount` must be positive and the `requestCode` must be unique.

```java
public class PurchaseRequest {
    @NotBlank(message = "Code is required")
    private String requestCode;

    @NotNull
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;
    // getters and setters
}
```

In the database schema:
```sql
CREATE TABLE purchase_requests (
    id BIGINT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) CHECK (amount > 0)
);
```
Outcome: The `@Positive` annotation gives a friendly error to the user instantly. The `CHECK` constraint prevents bad data from manual SQL inserts. The `UNIQUE` constraint stops duplicate codes during race conditions.

## Common Mistake: Relying Solely on @Valid
Developers often think `@Valid` replaces database constraints. `@Valid` simply triggers the cascading validation of fields; it does not lock the database or check for global uniqueness. If you remove the `UNIQUE` constraint because you have a Java check, you will eventually find duplicate data in your tables.

## Practical Exercise
Scenario: You need to ensure a `managerEmail` is provided and not empty. Which combination is best?

Answer: Use `@NotBlank` in Java for immediate user feedback and a `NOT NULL` constraint in the database to ensure data integrity.


## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
