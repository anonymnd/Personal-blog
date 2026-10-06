---
title: "Why Do We Need Mapper Classes?"
description: "Learn how mapper classes decouple your database entities from your API responses to ensure security and flexibility."
pubDate: 2026-10-09T03:48:00.000Z
translationKey: 060-why-do-we-need-mapper-classes
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Your `PurchaseRequest` entity contains a `requesterId`, a `totalAmount`, and a `secretInternalNote` used only by the procurement team. If you return this entity directly from your REST controller, the `secretInternalNote` is leaked to the requester's browser. This is a common architectural trap where the database schema dictates the API contract.

## The Separation of Concerns
Mapper classes act as a translation layer between your Domain Entities (which mirror your database) and Data Transfer Objects (DTOs, which mirror your API). By separating these, you ensure that changes in the database table don't automatically break the mobile app or frontend consuming your JSON. DTOs allow you to flatten complex relationships or combine multiple entities into one response.

## How Mappers Work in Practice
Instead of letting the controller handle the conversion, a dedicated Mapper class encapsulates the logic. This keeps your business logic clean and your controllers thin.

```java
// DTO for the API response
public record RequestResponse(Long id, String item, double amount) {}

// Mapper Class
@Component
public class PurchaseMapper {
    public RequestResponse toResponse(PurchaseRequest entity) {
        return new RequestResponse(
            entity.getId(), 
            entity.getItemName(), 
            entity.getTotalAmount()
        );
    }
}
```
In this example, the `secretInternalNote` is intentionally ignored, protecting sensitive data.

## Common Mistake: Mapping in the Entity
Many beginners add `toDto()` methods inside the JPA Entity class. This is a mistake because it couples your persistence layer to your presentation layer. If you ever need to change your API version without changing your database, you'll find your Entity class bloated with multiple mapping methods for different versions.

## The Outcome
By using a mapper, your controller simply calls `mapper.toResponse(entity)`. The outcome is a clean API contract where you control exactly which fields are exposed, and your entity remains a pure representation of the data store.

## Practical Exercise
Scenario: You have a `Manager` entity with `id`, `name`, and `salary`. You need a `ManagerDTO` that only shows `id` and `name`.

**Task:** Write the mapping logic for the `toDto` method.

**Check:** Your method should instantiate `ManagerDTO` using only the `id` and `name` getters from the entity, leaving the `salary` field untouched.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
