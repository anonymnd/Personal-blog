---
title: "What Is @ElementCollection?"
description: "Learn how to map collections of simple types or embeddables in JPA without creating full entity relationships."
pubDate: 2026-10-12T12:48:00.000Z
translationKey: 141-what-is-elementcollection
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a `PurchaseRequest` needs a list of tags (like 'Urgent', 'IT-Hardware', 'Office-Supply') to help the manager filter requests. You don't want to create a whole new `Tag` entity with its own ID, lifecycle, and repository just to store a few strings. This is where `@ElementCollection` becomes essential.

## Collections of owned values
`@ElementCollection` maps basic values such as String or Integer, or embeddable value objects. A value has no independent entity identity or repository lifecycle: it belongs to its owning entity. A relational mapping normally stores these values in a collection table with a foreign key to the owner. Removing the owner through JPA also removes its collection values. This does not imply that arbitrary SQL deletes have an automatic database cascade; that depends on the database constraints.
## Worked example: request tags
A request owns a set of tags. We explicitly name the collection table and owner column:

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;

    @ElementCollection
    @CollectionTable(name = "request_tags",
        joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "tag_name", nullable = false)
    private Set<String> tags = new HashSet<>();
}
```

For a new request with three distinct tags, Hibernate can write one request row and three collection rows during synchronization. There is no separately managed Tag entity. Do not assume a universal table primary-key layout from this annotation alone: inspect the actual mapping and schema. If uniqueness of a tag per request is required, enforce an appropriate constraint such as `UNIQUE (request_id, tag_name)` in the database migration.
## Changing a value is not updating an independent entity
String is immutable, so changing a string tag means removing the old value and adding the new one. An embeddable can have mutable properties; changes to those owned values can be synchronized with the owner. They still do not become independent managed entities with their own IDs. Be careful when mutating an object used as a Set element: changing fields involved in equals or hashCode can break the collection. Replace values or use immutable value objects when appropriate.
## Practical Exercise
**Scenario:** You need to add a list of `PhoneNumber` (an `@Embeddable` class with `countryCode` and `number`) to a `Supplier` entity.

**Question:** Which annotation goes on the `List<PhoneNumber>` field in the `Supplier` class?

**Answer:** `@ElementCollection`.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
