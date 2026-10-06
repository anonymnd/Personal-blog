---
title: "How to Convert an MCD Into SQL Tables"
description: "Learn the systematic process of transforming a Merise Conceptual Data Model (MCD) into a relational SQL schema."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 043-how-to-convert-an-mcd-into-sql-tables
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many beginners struggle when moving from a conceptual diagram (MCD) to actual SQL tables. They often treat every bubble as a table and every line as a simple column, which leads to data redundancy or lost relationships, especially when dealing with many-to-many cardinalities.

## Understanding the Transformation Logic
To convert an MCD, you must follow specific transformation rules based on the cardinalities. An entity always becomes a table. A relationship, however, depends on its constraints. If the relationship is 1:N (one-to-many), the primary key of the '1' side migrates as a foreign key to the 'N' side. If it is N:N (many-to-many), the relationship itself becomes a new 'join table'.

## The Procurement App Example
Imagine a procurement system where a **Requester** submits a **Request**. One Requester can make many Requests, but one Request belongs to only one Requester (1:N). Additionally, a Request can contain many **Products**, and a Product can appear in many Requests (N:N).

1. **Requester** (Entity) $ightarrow$ Table `requesters` (id, name)
2. **Request** (Entity) $ightarrow$ Table `requests` (id, date, requester_id)
3. **Product** (Entity) $ightarrow$ Table `products` (id, label, price)
4. **Contains** (N:N Relationship) $ightarrow$ Table `request_items` (request_id, product_id, quantity)

## SQL Implementation Excerpt
```sql
CREATE TABLE requesters (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE requests (
    id INT PRIMARY KEY,
    request_date DATE,
    requester_id INT,
    FOREIGN KEY (requester_id) REFERENCES requesters(id)
);

CREATE TABLE request_items (
    request_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (request_id, product_id),
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Common Mistake: Relationship Attributes
A frequent error is trying to put a 'quantity' column inside the `products` table or the `requests` table. Since quantity depends on both the specific request and the specific product, it must reside in the join table (`request_items`). Placing it elsewhere causes data duplication.

## Practical Exercise
**Scenario:** A Manager approves a Request. One Manager approves many Requests, but a Request is approved by only one Manager. How do you model this in SQL?

**Check:** Add a `manager_id` foreign key to the `requests` table referencing a new `managers` table.
