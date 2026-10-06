---
title: "Unique Constraint vs Primary Key"
description: "Understand the critical differences between Primary Keys and Unique Constraints when designing database schemas for data integrity."
pubDate: 2026-10-12T19:48:00.000Z
translationKey: 148-unique-constraint-vs-primary-key
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a `PurchaseRequest` table. You might think, 'I already have an ID for each request, so why do I need another constraint on the request number?' This confusion often leads to databases that allow duplicate business identifiers, causing chaos in reporting and auditing.

## The Core Distinction
A Primary Key (PK) is the unique identifier for a record. It is the 'source of truth' for the database to locate a specific row. A Unique Constraint (UC), however, ensures that no two rows have the same value in a specific column, but it doesn't necessarily define the identity of the row.

## Key Technical Differences
While both prevent duplicates, they behave differently regarding nulls and quantity. A table can have only one Primary Key, but it can have multiple Unique Constraints. Most importantly, a Primary Key strictly forbids NULL values, whereas a Unique Constraint typically allows one or more NULLs (depending on the SQL dialect), as NULL is treated as an unknown value rather than a duplicate.

## Worked Example: Procurement App
Consider a `Request` entity. We use a technical ID as the PK, but the `request_code` (e.g., 'REQ-2023-001') must also be unique for the business users.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key

    @Column(unique = true, nullable = false)
    private String requestCode; // Unique Constraint
    
    private String itemDescription;
}
```
In PostgreSQL, this creates a B-tree index for both. If you try to insert two requests with the same `requestCode`, the database will throw a `ConstraintViolationException`, even if their `id` values are different.

## Common Mistake: Using Business Keys as PKs
A frequent error is using a value like `email` or `request_code` as the Primary Key. If the business logic changes (e.g., a user changes their email), you must update the PK and all foreign keys referencing it across the entire database. This is expensive and risky. The correction is to use a surrogate key (like a Long ID) as the PK and a Unique Constraint for the business key.

## Practical Exercise
Which constraint should you use for a `social_security_number` column if the table already has an `id` column? 

**Answer:** A Unique Constraint. It ensures no two people have the same SSN while keeping the `id` as the stable internal reference.

## Further reading

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
