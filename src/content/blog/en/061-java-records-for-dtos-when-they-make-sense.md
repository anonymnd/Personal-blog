---
title: "Java Records for DTOs: When They Make Sense"
description: "Learn how to use Java Records to simplify Data Transfer Objects and why they should not be used for JPA entities."
pubDate: 2026-10-09T04:48:00.000Z
translationKey: 061-java-records-for-dtos-when-they-make-sense
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where a requester submits a purchase request. You need a way to move this data from the REST controller to the service layer. Traditionally, you would create a POJO with private fields, getters, `equals()`, `hashCode()`, and `toString()`, resulting in 50 lines of boilerplate for just three fields.

## The Shift to Records
Introduced as a standard feature in Java 16, Records are immutable data carriers. When you declare a record, the Java compiler automatically generates the constructor, private final fields, and accessor methods. This makes them ideal for Data Transfer Objects (DTOs) because DTOs are meant to carry data without changing it during transit.

## Implementation in a Procurement App
In our procurement scenario, a `PurchaseRequestDTO` only needs to capture the item name and quantity. Instead of a verbose class, we use a record:

```java
public record PurchaseRequestDTO(String itemName, int quantity, String requesterId) {}
```

When a manager approves this request, the controller receives a JSON body which Jackson binds directly to this record. The data is immutable, ensuring that the `itemName` cannot be accidentally altered by a developer before it reaches the approval logic.

## Records vs. JPA Entities
A common mistake is trying to use Records as JPA `@Entity` classes. This fails because JPA requires a no-args constructor and non-final fields to support lazy loading and proxying. Records are final and their fields are final, making them incompatible with the Hibernate proxy mechanism. Use Records for the API layer (DTOs) and standard classes for the database layer (Entities).

## Comparison Table

| Feature | Java Record | Standard POJO |
| :--- | :--- | :--- |
| Immutability | Built-in (Final) | Manual |
| Boilerplate | Minimal | High |
| JPA Entity | Unsuitable | Ideal |
| Use Case | DTOs, API responses | Database Entities |

## Practical Exercise
Create a record called `OrderResponseDTO` that returns an `orderId` (String) and a `status` (String).

**Check:** `public record OrderResponseDTO(String orderId, String status) {}`

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
