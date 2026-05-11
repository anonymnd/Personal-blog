---
title: "Why Database Design Should Happen Before Building Too Many Features"
description: "Learn why prioritizing a solid data model over rapid feature development prevents costly architectural rework."
pubDate: 2026-10-08T02:48:00.000Z
translationKey: 035-why-database-design-should-happen-before-building-too-many-features
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You start by coding a 'Request' feature where a user submits a need. It works great. Then, you add a 'Manager Approval' feature. Suddenly, you realize a request might need multiple approvals from different departments. Because you didn't design the database first, you have a single `manager_id` column in your table. Now, you must rewrite your entire data layer and migrate live data just to support a basic business rule.

## The Cost of Retrofitting Data
When features drive the database, you often end up with 'flat' tables that cannot handle complexity. In the Merise methodology, we use a Conceptual Data Model (MCD) to define entities and relationships before touching code. If you skip this, you miss critical constraints like cardinality. For example, if a Buyer can handle many Orders, but an Order belongs to only one Buyer, that 1:N relationship must be locked in early. Changing a 1:1 to a 1:N later requires creating new join tables and updating every single query in your application.

## Handling Complex Relationships
Many beginners forget that relationships can have their own attributes. If you need to track *when* a Manager approved a Request, you cannot put that date in the Request table (which is the object being approved) or the Manager table (who approves many things). You need a join entity. 

```sql
-- Illustrative excerpt: Join entity for approvals
CREATE TABLE request_approval (
    request_id INT,
    manager_id INT,
    approval_date DATE,
    status VARCHAR(20),
    PRIMARY KEY (request_id, manager_id)
);
```

## Common Mistake: The 'God Table'
A frequent error is creating one massive table to avoid joins. For instance, putting User details and Organization details in one `users` table. This fails when a user joins multiple organizations. The correction is a Membership model: separate `User` and `Organization` entities connected by a `Membership` table.

## Practical Exercise
Scenario: Your procurement app now needs to allow a single Request to contain multiple different Items. 

Question: If your current `requests` table has a `product_id` column, why is this a design flaw, and what is the fix?

Answer: It limits each request to one item, even though several requests may refer to that item. The fix is to remove `product_id` from `requests` and create a new `request_items` table to handle the 1:N relationship.
