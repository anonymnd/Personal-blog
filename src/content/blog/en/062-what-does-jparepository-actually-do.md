---
title: "Follow a JPA Entity from Java State to SQL"
description: "A deep dive into the Hibernate persistence lifecycle, entity states, and the mechanics of how Java objects become database rows."
pubDate: 2026-10-07T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
seriesOrder: 14
locale: en
tags: ["spring-architecture","learning-series"]
draft: false
---

## The Architecture of Persistence

To understand how a Java object becomes a database row, we must distinguish between three distinct layers: **JPA** (the specification/interface), **Hibernate** (the implementation/engine), and the **Database** (the storage, e.g., PostgreSQL).

When you use a `JpaRepository`, you are interacting with a Spring Data abstraction that delegates to the JPA `EntityManager`. The `EntityManager` manages a **Persistence Context**—essentially a first-level cache that tracks every entity loaded or saved during a transaction. This context is the "brain" that decides whether a Java change requires a SQL `UPDATE`.

## Entity States and the Lifecycle

An entity exists in one of four states relative to the Persistence Context:

1. **New (Transient):** The object is instantiated (`new StockItem()`) but has no identity in the database and is not tracked by Hibernate.
2. **Managed:** The entity is tracked. Any change to its fields will be detected by **Dirty Checking** and synchronized with the DB upon flushing.
3. **Detached:** The entity has a database ID, but the Persistence Context is closed or the entity was explicitly detached. Changes here are ignored by Hibernate until the entity is merged back.
4. **Removed:** The entity is scheduled for deletion.

## The Mechanics of `repository.save()`

Spring Data save delegates to persist for an entity considered new and merge otherwise. By default, newness is determined from a non-primitive version property when available, then from whether the identifier is null. Implementing Persistable can override that decision. An assigned identifier therefore needs an explicit newness strategy.

persist makes the new instance managed; SQL timing depends on identifier generation and flushing. merge copies state into a managed instance and returns it. A detached argument remains detached: use the returned instance. Neither operation means the transaction has committed.
## ID Generation Strategies and SQL Timing

With Hibernate, PostgreSQL and an active transaction using normal AUTO flushing, IDENTITY commonly requires an early INSERT to obtain the generated identifier. Do not generalize that timing to every provider, flush mode or transaction configuration.

SEQUENCE separates identifier allocation from row insertion. Hibernate may obtain a sequence value or use an already allocated range, depending on the optimizer and allocation size. The entity can have an ID before its INSERT is flushed. Having an ID proves neither that the row exists nor that a transaction committed.
## Worked Example: Stock Item Lifecycle

Each trace below runs entirely inside an outer service transaction, with Hibernate, PostgreSQL and normal AUTO flushing. The managed entity stays attached until that transaction ends. Without this outer boundary, a repository call can finish its own transaction before returning, so a later setter is not automatically persisted. For the merge trace, the detached entity comes from a previous context; client request data should normally be validated and mapped onto a loaded entity rather than merged indiscriminately.

Consider a `StockItem` entity:

```java
@Entity
public class StockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String sku;
    private Integer quantity;

    // Getters, Constructor, etc.
}
```

### Trace 1: The Initial Insert
1. `StockItem item = new StockItem("BOLT-01", 100);` → **State: New**.
2. `repository.save(item);` → Hibernate sees it is new → calls `persist()`.
3. Because we use `SEQUENCE`, Hibernate fetches the next ID (e.g., `1`) and assigns it to `item`. **State: Managed**. No SQL `INSERT` has happened yet.
4. **Flush**: When the transaction ends or `flush()` is called, Hibernate generates: `INSERT INTO stock_item (id, sku, quantity) VALUES (1, 'BOLT-01', 100);`.

### Trace 2: Managed Update (Dirty Checking)
1. `StockItem item = repository.findById(1L).orElseThrow();` → **State: Managed**.
2. `item.setQuantity(80);` → No repository method is called. Hibernate's dirty checking mechanism compares the current state with the snapshot taken during load.
3. **Commit**: Upon transaction commit, Hibernate detects the change and generates: `UPDATE stock_item SET quantity = 80 WHERE id = 1;`.

### Trace 3: The Detached Merge
1. An entity is sent to a UI, modified, and sent back. It has an ID but is not in the current session → **State: Detached**.
2. `StockItem detachedItem = ...; // quantity is 50`
3. `StockItem managedItem = repository.save(detachedItem);` → Hibernate calls `merge()`.
4. Hibernate loads the current record from DB, copies `50` into that managed instance, and returns it.
5. **Flush**: `UPDATE stock_item SET quantity = 50 WHERE id = 1;`.

## Flush vs. Commit

Flush synchronizes pending changes with the database by executing SQL inside the current transaction; it does not commit that transaction. In the PostgreSQL setup used here, the transaction sees its own changes while other ordinary transactions do not see its uncommitted writes. Visibility in general depends on isolation and database behavior.

Under normal AUTO flushing, committing the transaction flushes pending managed changes. MANUAL flushing and some read-only configurations require different handling. A successful flush can still be followed by rollback or a later commit failure.
## Exercise

Inside an active Hibernate transaction with normal AUTO flushing and PostgreSQL IDENTITY, save a new StockItem and then remove it before commit. Predict an early INSERT to obtain the ID followed by DELETE when removals are flushed. Confirm both statements in the SQL log and then confirm no row remains after commit. Repeat with SEQUENCE and note that obtaining an identifier does not itself require inserting the row. Treat the observed timing as specific to this configuration, not a universal JPA promise.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
