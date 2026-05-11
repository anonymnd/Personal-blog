---
title: "I Finally Understand What a Database Migration Is"
description: "A conceptual guide to understanding how database migrations manage schema evolution without losing data."
pubDate: 2026-10-17T22:48:00.000Z
translationKey: 271-i-finally-understand-what-a-database-migration-is
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement app where employees submit requests. Initially, your `PurchaseRequest` table only has a `description` and `amount`. A month later, your manager insists that every request must have a `department_id` to track budgets. If you simply change your Java entity and restart the app, the database will crash because the actual SQL table is missing that column. This is the gap where database migrations live.

## The Versioning Concept
I used to think migrations were just 'updating the database'. I now realize they are version control for your schema. Instead of sharing a giant `.sql` dump file with teammates, you share a series of small, numbered scripts. Each script represents a transition from version A to version B. The database keeps a special metadata table (like `flyway_schema_version`) to track which scripts have already run, ensuring no script is executed twice.

## How the Mechanism Works
When the application starts, the migration tool scans a specific folder for scripts. It compares the files found (e.g., `V1__init.sql`, `V2__add_dept.sql`) against the metadata table. If the table says the DB is at version 1, but the code has version 2, the tool executes the `V2` script automatically before the application fully boots up.

## Worked Example: Adding Department Tracking
Suppose we need to add the `department_id` to our procurement table. We create a migration file:

```sql
-- V2__Add_Department_To_Requests.sql
ALTER TABLE purchase_requests 
ADD COLUMN department_id BIGINT NOT NULL DEFAULT 1;
```
Outcome: Every existing request is assigned to department 1, and new requests now require a department ID. The app starts successfully because the Java entity and the SQL table are now in sync.

## Common Mistake: Modifying Old Scripts
A frequent error is editing `V1__init.sql` after it has already been deployed to production. Since the migration tool sees that `V1` was already executed, it ignores the changes. To fix this, you must never edit a migration that has been shared; instead, create a new file, `V3__Fix_Init_Table.sql`, to apply the correction.

## Practical Exercise
Scenario: You need to rename the column `amount` to `total_price` in the `purchase_requests` table. What is the correct approach?

**Answer:** Create a new migration file (e.g., `V4__Rename_Amount.sql`) containing `ALTER TABLE purchase_requests RENAME COLUMN amount TO total_price;` rather than editing the original creation script.
