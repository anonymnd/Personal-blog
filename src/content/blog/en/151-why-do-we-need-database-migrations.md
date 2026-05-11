---
title: "Why Do We Need Database Migrations?"
description: "An exploration of how database migrations solve the chaos of manual schema updates in collaborative software development."
pubDate: 2026-10-12T22:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are working on a procurement app. You add a `priority` column to the `PurchaseRequest` table on your local machine. Everything works. You push the code to your teammate, but their app crashes because their local database is missing that column. This 'it works on my machine' syndrome is exactly why we need database migrations.

## The Problem with Manual Updates
When developers manually run SQL scripts to update schemas, things break. Someone forgets to run a script, or two people modify the same table differently. Relying on `hibernate.hbm2ddl.auto=update` is risky for production because it can't handle complex changes like renaming columns or migrating data without risking data loss. It only checks if the mapping matches the schema, not if the transition was safe.

## Version Control for Your Schema
Database migrations treat your schema as code. Tools like Flyway use versioned scripts (e.g., `V1__Create_Request_Table.sql`, `V2__Add_Priority_To_Request.sql`). These scripts are stored in your Git repository. When the application starts, the migration tool checks a metadata table in the database to see which versions have already been applied. It then executes only the new scripts in strict sequential order.

## Worked Example: Adding Approval Logic
Suppose we need to track who approved a procurement request. Instead of manually altering the DB, we create a new migration file:

```sql
-- V3__Add_Approver_To_Request.sql
ALTER TABLE purchase_requests 
ADD COLUMN approved_by VARCHAR(255);
```

When this code is deployed to the staging server, Flyway sees that `V1` and `V2` are already done, so it only runs `V3`. The outcome is a consistent schema across all environments without manual intervention.

## Common Mistake: Modifying Old Migrations
A frequent error is editing `V1__Create_Table.sql` after it has already been deployed to production. Migration tools use checksums to ensure scripts haven't changed. If you modify an old file, the tool will detect a checksum mismatch and refuse to start the app to prevent inconsistency.

**Correction:** Never edit a migration that has been merged. Instead, create a new version (e.g., `V4`) to apply the necessary fix.

## Practical Exercise
If you need to change a column name from `req_date` to `request_date` in a production system without downtime, should you edit the original creation script?

**Answer:** No. You must create a new versioned migration script to rename the column to ensure all environments stay synchronized.
