---
title: "Primary Key vs Foreign Key"
description: "Understand the fundamental difference between unique identification and relational linking in database design."
pubDate: 2026-10-12T18:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
locale: en
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a table for `Requests` and a table for `Users`. If you only have names, you will run into trouble the moment two employees named 'Ahmed' join the company. You cannot tell who submitted which request. This is where the distinction between Primary Keys (PK) and Foreign Keys (FK) becomes critical.

## The Primary Key: The Unique ID
A Primary Key is a column (or a set of columns) that uniquely identifies each row in a table. In PostgreSQL, this is often an `id` column using `SERIAL` or `UUID`. A PK must be unique and cannot contain NULL values. It ensures that every record is distinct, acting like a digital fingerprint for that specific entry.

## The Foreign Key: The Relational Bridge
A Foreign Key is a column in one table that refers to the Primary Key of another table. It creates a link between the two. While a PK identifies a record, a FK establishes a relationship. For example, the `Requests` table doesn't need to store the user's full name and email; it only needs the `user_id` (the FK) which points back to the PK in the `Users` table.

## Worked Example: Procurement Workflow
Consider these two simplified table definitions:

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE requests (
    request_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT REFERENCES users(user_id)
);
```
If User 101 (Ahmed) submits a request for a 'Laptop', the `requests` table will have a row where `request_id` is 5001 and `requester_id` is 101. The database ensures that you cannot add a request for `requester_id` 999 if that user doesn't exist in the `users` table.

## Common Mistake: Confusing Uniqueness
A frequent error is thinking that a Foreign Key must be unique. This is incorrect. In a one-to-many relationship (one user, many requests), the `requester_id` in the `requests` table will repeat many times. Only the Primary Key of its own table must be unique.

## Practical Exercise
Scenario: You have a `Products` table and an `Orders` table. Which column should be the Foreign Key in the `Orders` table to link it to a specific product?

**Answer:** The `product_id` column in the `Orders` table should be the Foreign Key referencing the `product_id` Primary Key in the `Products` table.

## Further reading

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
