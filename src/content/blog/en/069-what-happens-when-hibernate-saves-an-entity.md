---
title: "What Happens When Hibernate Saves an Entity?"
description: "A deep dive into the internal lifecycle and decision-making process of the Hibernate save operation."
pubDate: 2026-10-09T12:48:00.000Z
translationKey: 069-what-happens-when-hibernate-saves-an-entity
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a new purchase request, and you call `repository.save(request)`. You might assume this immediately triggers an `INSERT` statement in your database, but Hibernate's internal mechanism is far more strategic.

## The Save Decision: Persist vs Merge
When you use Spring Data JPA's `save()` method, the framework first checks if the entity is new. If the entity has no ID (or the ID is null), Hibernate calls `persist()`. This tells the Persistence Context to manage the object. If the entity already has an ID, Hibernate calls `merge()`. This is a critical distinction: `merge` doesn't just update; it copies the state of your detached object into a managed instance retrieved from the database.

## The Role of the Persistence Context
Hibernate doesn't talk to the database every time you change a field. It uses a 'First-Level Cache' (the Persistence Context). When you save an entity, it enters this cache in a 'managed' state. Hibernate tracks every change you make to that object. The actual SQL is often delayed until the transaction is about to commit or a manual `flush()` is called.

## ID Generation and Timing
The timing of the SQL `INSERT` depends on your `@GeneratedValue` strategy. If you use `SEQUENCE`, Hibernate can fetch the next ID from the database without inserting the row yet. However, if you use `IDENTITY` (common in MySQL), Hibernate must execute the `INSERT` immediately because it needs the database to generate the ID to manage the entity in the cache.

## Worked Example: Procurement Request
```java
// Illustrative excerpt
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item = "Laptop";
}

// In the service:
PurchaseRequest req = new PurchaseRequest();
PurchaseRequest savedReq = repository.save(req); 
// With IDENTITY, INSERT happens here. 
// With SEQUENCE, INSERT happens at flush time.
```
Outcome: The `savedReq` object is now managed. Any further changes to `savedReq` before the transaction ends will be automatically synchronized with the DB without calling `save()` again.

## Common Mistake: Ignoring the Return Value
Developers often call `repository.save(entity)` and continue using the original `entity` object. When `merge()` is used, the original object remains detached; only the returned instance is managed. 

**Correction:** Always assign the result: `entity = repository.save(entity);`.

## Practical Exercise
If you use `GenerationType.SEQUENCE` and call `save()` on a new entity, does the `INSERT` statement execute immediately?

**Answer:** No, it typically waits until the session is flushed or the transaction commits, although the ID is fetched immediately.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
