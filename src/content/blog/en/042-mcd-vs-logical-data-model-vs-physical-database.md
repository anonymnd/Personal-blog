---
title: "MCD vs Logical Data Model vs Physical Database"
description: "A guide to navigating the three critical stages of database design from conceptual business rules to physical implementation."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 042-mcd-vs-logical-data-model-vs-physical-database
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are building a procurement system. Your manager tells you, 'A requester can submit many requests, but each request belongs to only one requester.' If you jump straight into SQL, you might miss critical business constraints or create a rigid structure that is hard to change. This is why we use a three-step modeling process.

## The Conceptual Data Model (MCD)
The MCD (Modèle Conceptuel des Données) focuses on 'what' the data is, not 'how' it is stored. It uses entities (objects) and relationships. In our procurement app, we have entities like `Requester` and `PurchaseRequest`. The relationship is 'Submits'. Here, we define cardinalities: a Requester can submit 0 to N requests, while a Request must be submitted by exactly 1 Requester. There are no foreign keys here, only business rules.

## The Logical Data Model (MLD)
The MLD translates the MCD into a structure that a database can understand, regardless of the specific software. This is where we introduce primary keys and foreign keys. If we have a many-to-many relationship—for example, a `Request` can contain many `Products` and a `Product` can be in many `Requests`—the MLD introduces a 'join entity' (e.g., `RequestLine`) to hold the relationship attributes like `quantity`.

## The Physical Database (MPD)
The MPD is the actual implementation in a specific system like PostgreSQL or MySQL. Here, we define data types (`VARCHAR(255)`, `INT`), indexes for performance, and constraints. We decide if a field is `NOT NULL` or if a column should be an `IDENTITY` column.

## Worked Example: Procurement Workflow

| Stage | Representation |
| :--- | :--- |
| **MCD** | `Requester` --(Submits)--> `PurchaseRequest` |
| **MLD** | `Requester(id, name)` → `PurchaseRequest(id, date, requester_id)` |
| **MPD** | `CREATE TABLE PurchaseRequest (id INT PRIMARY KEY, requester_id INT REFERENCES Requester(id))` |

## Common Mistake: Skipping the MCD
Developers often go straight to the Physical model. The mistake is forgetting that business rules (like optionality) are lost. If you forget that a `Manager` might be optional for some requests, your database will throw errors when you try to save a request without a manager assigned.

## Practical Exercise
**Scenario:** A `Buyer` manages multiple `Orders`, but an `Order` is managed by only one `Buyer`.
**Task:** Identify which model introduces the `buyer_id` foreign key into the `Orders` table.

**Answer:** The Logical Data Model (MLD).
