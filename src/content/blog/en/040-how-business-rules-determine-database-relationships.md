---
title: "How Business Rules Determine Database Relationships"
description: "Learn how to translate real-world organizational constraints into precise database cardinalities and relationship types."
pubDate: 2026-10-08T07:48:00.000Z
translationKey: 040-how-business-rules-determine-database-relationships
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are designing a procurement system. You know you need 'Employees' and 'Purchase Requests', but you are stuck: should one employee have one request, or many? This is where most beginners struggle; they try to guess the database structure before understanding the business rules. In database design, the business rule is the law that dictates the cardinality.

## From Business Rule to Cardinality

A business rule is a specific constraint on how data interacts. For example, 'A requester can submit multiple purchase requests, but each request belongs to exactly one requester.' This rule defines a One-to-Many (1:N) relationship. If the rule changed to 'A request can be co-signed by multiple employees,' it would immediately become a Many-to-Many (M:N) relationship.

## Handling Optionality

Not every relationship is mandatory. Consider the 'Manager' role in our procurement app. While every request must have a requester, not every request has been assigned a manager for approval yet. This is 'optionality'. In your model, this means the foreign key for the manager can be null, whereas the requester ID must be NOT NULL.

## The Need for Join Entities

When you encounter a Many-to-Many relationship, such as 'Buyers' and 'Suppliers' (where one buyer works with many suppliers and one supplier serves many buyers), you cannot simply put a foreign key in one table. You need a join entity. This intermediate table not only links the two but can store relationship-specific data, like the 'Contract Date' of that specific partnership.

## Worked Example: Procurement Workflow

Rule: *A Request is submitted by one Employee and approved by one Manager.*

| Entity | Relationship | Cardinality | Rule Logic |
| :--- | :--- | :--- | :--- |
| Employee → Request | Submits | 1:N | One employee, many requests |
| Manager → Request | Approves | 1:N | One manager, many approvals |

```sql
-- Illustrative excerpt of the Request table
CREATE TABLE purchase_requests (
    request_id INT PRIMARY KEY,
    description VARCHAR(255),
    requester_id INT NOT NULL, -- Mandatory
    manager_id INT, -- Optional until approved
    FOREIGN KEY (requester_id) REFERENCES employees(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
```

## Common Mistake: Over-generalizing

A common error is making every relationship Many-to-Many 'just in case' the business changes. This adds unnecessary complexity and slows down queries. Always model the current business rule strictly; you can migrate the schema later if the rule actually evolves.

## Practical Exercise

Rule: 'A Purchase Request can contain multiple Products, and a Product can appear in many different Requests.' What relationship type is this, and what is required to implement it?

**Answer:** This is a Many-to-Many (M:N) relationship. It requires a join entity (e.g., `request_items`) to link `request_id` and `product_id`.
