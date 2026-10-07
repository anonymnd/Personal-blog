---
title: "Design and Read B-Tree Indexes for Real Queries"
description: "Deep dive into B-Tree mechanics, composite index ordering, and selectivity for audit-log query optimization."
pubDate: 2026-10-07T23:48:00.000Z
translationKey: 145-what-is-a-database-index
seriesOrder: 32
locale: en
tags: ["persistence","learning-series"]
draft: false
---

## The B-Tree Mechanism

A B-Tree index is not a simple binary tree. It is a multi-way balanced search tree designed to minimize disk I/O. Instead of two children per node, a B-Tree node contains multiple keys and pointers, allowing the database to navigate millions of rows in very few hops.

When you search for a value, the engine starts at the root, compares the target value against the keys in the node, and follows the pointer to the appropriate child page. This continues until it reaches a leaf node, which contains the actual pointer to the row in the table (the heap). Because the tree remains balanced, the cost of finding any single record is logarithmic and consistent.

## Selectivity and the Decision to Scan

For a particular query, selectivity concerns the estimated fraction of rows matching its predicate; the number of distinct values is one statistic that helps estimate that fraction. If most rows match, a sequential scan may be cheaper than many heap lookups. If few rows match, an index can be helpful. Neither percentage forces a plan: table size, clustering, statistics, caching and the selected columns also matter.
## Composite Indexing: The Order Problem

In a composite index (an index on multiple columns), the order of columns is critical. The index is sorted lexicographically. If you have an index on `(tenant_id, created_at)`, the data is sorted first by tenant, and within each tenant, it is sorted by time.

Consider this scenario: An audit log where we need to find logs for a specific tenant, filtered by a time range, and sorted by the newest first.

**Query:**
`SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

### Analysis of Index Options

1. **Index on `(created_at)`**: The engine can find the time range, but it must then filter every single tenant's logs for that period. High I/O.
2. **Index on `(tenant_id)`**: The engine finds all logs for 'T1', but then must sort them by time in memory (filesort) or scan them all to filter the date.
3. **Composite Index on `(tenant_id, created_at)`**: This is the optimal choice. The engine jumps directly to the 'T1' section of the index. Because the entries for 'T1' are already stored sorted by `created_at`, the engine can read the range and return the results in the requested order without a separate sorting step.

## Worked Example: EXPLAIN Plan Trace

Assume a table `audit_logs` with 1 million rows.

**Scenario A: No Index or Index on `(created_at)` only**
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **Output:** `Seq Scan on audit_logs  (cost=0.00..25000.00 rows=5000 width=120) -> Filter: (tenant_id = 'T1' AND created_at > '2023-01-01') -> Sort: created_at DESC`
*   **Meaning:** The DB read the whole table and sorted the results in RAM. This is slow and memory-intensive.

**Scenario B: Composite Index on `(tenant_id, created_at)`**
`CREATE INDEX idx_tenant_time ON audit_logs (tenant_id, created_at);`
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **Output:** `Index Scan using idx_tenant_time on audit_logs (cost=0.42..800.00 rows=5000 width=120) -> Index Cond: (tenant_id = 'T1' AND created_at > '2023-01-01')`
*   **Meaning:** The DB used the B-Tree to jump to 'T1', scanned the sorted time range, and avoided the Sort operation entirely.

## Write Cost and Trade-offs

Indexes are not free. Every `INSERT`, `UPDATE`, or `DELETE` on the `audit_logs` table requires the database to update the B-Tree. This involves finding the correct leaf node and potentially splitting nodes to maintain balance. In a high-write audit log, too many indexes will degrade ingestion performance.

## Exercise

For an index on (status, user_id), equality predicates on both columns allow a focused lookup regardless of the textual order of WHERE conditions. The planner can still choose another plan. A user_id-only predicate lacks the leading equality condition; it may need a broader index or table scan. PostgreSQL 18 can also consider B-tree skip scans when the leading column has sufficiently few distinct values. Verify your version and EXPLAIN output rather than asserting the index can never help.

The plans shown above are schematic illustrations, not measured benchmarks or guaranteed EXPLAIN output. Sorts can spill to disk, and index scans can run backward for descending order. Updates to unindexed columns may sometimes use PostgreSQL HOT updates without updating every index. Measure read benefit and write cost with representative data.

## Further reading

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL B-tree indexes](https://www.postgresql.org/docs/current/btree.html)
