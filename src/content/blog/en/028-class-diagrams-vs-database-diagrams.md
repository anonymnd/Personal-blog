---
title: "Class Diagrams vs Database Diagrams"
description: "Understand the fundamental differences between object-oriented modeling and relational data structures to avoid architectural confusion."
pubDate: 2026-10-07T19:48:00.000Z
translationKey: 028-class-diagrams-vs-database-diagrams
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. You start drawing boxes for 'PurchaseRequest' and 'Approval'. You realize that while both look like tables, one describes how the code behaves and the other describes how the data survives a system restart. Confusing these two often leads to 'Anemic Domain Models' where your business logic is scattered across SQL queries instead of being encapsulated in objects.

## The Conceptual Divide
A Class Diagram is a blueprint for software behavior. It focuses on encapsulation, inheritance, and methods. It tells you what an object *does*. A Database Diagram (ERD), however, is a blueprint for storage. It focuses on normalization, foreign keys, and data integrity. It tells you what the system *remembers*.

## Structural Differences
In a Class Diagram, you use composition and aggregation to show ownership. You might have a `Request` class that contains a list of `Item` objects. In a Database Diagram, this relationship is flattened into a foreign key column in the `Items` table. While a class can inherit properties from a parent class (e.g., `Manager` inherits from `Employee`), relational databases don't have native inheritance; you must use strategies like Single Table Inheritance or Joined Tables.

## Worked Example: Procurement Flow
Consider a request submission. In a Class Diagram, the `PurchaseRequest` class has a method `calculateTotal()` that sums the prices of its items. The logic lives inside the object.

```java
// Class Diagram representation (Excerpt)
public class PurchaseRequest {
    private List<Item> items;
    public double calculateTotal() {
        return items.stream().mapToDouble(Item::getPrice).sum();
    }
}
```

In the Database Diagram, there is no `calculateTotal()` method. Instead, you have a `purchase_requests` table and an `items` table linked by `request_id`. To get the total, you write a SQL `SUM()` query.

## Common Mistake: The Mirror Trap
A frequent error is trying to make the Class Diagram a 1:1 mirror of the Database Diagram. If you do this, your classes become simple data holders (POJOs) with only getters and setters, moving all your business logic into the database layer or service classes.

**Correction:** Design your classes based on the behavior they need to perform, and design your tables based on how the data needs to be queried efficiently.

## Practical Exercise
If you have a `User` class and a `Role` class with a many-to-many relationship, how does the representation differ between the two diagrams?

**Answer:** In the Class Diagram, `User` has a `List<Role>` and `Role` has a `List<User>`. In the Database Diagram, you must introduce a third 'join table' (e.g., `user_roles`) to link the two primary keys.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
