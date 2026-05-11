---
title: "What Is a Database Index?"
description: "A beginner-friendly guide to understanding how database indexes speed up data retrieval and the trade-offs involved."
pubDate: 2026-10-12T16:48:00.000Z
translationKey: 145-what-is-a-database-index
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are looking for a specific procurement request in a physical archive of 10,000 paper folders. Without a guide, you have to check every single folder from the first to the last—this is what databases call a 'Full Table Scan'. It is slow and exhausting. A database index is like the alphabetical index at the back of a book; it tells the database exactly where the data resides so it can jump straight to the record.

## How the Mechanism Works
An index is a separate data structure (usually a B-Tree) that stores the values of a specific column and a pointer to the actual row in the table. Instead of scanning the entire table, the database searches the index, which is sorted, allowing it to find the location of the data in a fraction of the time. While it makes reading data faster, it makes writing data (INSERT, UPDATE, DELETE) slightly slower because the index must also be updated.

## Worked Example: Procurement App
Consider a `procurement_requests` table with columns `id`, `requester_name`, and `status`. If you frequently run this query:

```sql
SELECT * FROM procurement_requests WHERE requester_name = 'Alice';
```

Without an index, PostgreSQL scans every row. By creating an index:

```sql
CREATE INDEX idx_requester_name ON procurement_requests(requester_name);
```

The database now creates a sorted list of names. When searching for 'Alice', it performs a binary-style search in the index, finds the pointer, and retrieves the row instantly.

## Common Mistake: Over-Indexing
A frequent error is adding indexes to every single column to 'make everything fast'. This is counterproductive. Because every index consumes disk space and slows down write operations, too many indexes can degrade the performance of your application's data entry.

**Correction:** Only index columns that are frequently used in `WHERE` clauses, `JOIN` conditions, or `ORDER BY` statements.

## Practical Exercise
You have a table `orders` with 1 million rows. You often filter by `order_date`. Which command would you use to optimize this, and what is the trade-off?

**Answer:** Use `CREATE INDEX idx_order_date ON orders(order_date);`. The trade-off is faster SELECT queries but slightly slower INSERTs and UPDATEs for the `orders` table.

## Further reading

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
