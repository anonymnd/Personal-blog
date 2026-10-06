---
title: "ddl-auto=create vs update vs validate"
description: "Understand how Spring Boot's Hibernate ddl-auto property manages your database schema during development and deployment."
pubDate: 2026-10-13T05:48:00.000Z
translationKey: 158-ddl-auto-create-vs-update-vs-validate
locale: en
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have added a new 'approvalDate' field to your ProcurementRequest entity, but when you start your application, you get a `SQLGrammarException` because the column doesn't exist in the database. This happens because your application code and your database schema are out of sync.

## The Role of ddl-auto
In Spring Boot, the `spring.jpa.hibernate.ddl-auto` property tells Hibernate how to handle the database schema on startup. It acts as a bridge between your Java entities and the actual SQL tables.

## Comparing the Strategies

| Value | Behavior | Best Use Case |
| :--- | :--- | :--- |
| `create` | Drops existing tables and creates new ones | Initial prototyping |
| `update` | Adds missing columns/tables; never deletes | Fast local development |
| `validate` | Checks if schema matches entities; fails if not | Production/Staging |

## Worked Example: Procurement App
Consider a simple procurement flow where a `Requester` submits a request. If you use `ddl-auto=update` and add a `status` field to your `ProcurementRequest` entity:

```java
@Entity
public class ProcurementRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemName;
    private String status; // New field added
}
```

Upon restart, Hibernate executes: `ALTER TABLE procurement_request ADD COLUMN status VARCHAR(255);`. The application starts successfully, and existing data is preserved.

## Common Mistake: Using update in Production
Developers often use `update` in production to avoid manual scripts. However, `update` cannot handle renaming columns or changing data types. If you rename `itemName` to `productName`, Hibernate will simply create a new `productName` column, leaving the old `itemName` column full of orphaned data.

**Correction:** Use `validate` in production. This ensures the app won't start if the schema is wrong, forcing you to use a controlled migration tool like Flyway to handle the rename safely.

## Practical Exercise
Your app is set to `ddl-auto=validate`. You add a `managerApproval` boolean to your entity but forget to run the SQL script on the DB. What happens when the app starts?

**Answer:** The application will fail to start and throw a `SchemaManagementException` because the database schema does not match the entity definition.
