---
title: "Lazy Loading vs Eager Loading"
description: "Understand how to optimize database queries in JPA and Hibernate by choosing the right fetching strategy."
pubDate: 2026-10-12T14:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. When a manager opens a 'Purchase Request' to check the total amount, the application suddenly slows down because it is loading every single item, every comment, and the full profile of the requester from the database, even though the manager only needs the request header. This is the classic struggle between Lazy and Eager loading.

## The Mechanism of Fetching
In JPA, fetching strategies determine when related entities are loaded from PostgreSQL. Eager loading (`FetchType.EAGER`) tells Hibernate to retrieve the associated data immediately using a JOIN or a separate query. Lazy loading (`FetchType.LAZY`) creates a proxy object; the actual data is only fetched from the database the moment you call a getter method on that collection or entity.

## Default Behaviors
It is crucial to know that JPA has defaults. `@ManyToOne` and `@OneToOne` relationships are EAGER by default. Conversely, `@OneToMany` and `@ManyToMany` are LAZY. If you have a `PurchaseRequest` with many `RequestItems`, Hibernate won't load the items until you explicitly ask for them.

## Worked Example: Procurement Workflow
Consider a `PurchaseRequest` entity and its `RequestItem` collection:

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    // Default is LAZY
    @OneToMany(mappedBy = "request", fetch = FetchType.LAZY)
    private List<RequestItem> items;
}
```

If you call `repository.findById(1L)`, Hibernate executes one query for the request. If you then call `request.getItems().size()`, Hibernate triggers a second query to fetch the items. If you changed this to `EAGER`, a single query with a JOIN would fetch everything at once.

## The N+1 Problem and Common Mistakes
A common mistake is switching everything to `EAGER` to avoid `LazyInitializationException`. This often leads to the N+1 problem: fetching 10 requests (1 query) and then triggering 10 separate queries to fetch items for each request. The correction is to keep relationships `LAZY` and use a "JOIN FETCH" query in your repository when you know you need the data.

## Practical Exercise
**Scenario:** You have a `@ManyToOne` relationship from `RequestItem` to `PurchaseRequest`. By default, is this Eager or Lazy? If you want to avoid loading the full request every time you list items, what should you change?

**Answer:** It is EAGER by default. You should explicitly set `fetch = FetchType.LAZY` in the `@ManyToOne` annotation.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
