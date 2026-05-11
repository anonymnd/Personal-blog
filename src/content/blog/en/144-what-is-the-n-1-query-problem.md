---
title: "What Is the N+1 Query Problem?"
description: "A deep dive into the performance trap where a single request triggers hundreds of unnecessary database queries."
pubDate: 2026-10-12T15:48:00.000Z
translationKey: 144-what-is-the-n-1-query-problem
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You want to display a list of 50 purchase requests, and for each request, you want to show the name of the manager who needs to approve it. You fetch the requests, loop through them in your code, and call `request.getManager().getName()`. Suddenly, your logs show 51 queries hitting the PostgreSQL database: one to get the requests, and 50 individual queries to fetch each manager. This is the N+1 query problem.

## The Mechanism of Lazy Loading
In JPA and Hibernate, `@ManyToOne` relationships are often fetched eagerly by default, but `@OneToMany` are lazy. When you use lazy loading, Hibernate doesn't fetch the related entity immediately. Instead, it puts a 'proxy' object there. The actual SQL query is only triggered the moment you call a getter on that proxy. If you are iterating over a list of N entities, Hibernate executes 1 query for the list and N additional queries for the related data.

## A Worked Example
Consider a `PurchaseRequest` entity and a `Manager` entity. If you use a standard `findAll()` method:

```java
// Illustrative excerpt
List<PurchaseRequest> requests = repository.findAll(); // Query 1: SELECT * FROM purchase_request
for (PurchaseRequest req : requests) {
    System.out.println(req.getManager().getName()); // Query 2 to N+1: SELECT * FROM manager WHERE id = ?
}
```
Outcome: If you have 100 requests, you execute 101 queries. This creates massive network overhead and slows down the application significantly.

## The Common Mistake: Switching to EAGER
Many developers try to fix this by changing the fetch type to `FetchType.EAGER`. This is a mistake because it forces the application to always load the related entity, even when you don't need it, leading to memory bloat and inefficient queries in other parts of the app.

## The Correct Solution: JOIN FETCH
The professional way to solve this is using a JOIN FETCH in JPQL. This tells Hibernate to fetch the association in a single SQL JOIN.

```java
@Query("SELECT r FROM PurchaseRequest r JOIN FETCH r.manager")
List<PurchaseRequest> findAllWithManagers();
```
Now, only one query is executed: `SELECT r.*, m.* FROM purchase_request r JOIN manager m ON r.manager_id = m.id`.

## Practical Exercise
You have a `Buyer` entity with a `@OneToMany` list of `Order` entities. You want to list 10 buyers and their orders without triggering N+1. What JPQL keyword should you use in your repository method?

**Answer:** Use `JOIN FETCH` (e.g., `SELECT b FROM Buyer b JOIN FETCH b.orders`).

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
