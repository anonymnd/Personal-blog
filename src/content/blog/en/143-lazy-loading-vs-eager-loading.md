---
title: "Fetch Related Data Without Creating an N+1 Query Problem"
description: "A technical guide to optimizing data retrieval using fetch plans and entity graphs to avoid redundant database round-trips."
pubDate: 2026-10-07T22:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
seriesOrder: 31
locale: en
tags: ["persistence","learning-series"]
draft: false
---

## The N+1 Mechanism

The N+1 query problem occurs when an application executes one query to fetch a parent entity and then executes N additional queries to fetch related entities for each parent. This typically happens due to `FetchType.LAZY` (the default for `@OneToMany`) or when `FetchType.EAGER` (the default for `@ManyToOne`) is used in a way that triggers individual selects during iteration.

Consider a support ticket system. We have a `Ticket` entity and a `User` entity (the owner). If we fetch 10 tickets and then access the owner of each ticket in a loop, Hibernate may execute 1 query for the tickets and 10 separate queries for the users.

## Worked Example: Support Ticket Retrieval

### The Entities

```java
@Entity
public class Ticket {
    @Id
    @GeneratedValue
    private Long id;
    private String subject;

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;

    // Getters, Constructor
}

@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;

    // Getters, Constructor
}
```

### Scenario A: The N+1 Failure

When using a standard `findAll()` or a basic JPQL `SELECT t FROM Ticket t`, the following happens:

1. `SELECT * FROM ticket;` → Returns 10 rows.
2. For each ticket, the code calls `ticket.getOwner().getUsername()`.
3. Hibernate detects the `User` proxy is uninitialized and triggers: `SELECT * FROM user WHERE id = ?;` (Repeated 10 times).

**Total Queries: 11**

### Scenario B: The Optimized Fetch Plan

To solve this, we move the fetch strategy from the entity mapping (which is static) to the query (which is dynamic). We use a `JOIN FETCH` in JPQL or a Named Entity Graph.

```java
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT t FROM Ticket t JOIN FETCH t.owner")
    List<Ticket> findAllWithOwner();
}
```

**Execution Trace:**
1. `SELECT t.*, u.* FROM ticket t INNER JOIN user u ON t.owner_id = u.id;` → Returns all data in one result set.

**Total Queries: 1**

## Pagination and Row Multiplication

While `JOIN FETCH` solves the N+1 problem, it introduces a risk when dealing with `@OneToMany` collections (e.g., `Ticket` → `Comment`).

If you join-fetch a collection, the database returns a Cartesian product. If a ticket has 5 comments, the result set contains 5 rows for that one ticket. If you apply `Pageable` to this query, Hibernate cannot safely limit the rows at the database level because it would truncate the collection. Instead, Hibernate fetches **all** rows into memory and performs pagination in Java, which can lead to an `OutOfMemoryError` on large datasets.

**Solution for Collections:** Use a two-step fetch. Fetch the IDs of the parents first with pagination, then fetch the parents and their collections using an `IN` clause or a separate query with a batch size configuration.

## Summary Comparison

| Strategy | Query Count | Memory Impact | Best Use Case |
| :--- | :--- | :--- | :--- |
| Lazy Loading | 1 + N | Low | Single entity lookup |
| Eager Mapping | 1 + N (often) | High | Always needed relations |
| Join Fetch | 1 | Medium | Specific reports/pages |
| Entity Graph | 1 | Medium | Dynamic fetch requirements |

## Exercise

**Question:** You have a `User` entity with a `@OneToMany` relationship to `Order`. You need to display a paginated list of 20 users and their orders. Why is `@Query("SELECT u FROM User u JOIN FETCH u.orders")` with a `Pageable` parameter dangerous, and what is the correct approach?

**Answer:** It is dangerous because the join creates duplicate user rows for every order, forcing Hibernate to perform pagination in memory (HHH000104 warning). The correct approach is to fetch the paginated list of `User` IDs first, then execute a second query using `WHERE u.id IN :ids` with a `JOIN FETCH` to retrieve the orders for those specific 20 users.

The 11-query trace assumes ten distinct uncached owners and an active persistence context while accessing them. Shared or already loaded owners can reduce the count. EAGER requires availability, not a particular JOIN or universal N+1. An entity graph expresses fetch requirements without universally promising one SQL query. Use LEFT JOIN FETCH if tickets without owners must remain in the result. Collection-fetch pagination can warn, paginate in memory or fail under configuration; preserve page ordering in the two-step strategy and test the actual SQL.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
