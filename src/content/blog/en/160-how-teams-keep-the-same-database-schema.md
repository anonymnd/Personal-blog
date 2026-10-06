---
title: "How Teams Keep the Same Database Schema"
description: "Learn how to synchronize database structures across multiple environments using Flyway and the expand/contract pattern."
pubDate: 2026-10-13T07:48:00.000Z
translationKey: 160-how-teams-keep-the-same-database-schema
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Imagine a team of five developers. Alice adds a 'priority' column to the requests table on her laptop. When Bob pulls the code, his application crashes because his local database is missing that column. This 'schema drift' is a nightmare in professional procurement apps where a requester's submission depends on a specific table structure.

## The Versioned Migration Mechanism
To solve this, teams use tools like Flyway. Instead of sharing SQL dumps, they write versioned migration scripts (e.g., `V1__create_requests_table.sql`, `V2__add_priority_column.sql`). Flyway maintains a metadata table in the database to track which scripts have already run. When the app starts, Flyway checks the folder for new versions and executes them in order. Once a script is applied, its checksum is recorded; if you change a script that has already run, Flyway will throw an error to prevent inconsistency.

## Worked Example: Procurement Request Update
Suppose we need to change the `status` column from a simple string to a specific ID for a manager's approval workflow.

1. **V3__add_status_id.sql**: `ALTER TABLE requests ADD COLUMN status_id INT;`
2. **V4__migrate_data.sql**: `UPDATE requests SET status_id = 1 WHERE status = 'PENDING';`
3. **V5__drop_old_status.sql**: `ALTER TABLE requests DROP COLUMN status;`

Outcome: The database evolves step-by-step without losing data or breaking the application for users currently online.

## The Expand and Contract Pattern
In high-availability systems, you cannot take the app offline for a migration. The 'Expand and Contract' pattern avoids incompatible deployments. First, you **Expand** the schema (add the new column), then deploy the code that writes to both columns, and finally **Contract** the schema (remove the old column) once the old code is gone. This ensures the app never looks for a column that doesn't exist yet.

## Common Mistake: Modifying Old Scripts
Developers often try to fix a typo in `V1__init.sql` after it has been deployed to production. This causes a checksum mismatch error. 
**Correction**: Never edit a migration that has been merged. Instead, create a new version (e.g., `V6__fix_typo.sql`) to apply the correction.

## Practical Exercise
If you have `V1` and `V2` applied, and you accidentally delete `V1` from your project folder, what will Flyway do during the next startup?

**Answer**: It will likely fail or warn you because the migration history in the database no longer matches the available scripts in the classpath.
