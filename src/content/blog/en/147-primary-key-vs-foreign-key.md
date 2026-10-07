---
title: "Primary Keys, Foreign Keys and Unique Constraints Protect Different Facts"
description: "Distinguishing row identity from business uniqueness and referential integrity in PostgreSQL and JPA."
pubDate: 2026-10-08T00:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
seriesOrder: 33
locale: en
tags: ["persistence","learning-series"]
draft: false
---

## The Distinction Between Identity and Uniqueness

In database design, it is a common mistake to conflate a Primary Key (PK) with a Unique Constraint. While both enforce uniqueness, they protect different logical facts. A Primary Key defines the immutable identity of a row. A Unique Constraint protects a "candidate key"—a business rule stating that a specific combination of data must not be duplicated.

Consider a flight system. A flight is not uniquely identified by its flight number alone, as the same number is reused daily. The business fact is that for a specific carrier, on a specific date, there is only one flight with a specific number. However, using these three columns as a composite PK makes foreign key references bulky and fragile. Instead, we use a surrogate PK (a UUID or BigInt) for identity and a Unique Constraint for the business rule.

## Referential Integrity and the Foreign Key

A Foreign Key (FK) does not identify a row; it enforces a relationship. It ensures that a child record (like a Ticket) cannot point to a non-existent parent (a Flight). 

Crucially, in PostgreSQL, creating a Foreign Key constraint does not automatically create an index on the referencing column. While the parent table's PK is indexed, the child table's FK is not. This means that while inserting a ticket is fast (it only checks the parent index), deleting a flight or querying tickets for a specific flight will trigger a full table scan of the tickets table unless you manually add an index to the FK column.

## Worked Example: Flight and Ticket Schema

Here is the implementation using Jakarta Persistence (JPA) and PostgreSQL logic. We separate the surrogate identity from the business uniqueness.

```java
@Entity
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key: Row Identity

    private String carrier;
    private String flightNumber;
    private LocalDate departureDate;

    // Business Rule: No two flights for same carrier/number/date
    // Defined via @Table(uniqueConstraints = ...) or DB DDL
}

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Ticket's own identity

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight; // Foreign Key: Referential Integrity

    private String passengerName;
    
    @Column(unique = true)
    private String ticketNumber; // Unique Constraint: Candidate Key
}
```

### Database Trace and Consequences

1. **Insert Flight**: `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → Success. PK `1` assigned.
2. **Duplicate Flight**: `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → **FAIL**: Unique constraint violation. The business fact is protected.
3. **Insert Ticket**: `INSERT INTO ticket (flight_id, passenger_name) VALUES (1, 'Alice');` → Success. FK checks if Flight `1` exists.
4. **Orphan Ticket**: `INSERT INTO ticket (flight_id, passenger_name) VALUES (999, 'Bob');` → **FAIL**: Foreign key violation. Referential integrity is protected.
5. **Query Performance**: `SELECT * FROM ticket WHERE flight_id = 1;` → **SLOW**. PostgreSQL performs a Sequential Scan because the FK `flight_id` is not indexed by default.

## Nullability in Unique Constraints

A primary key combines uniqueness and NOT NULL; its identity is normally kept stable by application policy, but declaring a PK does not inherently make updates impossible. A unique constraint alone may allow nulls. PostgreSQL treats nulls as distinct for uniqueness by default; SQL NULL = NULL and NULL <> NULL both evaluate to unknown, not true. NULLS NOT DISTINCT offers another explicit policy. Combine UNIQUE with NOT NULL when a required business identifier must be present.
## Exercise

A seat number is not globally unique, so it cannot alone identify a ticket. A surrogate ticket ID is one useful design; composite keys remain a valid alternative when their trade-offs suit the domain. Enforce UNIQUE(flight_id, seat_number), and require both columns when every assigned seat must be known.

PostgreSQL creates a supporting unique B-tree index. That index is well suited to flight_id plus seat_number lookups, but does not guarantee fast seat_number-only queries. Column order, version and planner decisions matter. Likewise, a foreign key does not create a child-column index automatically, but an existing index may already cover it and a small table scan need not be slow.

For the duplicate-flight trace, actually install the stated unique constraint and NOT NULL business columns in a migration. Comments in the Java excerpt do not enforce the rule. The carrier/number/date combination is an assumption of this simplified model; confirm whether the real domain permits repeated legs or departures on the same date.

## Further reading

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
