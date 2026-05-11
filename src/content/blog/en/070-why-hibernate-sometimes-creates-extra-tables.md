---
title: "Why Hibernate Sometimes Creates Extra Tables"
description: "Understand how Hibernate's mapping strategies for collections and inheritance lead to the automatic creation of join tables."
pubDate: 2026-10-09T13:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have defined a simple `@ManyToMany` relationship in your Java code, but when you check your database, you find a third table you never explicitly created. This often feels like Hibernate is acting autonomously, but these 'extra' tables are actually the mechanism used to resolve relational mapping requirements.

## The Join Table Mechanism
In a relational database, a many-to-many relationship cannot be stored as a simple column in one of the two main tables. To avoid data duplication and maintain normalization, Hibernate creates a 'Join Table'. This table acts as a bridge, containing only the primary keys of the two entities it connects. If you use `@ManyToMany` without specifying a `@JoinTable` annotation, Hibernate generates one automatically using a default naming convention: `Entity1_Entity2`.

## Inheritance Mapping Strategies
Another common cause for extra tables is the `@Inheritance` strategy. If you use `InheritanceType.JOINED`, Hibernate creates a base table for the parent class and separate tables for every subclass. Each subclass table contains only the specific fields of that child and a foreign key linking back to the parent. While this is clean from a normalization perspective, it results in more tables than your class hierarchy might suggest at first glance.

## Worked Example: Procurement App
Imagine a procurement system where a `PurchaseRequest` can have multiple `Item`s, and an `Item` can belong to many requests.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany
    private List<Item> items;
}

@Entity
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
```

**Outcome:** Hibernate creates three tables: `purchase_request`, `item`, and a hidden join table named `purchase_request_items`. This third table manages the links between requests and items.

## Common Mistake: Overusing ManyToMany
Developers often use `@ManyToMany` when a `@OneToMany` with a join column would suffice. This creates unnecessary join tables that slow down queries. 

**Correction:** If the relationship is truly one-to-many (e.g., a Request has many LineItems, but a LineItem belongs to only one Request), use `@OneToMany` and `@ManyToOne`. This stores the foreign key directly in the child table, removing the need for the extra bridge table.

## Practical Exercise
If you have a `User` entity and a `Role` entity with a `@ManyToMany` relationship, and you want the join table to be named `user_roles` instead of the default, which annotation should you add?

**Answer:** Add `@JoinTable(name = "user_roles")` above the collection field in the entity.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
