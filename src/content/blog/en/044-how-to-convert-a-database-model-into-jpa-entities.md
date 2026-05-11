---
title: "How to Convert a Database Model Into JPA Entities"
description: "Learn the systematic process of transforming a conceptual database schema into Java Persistence API entities using a procurement application example."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers struggle when moving from a visual ER diagram to Java code, often guessing where to place `@OneToMany` or `@ManyToMany` annotations. The challenge lies in translating relational cardinalities into object-oriented references without creating circular dependency loops or inefficient queries.

## Mapping Basic Entities
Every table in your physical model becomes a Java class annotated with `@Entity`. The primary key is marked with `@Id`. For a procurement app, a `Request` entity represents the core table. Ensure you use `jakarta.persistence.*` imports to follow modern standards. Each column becomes a private field with a getter and setter.

## Handling One-to-Many Relationships
In a procurement system, one `Manager` can approve many `Requests`. In the database, this is a foreign key in the `Request` table. In JPA, the `Request` entity is the 'owning side' because it holds the foreign key. Use `@ManyToOne` on the `Request` side and `@OneToMany(mappedBy = "manager")` on the `Manager` side to create a bidirectional link.

## Resolving Many-to-Many with Join Entities
If a `Request` can contain multiple `Products` and a `Product` can be in many `Requests`, a simple `@ManyToMany` might suffice. However, if you need to track the 'quantity' of each product per request, you must create a separate `RequestItem` entity. This converts the many-to-many relationship into two one-to-many relationships, allowing the join entity to hold additional attributes.

## Worked Example: Procurement Flow
Consider a `Request` and a `Buyer`.

```java
@Entity
public class Request {
    @Id @GeneratedValue
    private Long id;
    private String description;

    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private Buyer buyer;
}

@Entity
public class Buyer {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "buyer")
    private List<Request> assignedRequests;
}
```
Outcome: The `Request` table contains a `buyer_id` column, while the `Buyer` object can easily access all its requests via a list.

## Common Mistake: Forgetting mappedBy
A frequent error is omitting the `mappedBy` attribute in bidirectional relationships. Without it, JPA thinks there are two independent relationships and will try to create an unnecessary join table in the database.

## Practical Exercise
Scenario: A `Department` has many `Employees`. How do you map the `Employee` side of this relationship?

Answer: Use `@ManyToOne` on the `Employee` entity with a `@JoinColumn(name = "dept_id")`.
