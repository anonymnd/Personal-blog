---
title: "@ManyToOne Explained"
description: "A deep dive into mapping many-to-one relationships in JPA to link multiple entities to a single parent."
pubDate: 2026-10-12T10:48:00.000Z
translationKey: 139-manytoone-explained
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have dozens of `PurchaseRequest` entities, but each one must belong to exactly one `Department`. If you try to store just the department ID as a long integer in your Java class, you lose the power of object-oriented navigation. You want to call `request.getDepartment().getName()` without writing a manual SQL join every time.

## The Mechanism of @ManyToOne
In JPA, the `@ManyToOne` annotation defines a relationship where multiple instances of the owning entity map to a single instance of another entity. In the database, this translates to a Foreign Key (FK) column in the table of the entity where the annotation is placed. By default, JPA uses `FetchType.EAGER` for `@ManyToOne`, meaning Hibernate will attempt to load the associated entity immediately when the parent is fetched.

## Worked Example: Procurement Requests
Here is how we link a request to a department. We use `jakarta.persistence` imports for modern standards.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemDescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;
    
    // Getters and setters
}

@Entity
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // Getters and setters
}
```
**Outcome:** In PostgreSQL, the `purchase_request` table will have a column `dept_id` that references the `id` of the `department` table. Using `FetchType.LAZY` prevents the application from loading the entire department object unless it is explicitly accessed.

## Common Mistake: The N+1 Problem
Developers often leave the default `EAGER` fetching or blindly change everything to `EAGER` to avoid `LazyInitializationException`. If you fetch 100 requests, Hibernate might execute 1 query for the requests and 100 additional queries for each department. 

**Correction:** Use `FetchType.LAZY` and employ "Join Fetch" in your JPQL queries (e.g., `SELECT r FROM PurchaseRequest r JOIN FETCH r.department`) to retrieve the data in a single SQL query when needed.

## Practical Exercise
**Scenario:** You have a `Product` entity and a `Category` entity. Many products belong to one category. Which entity should hold the `@ManyToOne` annotation?

**Answer:** The `Product` entity, because it is the "many" side and will hold the foreign key to the category.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
