---
title: "@ManyToMany Explained"
description: "A comprehensive guide to modeling many-to-many relationships using JPA and Hibernate in a PostgreSQL environment."
pubDate: 2026-10-12T11:48:00.000Z
translationKey: 140-manytomany-explained
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where a single Purchase Request can contain multiple Items, and a specific Item (like a 'Laptop') can appear in many different Purchase Requests. If you try to use a simple foreign key in one table, you will quickly realize it cannot hold a list of IDs. This is where the `@ManyToMany` annotation becomes essential.

## How the Mechanism Works
In a relational database like PostgreSQL, a many-to-many relationship cannot exist directly between two tables. Instead, it requires a 'Join Table'. This third table stores pairs of foreign keys: one pointing to the Request and one to the Item. JPA abstracts this complexity. When you mark two entities with `@ManyToMany`, Hibernate automatically manages this join table, inserting rows when you add an item to a request's list and deleting them when you remove one.

## Worked Example: Procurement App
Here is how you would implement the relationship between `PurchaseRequest` and `Item`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "request_items",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<Item> items = new ArrayList<>();
}

@Entity
public class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @ManyToMany(mappedBy = "items")
    private List<PurchaseRequest> requests = new ArrayList<>();
}
```
In this setup, `PurchaseRequest` is the owner of the relationship. If you add an `Item` to the `items` list and save the request, Hibernate inserts a record into the `request_items` table.

## Common Mistake: The Bi-directional Sync
A frequent error is updating only one side of the relationship in Java code. For example, calling `request.getItems().add(item)` but forgetting `item.getRequests().add(request)`. While Hibernate might save the data to the DB, the objects currently in your JVM memory will be inconsistent, leading to bugs in your business logic before the next refresh.

## Performance Note
By default, `@ManyToMany` uses `FetchType.LAZY`. This means items aren't loaded until you call `.getItems()`. Be careful not to change everything to `EAGER` to solve `LazyInitializationException`, as this can cause massive performance hits by loading thousands of unnecessary records.

## Practical Exercise
**Task:** You have a `User` entity and a `Role` entity. A user can have many roles, and a role can belong to many users. Which entity should have the `mappedBy` attribute to make `User` the owner?

**Answer:** The `Role` entity should have `mappedBy = "roles"` (assuming the field in `User` is named `roles`) to make `User` the owner.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
