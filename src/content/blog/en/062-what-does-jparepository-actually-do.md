---
title: "What Does JpaRepository Actually Do?"
description: "A deep dive into the abstraction layer of Spring Data JPA and how it handles entity persistence."
pubDate: 2026-10-09T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many beginners treat `JpaRepository` as a magic box that talks to the database. The confusion usually starts when you call `.save()` and expect an immediate `INSERT` statement in the logs, only to find that nothing happens until the transaction closes, or when you wonder why your updated entity isn't reflecting changes in the database.

## The Abstraction Layer
`JpaRepository` is not a class you implement, but an interface that Spring Data JPA implements for you at runtime. It acts as a wrapper around the `EntityManager`. Instead of writing boilerplate code to manage transactions and entity states, the repository provides standard methods like `save()`, `findById()`, and `delete()`. It translates these high-level method calls into JPA criteria or JPQL queries.

## The Logic of the save() Method
One of the biggest misconceptions is that `save()` always performs an `INSERT`. In reality, Spring Data JPA checks if the entity is new. If the entity has no ID (or the ID is null), it calls `persist()`. If an ID exists, it calls `merge()`. 

Crucially, `merge()` does not simply update the row; it copies the state of the passed entity onto a managed version of that entity. This is why you must always use the object returned by `.save()`: `entity = repository.save(entity);`.

## Example: Procurement Request
Imagine a procurement app where a requester submits a `PurchaseRequest`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemName;
    private String status; // PENDING, APPROVED
    // getters/setters
}

// Repository
public interface RequestRepository extends JpaRepository<PurchaseRequest, Long> {}
```

If you call `save()` on a new request, JPA uses the `IDENTITY` strategy to hit the DB immediately to get the ID. If you then change the status to `APPROVED` and call `save()` again, JPA performs a `merge()`. The actual SQL `UPDATE` might be delayed until the session flushes.

## Common Mistake: Ignoring the Return Value
Developers often call `repository.save(myEntity)` and continue using `myEntity`. If `save` triggered a `merge`, `myEntity` remains detached, while the returned object is the managed one. Any further changes to `myEntity` will not be tracked by the persistence context.

## Practical Exercise
**Scenario:** You have an entity with a `SEQUENCE` ID generator. You call `save()` on a new entity. Does the `INSERT` statement execute immediately?

**Answer:** No. With `SEQUENCE`, JPA can fetch the ID from the sequence first and keep the entity in memory. The `INSERT` usually happens only during the flush phase at the end of the transaction.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
