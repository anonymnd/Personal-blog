---
title: "How Database Schema Changes Reach Production"
description: "A guide to managing database evolutions using versioned migrations and the expand/contract pattern to avoid downtime."
pubDate: 2026-10-13T03:48:00.000Z
translationKey: 156-how-database-schema-changes-reach-production
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are updating a procurement app. You need to rename the `request_status` column to `approval_state` in the `PurchaseRequests` table. If you simply rename the column and deploy the code, the old version of the app still running during the deployment will crash because it expects the old name, while the new version expects the new one. This is the core challenge of database migrations.

## The Versioned Migration Mechanism
To solve this, tools like Flyway use versioned migrations. Instead of manually running SQL scripts, you create files named `V1__init.sql`, `V2__add_column.sql`, etc. Flyway maintains a `schema_version` table in your database. When the app starts, Flyway checks which scripts have already been executed by comparing the files to the table. If `V2` is missing, it runs it once. It uses checksums to ensure that once a migration is applied, its content is never changed; if you need a fix, you must create `V3`.

## The Expand and Contract Pattern
To avoid downtime, we use the 'Expand and Contract' pattern. Instead of one destructive change, we use three steps:
1. **Expand**: Add the new column `approval_state` but keep `request_status`. The app writes to both.
2. **Migrate**: Move existing data from the old column to the new one.
3. **Contract**: Once all app instances are updated and the old column is unused, delete `request_status`.

## Worked Example: Adding a Buyer ID
Suppose we need to link a `PurchaseRequest` to a specific `Buyer`.

**Migration V3__add_buyer_id.sql**:
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id BIGINT;
-- Note: We leave it nullable first to avoid locking the table
```
**Outcome**: The database now supports the new field without breaking existing requests. The application code is then updated to handle the `buyer_id` logic.

## Common Mistake: Modifying Old Migrations
Developers often try to edit `V1__init.sql` to fix a typo after it has been deployed to production. This causes a checksum mismatch error, and Flyway will refuse to start the application. 
**Correction**: Always create a new versioned script (e.g., `V4__fix_typo.sql`) to apply changes to an existing schema.

## Practical Exercise
You have a table `orders` and want to change a `VARCHAR` column to `TEXT`. Using the expand/contract pattern, what is the first SQL action you should take?

**Answer**: Add a new column with the `TEXT` type (Expand) rather than altering the existing column directly.
