---
title: "I Finally Understand Why Database Design Comes Before Coding Everything"
description: "A reflection on why mapping data relationships first prevents costly architectural rework during development."
pubDate: 2026-10-17T23:48:00.000Z
translationKey: 272-i-finally-understand-why-database-design-comes-before-coding-everything
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine starting a procurement app by immediately writing the Java classes for a `PurchaseRequest`. You create the fields, build the REST controller, and start coding the logic. Two weeks later, you realize a single request needs to handle multiple items, each with different tax rules, and that a manager might need to delegate approval to another user. Suddenly, your entire service layer is broken because your initial 'flat' data structure cannot support these relationships. This is the 'code-first trap.'

## The Blueprint Analogy
Coding without a database schema is like building walls before deciding where the plumbing goes. The database is the foundation of your application's truth. If the schema is wrong, every line of code written on top of it is essentially a temporary patch. Designing the schema first allows you to visualize the business constraints—such as whether a `Buyer` can handle multiple `Orders` or if an `Order` must belong to exactly one `Buyer`—before you commit to a specific class hierarchy.

## Mapping the Procurement Flow
In a hypothetical procurement system, the data flow dictates the logic. If we model it first, we see three distinct entities: `Request`, `Approval`, and `PurchaseOrder`. 

| Entity | Relationship | Constraint |
| :--- | :--- | :--- |
| Request | 1:N with Approval | Must have at least one approval to proceed |
| Request | 1:1 with PurchaseOrder | Only one order per approved request |
| User | 1:N with Request | A requester can submit many requests |

## A Concrete Example
If we design the schema first, we define a `Request` table and a `RequestItem` table. In Jakarta Persistence, this looks like:

```java
@Entity
public class Request {
    @Id @GeneratedValue
    private Long id;
    private String description;
    
    @OneToMany(mappedBy = "request")
    private List<RequestItem> items;
}
```
By defining this `@OneToMany` relationship early, the developer knows exactly how to write the `saveRequest` method to handle a list of items, rather than realizing later that the `Request` entity needs to be split into two tables.

## Common Mistake: The 'God Table'
A frequent error is creating one massive table (e.g., `ProcurementData`) containing the requester, the manager, the item, and the price. This leads to massive data redundancy and update anomalies. The correction is **Normalization**: splitting the data into logical entities and linking them via foreign keys.

## Practical Exercise
Scenario: You need to add a 'Category' (e.g., Electronics, Office Supplies) to the items in the procurement app. Should you add a `category_name` string to every `RequestItem` or create a separate `Category` table?

**Answer:** Create a separate `Category` table and link it via a foreign key to avoid typos and make it easier to rename a category across the whole system.
