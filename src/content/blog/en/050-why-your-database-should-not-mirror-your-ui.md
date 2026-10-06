---
title: "Why Your Database Should Not Mirror Your UI"
description: "Learn why designing your database based on screen layouts leads to rigid systems and how to decouple data models from user interfaces."
pubDate: 2026-10-08T17:48:00.000Z
translationKey: 050-why-your-database-should-not-mirror-your-ui
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are building a procurement app. Your UI has a 'Request Form' where a requester enters their name, department, and a list of items. A beginner's instinct is to create a single `Request` table with columns like `requester_name` and `department_name`. This is a dangerous trap: you are mirroring the UI layout in your database schema.

## Separate presentation changes from business changes
Reordering form fields, adding a dashboard or changing a filter should usually change presentation or queries, rather than the stored domain model. A new business rule can legitimately require a schema change: allowing several requesters per request changes a relationship, even if it first appears as a new form field. The goal is to model durable facts and rules, not to promise that a database will never change.
## Conceptual vs. Physical Layout
In the Merise methodology, we distinguish between the Conceptual Data Model (MCD) and the Physical Model. The MCD focuses on business rules, not screens. For instance, a 'Requester' is an entity, and a 'Department' is another. The relationship between them is a business rule (a requester belongs to one department), regardless of whether they appear on the same screen.

## Worked Example: Procurement Requests
Instead of one flat table, we use normalization. 

**Wrong (UI Mirror):**
`Requests` table: `id`, `item_name`, `requester_name`, `dept_name`.

**Right (Normalized):**
- `User` table: `id`, `full_name`
- `Department` table: `id`, `dept_name`
- `Request` table: `id`, `user_id` (FK), `dept_id` (FK), `date`
- `RequestItem` table: `id`, `request_id` (FK), `product_name`, `quantity`

By separating these, if the UI changes to a dashboard showing all requests per department, the database doesn't need to change; you simply write a different SQL JOIN.

## Common mistake: storing a name only because it is displayed
For current employee details, store a manager identifier and let the backend retrieve the name, then expose it through a response DTO. The browser displays that response; it should not query database tables directly. Deliberate historical snapshots are different: an invoice may retain the supplier name as it was when issued. Decide whether a field represents current master data or an immutable historical fact before choosing normalization or a snapshot.
## Practical Exercise
Scenario: Your UI has a 'Project' page that shows a list of 'Tasks' and the 'Employee' assigned to each. 

Question: Should you add `employee_name` to the `Tasks` table?

**Answer:** No. Add `employee_id` as a foreign key. The name belongs in the `Employee` table to avoid redundancy and update anomalies.
