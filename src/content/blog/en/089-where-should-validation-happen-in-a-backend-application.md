---
title: "Validate Input, Business Eligibility and Database Invariants"
description: "A deep dive into the three layers of validation using a workshop registration scenario to prevent invalid data and race conditions."
pubDate: 2026-10-07T10:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
seriesOrder: 19
locale: en
tags: ["validation-errors","learning-series"]
draft: false
---

## The Three Layers of Validation

Input validation checks the request’s shape: @NotNull rejects null, @NotBlank rejects null or strings without a non-whitespace character, and @Positive requires a positive numeric value (add @NotNull for a nullable wrapper). @Valid cascades validation when the surrounding validation mechanism runs; putting it on an arbitrary method does not by itself activate validation.

Business eligibility asks whether the workshop is open and the user may register. Database invariants protect final stored state under concurrent requests. A uniqueness constraint can prevent duplicate registrations, but cannot by itself protect a seat counter. Constraints, atomic conditional updates, locks or serializable transactions each address specific races; choose a complete transaction design rather than claiming constraints are the only concurrency tool.
## Worked Example: Workshop Registration

The request contains contactEmail, a positive requestedSeats value and workshopId. Validate it at the HTTP boundary with @Valid, and define whether contactEmail must also satisfy @Email and the application’s normalization policy. @NotBlank alone does not validate an email address.

A vulnerable implementation reads one available seat and then inserts a booking. Two requests can both pass that read. Instead, reserve seats with one conditional UPDATE in the same transaction as the booking insert:

```sql
UPDATE workshop
SET available_seats = available_seats - :requested
WHERE id = :workshop_id
  AND is_open = TRUE
  AND available_seats >= :requested;
```

Require exactly one affected row; zero means that the workshop is missing, closed or has insufficient seats, which the application must classify according to its contract. Then insert the booking with requestedSeats and a unique constraint on (workshop_id, normalized_contact_email). Roll back the entire transaction if insertion fails, restoring the seat reservation. A CHECK available_seats >= 0 is an additional guard, not a substitute for actually updating the counter.

Do not catch every DataIntegrityViolationException and call it a duplicate. Inspect the known violated constraint at an appropriate transaction boundary. An ORM save may defer SQL until flush or commit, so a try/catch around save alone may not catch the failure. For PostgreSQL, a failed statement can leave the transaction requiring rollback. Test two different users taking the last seat, as well as one user registering twice.
## Focused Exercise

**Scenario**: You are building a system where a user can join a "Premium Group". 
- The `groupCode` must not be blank.
- The user must be at least 18 years old (Business check).
- A user can only be in one Premium Group at a time (Database invariant).

**Question**: Which validation tool/layer do you use for each requirement, and why?

**Answer**:
1. `groupCode`: `@NotBlank` in the Request DTO (Input Validation). It's a simple shape check.
2. Age ≥ 18: Service-layer logic checking the User entity (Business Eligibility). This requires accessing the user's profile data.
3. One group per user: Unique constraint on `user_id` in the `group_members` table (Database Invariant). This prevents a race condition where a user clicks "Join" twice rapidly in two different browser tabs.

## Further reading

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
