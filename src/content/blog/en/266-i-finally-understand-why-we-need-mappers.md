---
title: "I Finally Understand Why We Need Mappers"
description: "A deep dive into the conceptual separation between database entities and data transfer objects to prevent architectural leakage."
pubDate: 2026-10-17T17:48:00.000Z
translationKey: 266-i-finally-understand-why-we-need-mappers
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a `PurchaseRequest` entity that maps directly to your database table, containing sensitive fields like `internalAuditCode` and `databaseVersion`. If you return this entity directly from your REST controller, you accidentally expose internal system details to the frontend. This is the exact moment where the need for Mappers becomes clear.

## The Entity vs. DTO Conflict

An Entity represents the data as it lives in the database. A Data Transfer Object (DTO) represents the data as the client needs to see it. When we use the same object for both, we create a tight coupling. If you change a column name in your database, your API contract breaks for every client using your app. Mappers act as the translation layer that decouples these two worlds.

## How the Mapping Mechanism Works

A Mapper is a dedicated component whose only job is to copy data from one object to another. Instead of polluting your business logic with `dto.setName(entity.getName())` calls, you encapsulate this logic. This ensures that your service layer handles business rules, while the mapper handles the structural transformation.

## Worked Example: Procurement Request

Consider a scenario where a requester submits a request. The entity has everything, but the DTO only needs the essentials.

```java
// Entity: Database representation
public class PurchaseRequest {
    private Long id;
    private String item;
    private Double price;
    private String internalAuditCode; // Secret!
}

// DTO: API representation
public class PurchaseRequestDTO {
    private String item;
    private Double price;
}

// Mapper
public class PurchaseMapper {
    public PurchaseRequestDTO toDto(PurchaseRequest entity) {
        PurchaseRequestDTO dto = new PurchaseRequestDTO();
        dto.setItem(entity.getItem());
        dto.setPrice(entity.getPrice());
        return dto;
    }
}
```

**Outcome:** The API client receives only the item and price, keeping the `internalAuditCode` safely hidden on the server.

## Common Mistake: Mapping in the Controller

A frequent error is putting mapping logic inside the `@RestController`. This makes the controller bloated and prevents the mapping logic from being reused in other services.

**Correction:** Create a separate Mapper class or use a library like MapStruct. Inject the mapper into your service or a dedicated facade layer to keep controllers lean.

## Practical Exercise

**Task:** You have a `Manager` entity with `id`, `name`, and `salary`. You need a `ManagerDTO` that only shows the `name`. Write the `toDto` method logic.

**Check:** The method should instantiate `ManagerDTO` and call `dto.setName(entity.getName())`, ignoring the `id` and `salary` fields.
