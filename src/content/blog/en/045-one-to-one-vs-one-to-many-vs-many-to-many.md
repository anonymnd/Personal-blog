---
title: "One-to-One vs One-to-Many vs Many-to-Many"
description: "A guide to choosing the correct relationship cardinality in database design to ensure data integrity."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 045-one-to-one-vs-one-to-many-vs-many-to-many
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. You have users, purchase requests, and suppliers. If you accidentally link a request to multiple managers for a single approval step, or allow a user to have ten different profiles, your data becomes inconsistent. The struggle isn't writing the SQL, but deciding how entities relate based on business rules.

## One-to-One (1:1)
This occurs when one record in Table A relates to exactly one record in Table B. It is often used for security or splitting a table with too many columns. In our procurement app, a `User` might have one `UserConfiguration` (containing specific UI preferences). 

## One-to-Many (1:N)
This is the most common relationship. One record in Table A can relate to multiple records in Table B, but Table B relates back to only one in Table A. For example, one `Manager` can approve many `PurchaseRequests`, but each `PurchaseRequest` is assigned to only one specific `Manager` for approval.

## Many-to-Many (M:N)
This happens when multiple records in Table A relate to multiple records in Table B. You cannot implement this directly with a simple foreign key. You need a 'Join Table'. For instance, a `PurchaseRequest` can contain many `Products`, and a `Product` can appear in many different `PurchaseRequests`.

## Worked Example: Procurement Logic

| Relationship | Entities | Cardinality | Implementation |
| :--- | :--- | :--- | :--- |
| User → Profile | 1:1 | One-to-One | FK in Profile table |
| Manager → Request | 1:N | One-to-Many | FK in Request table |
| Request → Product | M:N | Many-to-Many | Join Table `request_items` |

```sql
-- Many-to-Many Join Table Example
CREATE TABLE request_items (
    request_id INT REFERENCES purchase_requests(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    PRIMARY KEY (request_id, product_id)
);
```

## Common Mistake: Forgetting the Join Table
A frequent error is trying to put a `product_id` column directly inside the `purchase_requests` table for a many-to-many relationship. This limits a request to only one product. The correction is to move that relationship to a separate join entity that tracks each item individually.

## Practical Exercise
Scenario: A `Buyer` can manage multiple `Suppliers`, but each `Supplier` is assigned to only one `Buyer`. What is the cardinality?

**Answer:** One-to-Many (1:N) from Buyer to Supplier.
