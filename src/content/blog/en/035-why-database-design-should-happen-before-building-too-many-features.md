---
title: "From Business Rules to a Relational Database Model"
description: "A guide to transforming equipment rental business rules into a conceptual, logical, and physical database schema using Merise cardinalities."
pubDate: 2026-10-06T21:48:00.000Z
translationKey: 035-why-database-design-should-happen-before-building-too-many-features
seriesOrder: 6
locale: en
tags: ["database-design","learning-series"]
draft: false
---

## Translating Business Rules into Entities

Database design often fails when developers jump straight to tables without analyzing the underlying business rules. The goal is to move from a natural language description to a structured model. In our equipment rental scenario, the rules are:
1. A customer signs a rental agreement.
2. A rental agreement contains one or more line items.
3. Each line item links to a specific piece of equipment.
4. Each line item records the agreed price at the time of rental and the return status.
5. An item of equipment can be rented many times over its lifetime.

To identify entities, we look for 'nouns' that have an independent existence and a set of descriptive properties.
- **Customer**: Exists regardless of whether they have a current rental.
- **Rental**: A specific contract event.
- **Equipment**: The physical asset being rented.

Attributes are the properties of these entities. A common mistake is treating a relationship as an attribute. For example, 'Rental Date' is an attribute of the Rental, but 'Agreed Price' is not an attribute of the Equipment (because the price changes per rental) nor the Rental (because a rental has multiple items with different prices). It belongs to the interaction between the two.

## The Conceptual Model (MCD) and Cardinalities

Using the Merise methodology, we define the Conceptual Data Model (MCD) by focusing on entities and their associations with specific cardinalities (min, max).

- **Customer <-> Rental**:
  - A Customer can sign 0 or many rentals (0,N).
  - A Rental is signed by exactly 1 customer (1,1).
- **Rental <-> Equipment**:
  - A Rental contains 1 or many pieces of equipment (1,N).
  - A piece of Equipment can be part of 0 or many rentals over time (0,N).

Because the relationship between Rental and Equipment is Many-to-Many (N:M) and carries its own data (agreed price, return status), it becomes an **Association Entity** (or Join Entity). In Merise, this is where the 'Line Item' logic resides.

## Logical to Physical Mapping

To move from the MCD to a Physical Model (SQL), we apply specific transformation rules:
1. **1:N Relationships**: The 'Many' side receives a Foreign Key (FK) pointing to the 'One' side. (Rental table gets `customer_id`).
2. **N:M Relationships**: A new table is created. Its primary key is typically a composite of the two foreign keys it connects. (RentalLineItem table gets `rental_id` and `equipment_id`).

### Worked Physical Schema

Here is the resulting schema. Note the use of `DECIMAL` for currency to avoid floating-point errors and `BOOLEAN` for status.

```sql
-- Illustrative Physical Schema
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE rentals (
    id BIGINT PRIMARY KEY,
    rental_date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE equipment (
    id BIGINT PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model_name VARCHAR(255) NOT NULL
);

CREATE TABLE rental_line_items (
    rental_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    agreed_price DECIMAL(10, 2) NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (rental_id, equipment_id),
    CONSTRAINT fk_line_rental FOREIGN KEY (rental_id) REFERENCES rentals(id),
    CONSTRAINT fk_line_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);
```

## Analysis of the Model

This structure preserves historical facts. If we simply put a `current_rental_id` inside the `equipment` table, we would lose the history of every previous person who rented that item. By using the `rental_line_items` table, we create a ledger of every transaction.

**Failure Case: The 'Current Price' Trap**
If we stored the price only in the `equipment` table, changing the price today would retroactively change the price of rentals from three years ago in our reports. By placing `agreed_price` in the join table, we take a 'snapshot' of the price at the moment the contract was signed.

## Exercise

**Scenario**: The business decides that each piece of equipment must be assigned to a specific 'Warehouse' before it can be rented. A warehouse can hold many items, but an item belongs to only one warehouse at a time.

**Question**:
1. What is the cardinality between Warehouse and Equipment?
2. How does the physical schema change?

**Answer**:
1. Warehouse (0,N) <-> Equipment (1,1). A warehouse has zero or more items; an item must belong to exactly one warehouse.
2. The `equipment` table must be updated to include a `warehouse_id` column as a Foreign Key referencing the new `warehouses` table.

The foreign keys in this illustrative schema do not by themselves enforce the conceptual minimum of one line per rental. Validate a nonempty set of lines when confirming a rental, within an appropriate transaction or database rule. The composite line key also assumes that a given physical item appears at most once in a rental.
