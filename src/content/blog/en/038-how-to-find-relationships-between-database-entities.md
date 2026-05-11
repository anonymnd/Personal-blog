---
title: "How to Find Relationships Between Database Entities"
description: "Learn how to identify and define the connections between data entities using business rules and cardinality."
pubDate: 2026-10-08T05:48:00.000Z
translationKey: 038-how-to-find-relationships-between-database-entities
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are building a procurement app. You have a list of 'Employees' and a list of 'Purchase Requests', but you are stuck: how do you logically link them so the system knows who asked for what? This is the core challenge of database modeling—translating real-world business rules into technical relationships.

## Identifying the Business Rule
The first step is to ignore the database and look at the business process. Ask yourself: "What is the action connecting these two things?" In our procurement app, an Employee *submits* a Request. The verb 'submits' is the relationship. You must define the direction and the constraints. Does every request need an employee? Yes. Can an employee submit multiple requests? Yes.

## Understanding Cardinality
Cardinality defines the numerical constraints of the relationship. We usually look at the minimum and maximum occurrences:
- **One-to-Many (1:N):** One Employee can have many Requests, but one Request belongs to only one Employee. This is the most common relationship.
- **Many-to-Many (M:N):** One Request might require approval from many Managers, and one Manager approves many Requests. 
- **One-to-One (1:1):** One Employee has exactly one User Account.

## The Role of the Join Entity
When you encounter a Many-to-Many relationship, you cannot link the tables directly in a relational database. You need a 'Join Entity' (or associative table). For example, to link `Request` and `Approver`, you create a table `Request_Approval`. This table stores the IDs of both entities and can hold extra data, like the `approval_date` or `status`.

## Worked Example: Procurement Workflow
Let's model the link between `Employee` and `PurchaseRequest`:
- **Entity A:** `Employee` (id, name)
- **Entity B:** `PurchaseRequest` (id, item, amount)
- **Relationship:** One-to-Many. We place the `employee_id` as a Foreign Key inside the `PurchaseRequest` table.

**Outcome:** Querying `SELECT * FROM PurchaseRequest WHERE employee_id = 101` returns all requests made by that specific person.

## Common Mistake: Over-linking
A frequent error is creating a Many-to-Many relationship when a One-to-Many suffices. For instance, creating a join table for `Employee` and `Department` when an employee can only belong to one department. This adds unnecessary complexity and slows down queries. Always verify if the 'Many' side is truly required on both ends.

## Practical Exercise
**Scenario:** A `Buyer` places an `Order`, and an `Order` can contain multiple `Products`. A `Product` can appear in many different `Orders`.
**Question:** What type of relationship exists between `Order` and `Product`, and what is required to implement it?

**Answer:** It is a Many-to-Many (M:N) relationship. You need a join entity (e.g., `Order_Item`) to link them.
