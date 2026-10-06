---
title: "I Finally Understand Why We Use DTOs"
description: "A conceptual deep dive into why Data Transfer Objects are essential for decoupling your internal domain from your external API."
pubDate: 2026-10-17T16:48:00.000Z
translationKey: 265-i-finally-understand-why-we-use-dtos
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. Initially, you might just return your `PurchaseRequest` entity directly from your controller. It feels fast and efficient. But then, a problem arises: your database entity contains a `secretInternalNote` field that the requester should never see, and a `version` field used by Hibernate that the frontend doesn't care about. If you expose the entity, you expose your database schema to the world.

## The Decoupling Mechanism

A Data Transfer Object (DTO) is a simple POJO used to carry data between processes. Instead of sending the database entity, you create a specific class that contains only the fields needed for that specific request or response. This creates a buffer zone. If you rename a column in your database, you only change the mapping logic, not the API contract that your frontend depends on.

## A Worked Example

Consider a `PurchaseRequest` entity with fields: `id`, `item`, `quantity`, `status`, and `internalAuditCode`. We only want the requester to see the item and status.

```java
// The Domain Entity
public class PurchaseRequest {
    private Long id;
    private String item;
    private int quantity;
    private String status;
    private String internalAuditCode; // Sensitive!
}

// The DTO
public class PurchaseRequestDTO {
    private String item;
    private String status;
}
```

In the service layer, you map the entity to the DTO. The outcome is a JSON response containing only `item` and `status`, keeping the `internalAuditCode` safe on the server.

## Common Mistake: The "Pass-Through" DTO

A frequent error is creating a DTO that is an exact mirror of the entity. While this seems redundant, the mistake is thinking the DTO is useless because the fields are the same. The value isn't in the fields, but in the *separation*. If you don't use a DTO, any change to the entity automatically breaks the API.

## Practical Exercise

**Scenario:** You have a `Buyer` entity with `name`, `email`, and `hashedPassword`. You need to create a DTO for a public profile page.

**Question:** Which fields should be in the `BuyerProfileDTO`?

**Answer:** Only `name` and `email`. The `hashedPassword` must never leave the service layer.
