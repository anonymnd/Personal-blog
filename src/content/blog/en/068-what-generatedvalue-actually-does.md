---
title: "What @GeneratedValue Actually Does"
description: "An exploration of how JPA handles primary key generation and the subtle differences between its strategies."
pubDate: 2026-10-09T11:48:00.000Z
translationKey: 068-what-generatedvalue-actually-does
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers assume that adding `@GeneratedValue` simply tells the database to 'make a number,' but this ignores the complex coordination between the Java application and the database engine. The real struggle begins when you realize that your application might be sending an `INSERT` statement much earlier or later than you expect, depending on the strategy chosen.

## The Core Mechanism
`@GeneratedValue` is a JPA annotation that delegates the responsibility of assigning a primary key to the persistence provider (like Hibernate). Instead of you manually calling `setId()`, the provider determines the value based on a specific `GenerationType`. This ensures uniqueness across the table without requiring the developer to track the last used ID in the application logic.

## Comparing the Strategies

| Strategy | Mechanism | Performance Impact |
| :--- | :--- | :--- |
| IDENTITY | DB auto-increment column | Disables batch inserts |
| SEQUENCE | DB sequence object | Efficient, supports batching |
| TABLE | Separate ID table | Slowest, high overhead |
| AUTO | Provider chooses | Unpredictable across DBs |

## Worked Example: Procurement App
Imagine a `PurchaseRequest` entity where each request needs a unique ID. Using `SEQUENCE` allows Hibernate to 'reserve' IDs before the transaction actually hits the database.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "proc_seq")
    @SequenceGenerator(name = "proc_seq", sequenceName = "purchase_request_seq", allocationSize = 50)
    private Long id;
    
    private String itemDescription;
    // Getters and setters
}
```
In this case, if you save 10 requests, Hibernate might only call the database once to get a block of 50 IDs, significantly reducing network round-trips.

## Common Mistake: The Identity Trap
A frequent error is using `GenerationType.IDENTITY` and wondering why `saveAll()` is slow. Because `IDENTITY` requires the database to generate the ID during the `INSERT`, Hibernate cannot delay the SQL execution until the flush phase. It must execute the `INSERT` immediately to retrieve the ID for the entity object.

**Correction:** Switch to `SEQUENCE` if your database supports it (like PostgreSQL or Oracle) to enable write-behind batching.

## Practical Exercise
If you use `GenerationType.AUTO` and switch your database from H2 (in-memory) to MySQL, why might your ID generation behavior change?

**Answer:** Because `AUTO` lets the provider decide. H2 might use a sequence, while MySQL (which doesn't natively support sequences in older versions) might switch to a table or identity strategy, changing how IDs are allocated.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
