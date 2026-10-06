---
title: "What Is an ORM?"
description: "A beginner's guide to understanding Object-Relational Mapping and how it bridges the gap between Java objects and PostgreSQL tables."
pubDate: 2026-10-12T06:48:00.000Z
translationKey: 135-what-is-an-orm
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. In Java, you have a `PurchaseRequest` object with a list of items. In PostgreSQL, you have a `requests` table and a `request_items` table. The problem is that Java thinks in objects and graphs, while PostgreSQL thinks in rows and relations. Manually writing SQL to map every single field from a result set to a Java object is tedious and error-prone.

## The Bridge Between Two Worlds
An Object-Relational Mapper (ORM) is a technique that lets you query and manipulate data from a database using an object-oriented paradigm. Instead of writing raw SQL for every operation, you interact with Java objects, and the ORM handles the translation to SQL. In the Java ecosystem, JPA (Jakarta Persistence API) is the specification (the rules), and Hibernate is the most popular implementation (the engine) that actually does the work.

## How it Works in Practice
In an ORM, a Java class is mapped to a database table. For our procurement app, a `PurchaseRequest` entity would be annotated with `@Entity`. When you save this object, the ORM generates an `INSERT` statement automatically. 

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    private String requesterName;
    private Double totalAmount;
    // Getters and setters
}
```
If you call `repository.save(request)`, Hibernate translates this into: `INSERT INTO purchase_request (requester_name, total_amount) VALUES (?, ?);`.

## The Common Pitfall: The N+1 Problem
One frequent mistake beginners make is ignoring how data is loaded. If a `PurchaseRequest` has many `Item` entities (One-to-Many), JPA defaults to LAZY loading. If you loop through 10 requests and access their items, the ORM might execute 1 query for the requests and then 10 separate queries for the items. This is the N+1 problem. The correction is not to set everything to EAGER, but to use a "JOIN FETCH" query to get everything in one go.

## Summary Table
| Concept | SQL Approach | ORM Approach |
| :--- | :--- | :--- |
| Data Retrieval | `SELECT * FROM ...` | `repository.findById(id)` |
| Data Insertion | `INSERT INTO ...` | `entityManager.persist(object)` |
| Relationships | Foreign Keys | Object References |

## Practical Exercise
If you have a `User` entity and a `Profile` entity where one user has one profile, which JPA annotation would you use on the `Profile` field in the `User` class to link them?

**Answer:** `@OneToOne`.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
