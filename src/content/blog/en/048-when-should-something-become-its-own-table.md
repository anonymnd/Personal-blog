---
title: "When Should Something Become Its Own Table?"
description: "Learn how to identify when a data attribute needs to be promoted to a separate table to ensure database normalization and scalability."
pubDate: 2026-10-08T15:48:00.000Z
translationKey: 048-when-should-something-become-its-own-table
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are building a procurement app. You start with a `PurchaseRequest` table and add a column called `requester_department`. At first, it seems fine. But then you realize you need to store the department's budget, its manager, and its physical location. If you keep adding these as columns to the request table, you will repeat the same department info for every single request, leading to massive data redundancy and update anomalies.

## The Rule of Atomicity and Redundancy
A piece of data should become its own table when it represents a distinct entity with its own properties, rather than just a simple attribute of another object. If you find yourself repeating a group of related fields (like Department Name, Dept Code, and Dept Head) across multiple rows, you have a 'transitive dependency'. This is a clear signal to normalize the data into a separate table.

## Handling One-to-Many Relationships
When one entity can be associated with multiple instances of another, a separate table is mandatory. In our procurement app, a `Buyer` might handle many `PurchaseRequests`. While the `PurchaseRequest` table holds a foreign key to the `Buyer`, the `Buyer` details (email, phone, certification level) must live in their own `Buyer` table. This prevents the database from bloating and ensures that updating a buyer's phone number happens in one place, not in a thousand request rows.

## The Need for Join Entities
Sometimes, the relationship itself has attributes. If a `Manager` approves a `PurchaseRequest`, and you need to record the *date of approval* and the *comments* for that specific decision, you cannot store this in either the Manager or the Request table without creating a mess. You create a join entity (e.g., `Approval`) that links the two and stores the metadata of the interaction.

## Worked Example: From Flat to Normalized
**Initial Flat Design:**
`Request(id, item, price, dept_name, dept_manager)`

**Normalized Design:**
1. `Department(dept_id, name, manager)`
2. `PurchaseRequest(id, item, price, dept_id)`

**Outcome:** If the department manager changes, you update one row in the `Department` table instead of searching through thousands of requests.

## Common Mistake: Over-Normalization
A common error is creating tables for every single attribute (e.g., a separate table for `Gender` or `Status`). If the attribute is a simple label with no other properties, a column or an Enum is sufficient. Only create a table if the attribute has its own identity and related data.

## Practical Exercise
You have a `Project` table and you want to track the `Client` who owns the project. You need to store the Client's VAT number and Address. Should `Client` be a column or a table?

**Answer:** A separate table, because the Client has multiple attributes (VAT, Address) that would be redundant if repeated for every project.
