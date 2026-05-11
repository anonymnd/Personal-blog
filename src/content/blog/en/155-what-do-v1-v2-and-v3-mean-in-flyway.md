---
title: "What Do V1, V2 and V3 Mean in Flyway?"
description: "Understand the naming convention and execution logic of versioned migrations in Flyway to maintain database consistency."
pubDate: 2026-10-13T02:48:00.000Z
translationKey: 155-what-do-v1-v2-and-v3-mean-in-flyway
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You've already deployed the first version, but now you need to add a 'status' column to the `purchase_requests` table so managers can approve them. If you simply change your local schema and push it, your production database will crash because it doesn't have that column. This is where Flyway's versioning comes in.

## The Versioning Logic
In Flyway, `V1`, `V2`, and `V3` are prefixes for migration scripts. The 'V' stands for Version. Flyway uses these numbers to determine the order of execution. It tracks which scripts have already run in a special table called `flyway_schema_history`. When the app starts, Flyway scans the classpath for scripts, compares them to the history table, and executes only the new versions in ascending order.

## How Versioned Migrations Work
Versioned migrations are immutable. Once `V1__Create_Request_Table.sql` is executed on a server, you must never change its content. If you need to modify the table, you create `V2__Add_Status_Column.sql`. Flyway calculates a checksum for every file; if you modify `V1` after it has been applied, Flyway will throw a checksum mismatch error and stop the application to prevent schema drift.

## Worked Example: Procurement Workflow
Suppose we need to evolve our database schema:

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (id INT PRIMARY KEY, item VARCHAR(255));
```
`V2__add_approval_flow.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
```
`V3__add_buyer_info.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id INT;
```
**Outcome:** Flyway runs V1, then V2, then V3. If a new developer joins, their local DB will run all three in sequence to match the production state.

## Common Mistake: Editing Old Scripts
A developer realizes they forgot a column in `V1` and edits the `V1__init_schema.sql` file. 
**Correction:** Never edit a migration that has been deployed. Instead, create `V4__Add_Missing_Column.sql`. This ensures all environments migrate forward consistently.

## Practical Exercise
You have `V1` and `V2` applied. You need to add a `created_at` timestamp to your table. What should you name the file, and what happens if you name it `V1.5`?

**Answer:** Name it `V3__Add_Timestamp.sql`. Using `V1.5` is technically possible if your versioning pattern allows decimals, but it is standard practice to use integers to avoid confusion and ensure a clear linear history.
