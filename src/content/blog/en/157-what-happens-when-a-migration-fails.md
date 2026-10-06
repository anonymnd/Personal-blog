---
title: "What Happens When a Migration Fails?"
description: "Understand the consequences of a failed database migration and how to recover your schema state using Flyway."
pubDate: 2026-10-13T04:48:00.000Z
translationKey: 157-what-happens-when-a-migration-fails
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are deploying a new update to a procurement app. You've added a migration to create a `purchase_orders` table, but halfway through the script, a syntax error occurs. Suddenly, your application refuses to start, and you see a 'Migration failed' error in the logs. You might wonder: did the table get created? Is the database corrupted?

## First inspect the actual failure
Stop the release and read the failing statement, error and migration version. Compare the real schema with Flyway history instead of assuming either is unchanged. Later migrations normally cannot proceed past an unresolved failure. A startup-integrated migration failure often prevents that application instance from becoming ready, but the rest of the system is not automatically rolled back.
## Transactional and partial failures differ
For a PostgreSQL migration executed inside one transaction, ordinary transactional DDL and its history changes can roll back together. There may be no persistent failed history row, and the version can remain pending. On databases or statements that cannot participate in that transaction, earlier changes may remain and a failed entry may block progress. PostgreSQL also has nontransactional statements, such as CREATE INDEX CONCURRENTLY. Inspect the database, statements and Flyway configuration before choosing recovery steps.
## Worked example: a rejected statement
```sql
-- V2__add_orders.sql: deliberately invalid teaching example
CREATE TABLE purchase_orders (id INT PRIMARY KEY);
ALTER TABLE purchase_orders ADDD COLUMN status VARCHAR(50);
```

The second statement contains the intentional ADDD typo. In an ordinary fully transactional PostgreSQL migration, the new table is rolled back too. If this version has never succeeded in any shared environment, correct it to ADD COLUMN and rerun from the verified unchanged state. If it has succeeded elsewhere, preserve the canonical applied migration and investigate the environment or data difference rather than casually rewriting release history.
## Repair history after reconciling the schema
Flyway repair is a history-maintenance command. It can remove failed migration entries and reconcile certain history metadata; it does not undo SQL, remove leftover user tables, execute the missing statements or turn a failed script into a successful execution. Reconcile partial changes through a tested recovery procedure first. Use the same migration locations when repairing, then run migration and validation as appropriate. Do not manually falsify a history row to hide a failure or use repair to disguise an edited, already-applied migration.
## Practical exercise
A nontransactional migration created a table, then failed on a later statement. Does repair alone restore the previous schema?

**Answer:** No. Inspect and reconcile the partial schema first using the agreed recovery procedure. Repair may then remove the failed history entry so a verified migration can be run again. On a clean transactional rollback with no failed entry, that history repair may not be necessary.

## Further reading

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
