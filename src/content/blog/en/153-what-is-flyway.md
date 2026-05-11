---
title: "What Is Flyway?"
description: "A comprehensive guide to understanding database version control and migration management using Flyway."
pubDate: 2026-10-13T00:48:00.000Z
translationKey: 153-what-is-flyway
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are working in a team on a procurement app. You add a 'status' column to the `purchase_requests` table on your local machine. When your colleague pulls the code, their application crashes because their local database is missing that column. Manually sharing SQL scripts via chat or email is chaotic and prone to errors. This is where Flyway solves the problem by treating database changes like version-controlled source code.

## The Mechanism of Versioning
Flyway manages migrations using a special table called `flyway_schema_history`. Instead of one giant SQL file, you create small, numbered scripts (e.g., `V1__Create_Request_Table.sql`, `V2__Add_Status_Column.sql`). When the application starts, Flyway scans the migration folder and compares it with the history table. It executes only the scripts that haven't been run yet, ensuring every environment—development, staging, and production—is perfectly synchronized.

## Worked Example: Procurement Workflow
Suppose we need to evolve our schema to support manager approvals. We create two migration files:

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT
);
```

`V2__add_approval_column.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN manager_approval BOOLEAN DEFAULT FALSE;
```

**Outcome:** Flyway runs V1 first, then V2. If you deploy this to a server that already has V1, Flyway sees the checksum in the history table and only executes V2.

## Common Mistake: Modifying Old Scripts
A frequent error is editing `V1__init_schema.sql` after it has already been deployed to production. Flyway calculates a checksum for every file. If you change a single character in a previously applied script, Flyway will detect a checksum mismatch and refuse to start the application to prevent schema inconsistency.

**Correction:** Never edit a versioned migration that has been deployed. Instead, create a new version (e.g., `V3__Fix_Column_Name.sql`) to apply the necessary change.

## Expand and Contract Pattern
To avoid downtime during deployments, use the 'expand and contract' approach. Instead of renaming a column (which breaks the running app), first add the new column (expand), migrate the data, and only then remove the old column in a subsequent release (contract).

## Practical Exercise
**Scenario:** You need to add a `buyer_id` column to the `purchase_requests` table. What should the filename be if the last migration was `V5`?

**Answer:** `V6__Add_Buyer_Id_To_Requests.sql` (or any name starting with `V6__`).
