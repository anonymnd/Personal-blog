---
title: "Why Hibernate Should Not Manage Your Production Schema"
description: "Learn why relying on hbm2ddl.auto in production is risky and how to transition to versioned migrations with Flyway."
pubDate: 2026-10-12T23:48:00.000Z
translationKey: 152-why-hibernate-should-not-manage-your-production-schema
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine deploying a new version of your procurement app. You added a 'priority' column to the `PurchaseRequest` entity. You restart the server, and suddenly, the application crashes or, worse, wipes out a table because of a mapping mismatch. This happens when developers rely on Hibernate's `ddl-auto` property to handle schema changes in production.

## The Danger of ddl-auto

Hibernate provides `hibernate.hbm2ddl.auto` with options like `update` or `create-drop`. While `update` seems convenient, it is non-deterministic. It attempts to guess the changes needed based on your Java entities. In a production environment, this lacks auditability. You cannot see exactly what SQL was executed, and you cannot easily roll back a change if the automatic update fails or alters data unexpectedly.

## Moving to Versioned Migrations

Instead of letting the ORM guess, use a tool like Flyway. Flyway uses versioned SQL scripts (e.g., `V1__init.sql`, `V2__add_priority.sql`) that run in a strict order. Each script is recorded in a metadata table with a checksum. If a script is modified after being applied, Flyway will throw an error, ensuring that every environment—from development to production—is identical.

## Worked Example: Adding a Column

Suppose your procurement app needs to track who approved a request. Instead of letting Hibernate `update` the table, you create a migration file:

```sql
-- V3__add_approver_to_request.sql
ALTER TABLE purchase_request ADD COLUMN approved_by VARCHAR(255);
```

When the app starts, Flyway checks the schema table, sees that version 3 hasn't been applied, and executes the SQL. The outcome is a predictable, traceable change. To keep Hibernate from interfering, set `hibernate.hbm2ddl.auto=validate`. This ensures the Java entities match the actual DB schema without attempting to change it.

## Common Mistake: Modifying Old Scripts

A common error is editing `V1__init.sql` to add a column after the script has already run on production. Flyway will detect a checksum mismatch and prevent the app from starting. 

**Correction:** Never edit an applied migration. Always create a new versioned file (e.g., `V4__fix_column.sql`) to apply the change.

## Practical Exercise

If you want to ensure your production database matches your entities without allowing Hibernate to modify the tables, which `ddl-auto` value should you use?

**Answer:** `validate`.
