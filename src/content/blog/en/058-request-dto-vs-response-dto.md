---
title: "Request DTO vs Response DTO"
description: "Learn why separating data transfer objects for incoming and outgoing API traffic prevents security leaks and improves API stability."
pubDate: 2026-10-09T01:48:00.000Z
translationKey: 058-request-dto-vs-response-dto
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You might be tempted to use a single `PurchaseRequestDTO` for both receiving the request and sending the confirmation back. However, you soon realize the requester should not see the internal `approvalStatus` or the `buyerId` when they first submit the form, and you certainly don't want them to be able to 'inject' an approved status into your API by sending it in the request body.

## The Core Distinction

A Request DTO is designed for input validation and capturing user intent. It contains only the fields the client is allowed to provide. A Response DTO is designed for data presentation, ensuring the client receives only the information they are authorized to see, formatted for their specific needs.

## Why Separation Matters

Using the same object for both directions creates a tight coupling between your internal data structure and your public API. If you add a sensitive field to your entity and include it in a shared DTO, you might accidentally leak that data to the frontend. Furthermore, validation constraints (like `@NotNull`) might be required for a request but irrelevant for a response.

## Worked Example: Procurement Request

In a procurement system, the input needs to be lean, while the output needs to be informative.

```java
// Input: Only what the user provides
public record PurchaseRequestDTO(
    String itemName,
    int quantity,
    double estimatedPrice
) {}

// Output: What the system returns
public record PurchaseResponseDTO(
    Long requestId,
    String status,
    LocalDateTime submissionDate,
    String itemName
) {}
```

When the controller receives the `PurchaseRequestDTO`, it maps it to an entity, saves it, and then maps the resulting entity to a `PurchaseResponseDTO` to return the generated ID and default status.

## Common Mistake: The 'God DTO'

Developers often create one large DTO with many optional fields to handle all scenarios. This leads to confusion: "Is this field null because the user didn't send it, or because the server didn't populate it?"

**Correction:** Create specific records for specific actions. Use `PurchaseCreateRequest` and `PurchaseDetailsResponse` to make the API contract explicit.

## Practical Exercise

If you have a `UserDTO` used for both registration and profile viewing, and you add a `password` field for registration, what happens when you return that same DTO in the profile view?

**Answer:** You risk leaking the hashed password to the client. The solution is to create a `UserRegistrationRequest` (with password) and a `UserProfileResponse` (without password).

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
