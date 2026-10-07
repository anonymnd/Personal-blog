---
title: "Evolve a Production Schema with Flyway Instead of Guesswork"
description: "Master versioned database migrations, the expand-contract pattern for zero-downtime updates, and recovery from failed DDL scripts."
pubDate: 2026-10-08T02:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
seriesOrder: 35
locale: en
tags: ["schema-migrations","learning-series"]
draft: false
---

## The Danger of Automated Schema Management

In early development, `spring.jpa.hibernate.ddl-auto=update` feels like magic. It alters tables to match your Java entities automatically. However, in production, this is a liability. Hibernate's `update` is a best-effort guess; it cannot handle complex renames, data migrations, or precise constraint changes. If it fails, it often leaves the schema in an indeterminate state with no audit trail.

Switching to `ddl-auto=validate` is the first step toward production stability. In this mode, Hibernate does not change the database; it simply verifies that the existing schema matches the entity mappings. If a column is missing or a type is mismatched, the application fails to start. This ensures that the application never runs against an incompatible database version.

## How Flyway Ensures Consistency

Flyway replaces guesswork with a versioned history table (`flyway_schema_history`). Instead of letting a framework guess the state, you provide explicit SQL scripts. 

### The Versioning Mechanism
Flyway identifies migrations by a naming convention: `V<Version>__<Description>.sql` (e.g., `V1__Create_user_table.sql`). 
1. **Execution**: Flyway scans the classpath for scripts and compares them against the history table.
2. **Checksums**: When a script is applied, Flyway stores a checksum (a hash of the file content). 
3. **Immutability**: Once `V1` is applied to production, it must never be edited. If you change a single character in `V1__Create_user_table.sql` after it has run, Flyway will detect a checksum mismatch on the next startup and refuse to boot. To change the schema, you must create `V2`.

## Scenario: Adding a Required `displayName`

Adding a required column to populated users fails if existing rows lack values. Expand the schema with a nullable display_name column, then deploy application code that supplies it for every new row and supports old rows. While older writers remain active, they may still insert null, so a one-time backfill is not enough.

Retire or adapt all old writers before the final invariant. Backfill existing rows with a domain-approved value, account for username nullability and length, then verify no null remains. On large tables use monitored, restartable batches rather than assuming one huge UPDATE is harmless. Finally enforce NOT NULL when the application versions still running are compatible.

```sql
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
-- Backfill only after writers reliably populate the new field.
UPDATE users SET display_name = username WHERE display_name IS NULL;
-- Later, after compatibility and null checks:
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
```

These statements belong to deliberately separated migration/deployment stages; their separation alone does not ensure compatibility. PostgreSQL can roll back ordinary transactional DDL and the backfill together if one migration fails, so combining statements does not inherently leave a partial schema. The reason to stage the rollout is application compatibility and operational control. Some operations and databases have different transaction behavior.
## Failure Recovery and Transactional DDL

When a migration fails, the behavior depends on the database engine.

- **PostgreSQL**: Most DDL (Data Definition Language) is transactional. If `V3` fails halfway through, the entire transaction rolls back, and the history table remains at `V2`. You fix the script and restart.
- **MySQL/Oracle**: DDL often triggers an implicit commit. If a script contains three `ALTER TABLE` statements and the third one fails, the first two remain applied. 

### The `repair` Limitation
When a migration fails in a non-transactional DB, Flyway marks that version as `failed` in the history table. The application will not start until this is resolved. 

Developers often mistake `flyway repair` for a magic undo button. **`flyway repair` does not roll back SQL changes.** It only cleans up the `flyway_schema_history` table by removing failed entries or aligning checksums. If your failed script partially added a column, you must manually drop that column via SQL before running `repair` and restarting the app.

## Exercise

For total_amount → grand_total, add the new nullable column first. Deploy compatible application code that keeps both values synchronized during coexistence, then retire old writers or provide a tested synchronization mechanism. Backfill, reconcile and verify the values. Switch reads to grand_total and stop depending on total_amount only when every active writer and rollback version is compatible. Drop the old column in a later reviewed migration.

Changing application code is a deployment step, not a SQL migration named Update_app. Do not drop a partially created column blindly after migration failure: inspect actual state and choose a reviewed recovery that preserves data. Flyway repair adjusts history, not the database. ddl-auto=validate is useful but does not prove every constraint, index or business invariant is correct. Applied migrations should remain unchanged; add a new migration for evolution rather than relying on checksum details of individual characters.

## Further reading

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
