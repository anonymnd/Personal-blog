---
title: "How Flyway Migration Files Work"
description: "A deep dive into the versioning mechanism and execution flow of Flyway database migrations."
pubDate: 2026-10-13T01:48:00.000Z
translationKey: 154-how-flyway-migration-files-work
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are working in a team where one developer adds a 'status' column to the procurement requests table, but your local database doesn't have it. When you run the app, it crashes because the Java entity doesn't match the schema. This is where Flyway solves the 'it works on my machine' problem by treating database changes as versioned code.

## The Versioning Mechanism
Flyway uses a specific naming convention to track changes. A typical versioned migration file looks like `V1__Create_Request_Table.sql`. The `V` indicates it is a versioned migration, the number `1` is the version, and the double underscore `__` separates the version from the description. Flyway creates a metadata table called `flyway_schema_history` in your database. This table acts as a ledger, recording which scripts have already been executed and their checksums.

## Execution Flow and Checksums
When the application starts, Flyway scans the classpath for migration files and compares them against the `flyway_schema_history` table. If it finds a file (e.g., `V2__Add_Manager_Approval.sql`) that isn't in the table, it executes it exactly once. To ensure integrity, Flyway calculates a checksum (a unique fingerprint) of the file content. If you modify `V1` after it has already been applied to production, Flyway will detect a checksum mismatch and refuse to start, preventing inconsistent database states.

## Worked Example: Procurement App
Suppose we need to evolve our schema for a procurement system:

**V1__Initial_Setup.sql**
```sql
CREATE TABLE procurement_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester VARCHAR(100)
);
```
**V2__Add_Approval_Column.sql**
```sql
ALTER TABLE procurement_requests ADD COLUMN manager_approved BOOLEAN DEFAULT FALSE;
```
**Outcome:** Upon first run, Flyway executes V1 then V2. On the second restart, Flyway sees both are already in the history table and skips them entirely.

## Common Mistake: Modifying Old Scripts
A common error is editing `V1` to fix a typo after `V2` has been deployed. This triggers a checksum error. 
**Correction:** Never change an applied versioned migration. Instead, create a new file, `V3__Fix_Typo_In_Table.sql`, to apply the correction.

## Practical Exercise
If you have files `V1__init.sql` and `V2__update.sql` already applied, and you add `V1.5__extra.sql`, will Flyway execute it?

**Answer:** No, by default Flyway ignores migrations with a version lower than the latest applied one. Since 1.5 is less than 2, it would be ignored unless the 'outOfOrder' configuration is enabled, but usually, you should keep versions strictly increasing (e.g., V3) to avoid confusion.
