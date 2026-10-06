---
title: "@OneToMany Explained"
description: "A deep dive into mapping one-to-many relationships in JPA using Hibernate and PostgreSQL."
pubDate: 2026-10-12T09:48:00.000Z
translationKey: 138-onetomany-explained
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where one Manager can oversee multiple Purchase Requests. You have the entities ready, but when you try to retrieve a Manager, you realize you don't know how to efficiently access their list of requests without writing manual SQL queries. This is where `@OneToMany` comes in.

## Understanding the Mechanism
In JPA, `@OneToMany` defines a relationship where one instance of an entity is associated with multiple instances of another. By default, this relationship is **LAZY**. This means Hibernate won't load the collection of child entities from PostgreSQL until you actually call the getter method (e.g., `manager.getRequests()`). This prevents loading the entire database into memory unnecessarily.

## Worked Example: Procurement Workflow
In our app, a `Manager` (One) has many `PurchaseRequest` (Many) objects. To avoid a separate join table, we use the `mappedBy` attribute to indicate that the `PurchaseRequest` entity owns the relationship via a `@ManyToOne` field.

```java
@Entity
public class Manager {
    @Id @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<PurchaseRequest> requests = new ArrayList<>();
}

@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;
}
```
**Outcome:** When you save a Manager with a list of requests, Hibernate inserts the manager first, then inserts the requests with the `manager_id` foreign key pointing to the manager's ID.

## Common Mistake: The N+1 Problem
Developers often encounter the N+1 problem when iterating over a list of Managers and accessing their requests. Hibernate executes one query to get N managers, then N additional queries to get requests for each manager. 

**Correction:** Instead of changing the fetch type to `EAGER` (which kills performance), use a `JOIN FETCH` in your JPQL query: `SELECT m FROM Manager m JOIN FETCH m.requests`.

## PostgreSQL Indexing Note
Remember that while JPA creates the Foreign Key in PostgreSQL, PostgreSQL does not automatically create an index on that FK. If you frequently query requests by manager, you must manually add an index to the `manager_id` column to maintain performance.

## Practical Exercise
If you have a `Buyer` entity and an `Order` entity where one buyer handles many orders, which entity should hold the `mappedBy` attribute to ensure a bidirectional relationship?

**Answer:** The `Buyer` entity should have the `@OneToMany(mappedBy = "buyer")` attribute, as the `Order` entity typically owns the foreign key.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
