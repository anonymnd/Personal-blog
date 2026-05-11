---
title: "Why @ElementCollection Creates Another Table"
description: "Understand how JPA handles collections of basic types and why they require a separate database table."
pubDate: 2026-10-12T13:48:00.000Z
translationKey: 142-why-elementcollection-creates-another-table
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a `PurchaseRequest` can have multiple tags (like 'Urgent', 'IT-Hardware', 'Office-Supplies'). You might think you can just store these as a list in one column, but when you use `@ElementCollection` in JPA, you'll notice Hibernate automatically generates a second table in PostgreSQL. This often confuses beginners who expect a single-table solution.

## The Mechanism of Element Collections
In JPA, `@ElementCollection` is used for collections of basic types (String, Integer) or `@Embeddable` objects. Unlike a `@OneToMany` relationship, the items in an element collection do not have their own identity (no primary key of their own). They are entirely dependent on the parent entity. Because relational databases like PostgreSQL cannot store a list of values in a single standard column (unless using specific array types which JPA doesn't map by default), Hibernate creates a separate 'collection table' to maintain normalization.

## Worked Example: Procurement Tags
Consider a `PurchaseRequest` entity. We want to store a list of tags for each request.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    
    private String description;

    @ElementCollection
    @CollectionTable(name = "request_tags", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> tags = new ArrayList<>();
}
```

**Outcome:** Hibernate creates two tables: `purchase_request` (id, description) and `request_tags` (request_id, tags). If request #1 has tags 'Urgent' and 'IT', the `request_tags` table will have two rows: `(1, 'Urgent')` and `(1, 'IT')`.

## Common Mistake: Treating Elements as Entities
A frequent error is trying to update a single element in the collection by calling a setter on the value itself. Since these are basic types or embeddables, they have no ID. To change a tag, you must remove the old value from the list and add the new one, or replace the entire collection.

**Correction:** Instead of searching for a specific object to modify, use `request.getTags().remove(oldTag);` followed by `request.getTags().add(newTag);`.

## Practical Exercise
If you have a `User` entity with an `@ElementCollection` of `phoneNumbers`, and you add three numbers to a user with ID 5, how many rows are added to the phone numbers table?

**Answer:** Three rows are added, all sharing the same foreign key (user_id = 5).

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
