---
title: "Entity vs DTO: Why Do We Need Both?"
description: "Learn how to decouple your database schema from your API responses using Entities and Data Transfer Objects."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 057-entity-vs-dto-why-do-we-need-both
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Your `PurchaseRequest` entity contains sensitive internal data, like the internal audit log or the database primary key. If you return this entity directly through your REST controller, you accidentally expose your internal database structure to the client, and you might leak data that the requester shouldn't see.

## The Role of the Entity
An Entity is a mirror of your database table. In Spring Boot, using `jakarta.persistence`, it defines the schema and manages the lifecycle of the data. Entities are designed for persistence; they often contain complex relationships (like `@OneToMany`) that can cause infinite recursion during JSON serialization if not handled carefully.

## The Role of the DTO
A Data Transfer Object (DTO) is a simple POJO or Java Record used specifically to carry data between processes. Unlike entities, DTOs have no persistence logic. They allow you to shape the data exactly how the frontend needs it. For example, while an entity has a `User` object, the DTO might only contain a `userName` string.

## Worked Example: Procurement Request
Consider a request where a manager approves a purchase. The Entity contains the full history, but the DTO only sends the necessary fields.

```java
// The Database Model
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item;
    private Double amount;
    private String internalAuditNote; // Sensitive!
}

// The API Model (DTO)
public record PurchaseRequestDTO(String item, Double amount) {}
```

When the controller receives a request, it maps the DTO to the Entity before calling `repository.save()`. This ensures the `internalAuditNote` cannot be manipulated by the user via the API.

## Common Mistake: Returning Entities Directly
A frequent error is returning the Entity in the `@RestController` method. This often leads to `LazyInitializationException` because the JSON converter (Jackson) tries to access a lazy-loaded relationship after the database session has closed.

**Correction:** Always map your Entity to a DTO in the service layer before returning it to the controller.

## Practical Exercise
If you have a `User` entity with `password` and `email`, and you want to display a list of users on a public profile page, should you use the Entity or a DTO? 

**Answer:** Use a DTO that excludes the `password` field to prevent security leaks.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
