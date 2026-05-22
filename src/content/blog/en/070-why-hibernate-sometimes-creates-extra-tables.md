---
title: "Why Value Collections and Associations Need Extra Tables"
description: "Deep dive into @ElementCollection, embeddables, and the structural difference between value types and entities in JPA."
pubDate: 2026-10-07T06:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
seriesOrder: 15
locale: en
tags: ["spring-architecture","learning-series"]
draft: false
---

## Value Types vs. Entities

In JPA, there is a fundamental distinction between an **Entity** and a **Value Type**. An entity has a persistent identity (a primary key) that allows it to be tracked, updated, and referenced independently across the system. A value type, however, is defined by its attributes. If two value types have the same data, they are effectively the same value.

Consider a `Product`. A `Supplier` is an entity because a supplier exists independently of any single product; they have their own lifecycle and ID. Conversely, a product's `Dimensions` (height, width, depth) or a list of `ColorLabels` (Red, Blue) are value types. They have no meaning outside the context of the product they describe.

## The Role of @ElementCollection

The standard relational @ElementCollection mapping stores basic or embeddable values in a collection table joined to the owning entity. This is a mapping choice, not a claim that databases cannot store arrays or JSON in one column; such alternatives need their own mapping and query trade-offs.

An entity association targets independently identifiable entities. A value collection has no separate entity identity: its values belong to the owner. Its table may still have a primary key, uniqueness constraints and indexes. Removing the parent through the entity lifecycle removes the dependent values; bulk or native deletes require separate attention to database constraints and cleanup.
## Worked Example: Product Dimensions and Labels

Here is how we model a product with a set of simple strings (colors) and a set of complex values (dimensions).

```java
import jakarta.persistence.*;
import java.util.*;

@Embeddable
public record Dimensions(double height, double width, double depth) {}

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private Set<String> colors = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_dimensions", joinColumns = @JoinColumn(name = "product_id"))
    private Set<Dimensions> dimensions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Supplier supplier;

    // Getters, Constructor
}

@Entity
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyName;
    // Getters, Constructor
}
```

### Database Schema Trace

If we persist a Product with ID `101`, colors `{"Red", "Blue"}`, and one `Dimensions(10, 20, 30)`, the database looks like this:

**Table: `product`**
| id | name | supplier_id |
| :--- | :--- | :--- |
| 101 | Desk | 50 |

**Table: `product_colors`**
| product_id | color |
| :--- | :--- |
| 101 | Red |
| 101 | Blue |

**Table: `product_dimensions`**
| product_id | height | width | depth |
| :--- | :--- | :--- |
| 101 | 10.0 | 20.0 | 30.0 |

**Table: `supplier`**
| id | company_name |
| :--- | :--- | 
| 50 | OfficeCorp |

### What the tables mean

These rows describe values belonging to a product, rather than entities with independent IDs. Copying a color value to another product creates another occurrence of that value; it does not transfer an entity identity. Exact SQL and physical constraints are mapping-dependent.

## Failure Cases and Pitfalls

If categories must have shared identifiers, independent editing and references from many products, model Category as an entity. The association may be many-to-one, many-to-many or a link entity, according to the domain. A repeated string label alone does not automatically require a category entity.

Update an existing managed collection carefully instead of casually replacing Hibernate’s collection wrapper. The SQL cost depends on collection semantics, value equality, mapping and provider version. clear/addAll is not inherently more efficient, and removing one Java value does not universally promise exactly one SQL DELETE. Observe representative changes in SQL logs before optimizing.
## Exercise

A product stores warranty descriptions such as 12 months for parts and 36 months for labor. In this model these are values, with no contract identifier or independent lifecycle. Choose an embeddable WarrantyPeriod with durationMonths and coverageType, held in an @ElementCollection.

Removing a period from a managed collection inside a transaction should make the persisted collection match the remaining values after flush and commit. The exact deletion or reinsertion statements depend on the mapping; check SQL rather than promising one specific statement. If warranties instead become independently managed customer contracts, reconsider entity identity.

The example uses a record embeddable supported by Hibernate 6.6; check provider and specification support before reusing it. The entity snippets are separate source files and omit accessors and construction helpers. For PostgreSQL, a foreign key does not itself create an index on the referencing columns. Inspect existing keys and query plans before adding an index on product_id; small tables may still be scanned efficiently.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
