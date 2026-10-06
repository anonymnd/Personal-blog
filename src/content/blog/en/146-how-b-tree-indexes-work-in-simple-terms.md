---
title: "How B-Tree Indexes Work in Simple Terms"
description: "A beginner-friendly guide to understanding the structure and logic of B-Tree indexes for faster database queries."
pubDate: 2026-10-12T17:48:00.000Z
translationKey: 146-how-b-tree-indexes-work-in-simple-terms
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are looking for a specific purchase request in a procurement app with ten thousand entries. Without an index, the database must perform a 'Sequential Scan', reading every single row from the first to the last until it finds the right ID. This is slow and resource-heavy. A B-Tree index solves this by organizing data into a balanced tree structure that allows the database to skip the vast majority of the data.

## A balanced, multi-way structure
A B-tree is a balanced search structure with many child branches per page, rather than only the two children of a binary tree. The root directs a lookup toward internal pages and then leaf pages. Balanced depth keeps the number of levels small as the index grows. It does not guarantee identical elapsed time for every query: caching, the number of matches and fetching table rows still affect the work.
## Narrowing the range at each step
Suppose a simplified page has separator keys 25, 50 and 75. A lookup for 42 follows the branch covering values between 25 and 50. The next page repeats this narrowing until the leaf identifies matching entries. Real pages usually contain far more keys than this teaching example. Ordered keys also support range searches, such as requests numbered 40 through 60, rather than equality lookups alone.
## Worked example: a request search
Assume the requests table already exists with id and created_at columns. This illustrative index supports a date predicate:

```sql
CREATE INDEX requests_created_at_idx ON requests (created_at);

EXPLAIN
SELECT id, created_at
FROM requests
WHERE created_at >= DATE '2026-10-01';
```

Read the chosen plan rather than inventing a timing result. A selective date filter may benefit from an index; a filter matching most of a small table may be cheaper as a sequential scan. PostgreSQL considers statistics and estimated costs. Leaf entries normally identify table tuples; suitable covering queries can sometimes avoid ordinary heap fetches with an index-only scan.
## Common Mistake: Over-Indexing
A frequent error is adding indexes to every single column to 'make everything fast'. However, every time you `INSERT` or `UPDATE` a procurement request, the database must also update the B-Tree. Too many indexes slow down write operations and consume excessive disk space.

## Practical exercise
You add an index, but EXPLAIN still shows Seq Scan on a small table. Is the index necessarily broken?

**Answer:** No. The planner may estimate that reading the table directly is cheaper. Check the predicate, selectivity, statistics and representative data size before deciding an index is useful. An index is an available access path, not a command forcing every query to use it.

## Further reading

- [PostgreSQL B-tree indexes](https://www.postgresql.org/docs/current/btree.html)
