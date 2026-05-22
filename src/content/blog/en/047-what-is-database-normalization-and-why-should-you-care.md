---
title: "Normalize a Database Without Losing Business Meaning"
description: "Using functional dependencies to eliminate anomalies while preserving critical historical snapshots in repair invoices."
pubDate: 2026-10-06T23:48:00.000Z
translationKey: 047-what-is-database-normalization-and-why-should-you-care
seriesOrder: 8
locale: en
tags: ["database-design","learning-series"]
draft: false
---

## The Danger of Redundancy

When a database table stores multiple distinct facts in one row, it creates update, insertion, and deletion anomalies. Consider a `RepairInvoice` table containing: `InvoiceID`, `CustomerID`, `CustomerPhone`, `PartID`, `SupplierName`, `SupplierPhone`, and `InvoicedPrice`.

In this structure, the `CustomerPhone` depends only on the `CustomerID`, and the `SupplierPhone` depends only on the `PartID` (assuming one supplier per part). These are functional dependencies. Because these facts are repeated every time a customer makes a repair or a part is used, we face three risks:

1. **Update Anomaly**: If a customer changes their phone number, you must update every single invoice they ever had. Missing one row creates data inconsistency.
2. **Insertion Anomaly**: You cannot record a new supplier's contact details until you actually sell a part from them on an invoice.
3. **Deletion Anomaly**: If you delete the only invoice containing a specific part, you lose the supplier's contact information entirely.

## Distinguishing State from History

A common mistake during normalization is removing data that looks redundant but is actually a historical snapshot. 

In our scenario, the `InvoicedPrice` might look like it depends on the `PartID`. However, prices change over time. If you move the price to a `Parts` table and delete it from the `InvoiceLine`, changing today's price will retroactively change the total of an invoice from three years ago. This is a loss of business meaning.

- **Dynamic Data**: Customer phone numbers (current state).
- **Snapshot Data**: The price at the moment of sale (historical fact).

## Worked Solution: The Normalization Plan

To resolve the anomalies while preserving the price snapshot, we decompose the table based on functional dependencies.

### 1. Identify Dependencies
- `InvoiceID` → `CustomerID`, `InvoiceDate`
- `CustomerID` → `CustomerPhone`
- `PartID` → `SupplierID`, `PartName`
- `SupplierID` → `SupplierName`, `SupplierPhone`
- `(InvoiceID, PartID)` → `InvoicedPrice` (The price is tied to the specific transaction, not just the part).

### 2. The Resulting Schema (Logical Model)

- **Customers**: (`CustomerID` [PK], `CustomerPhone`)
- **Suppliers**: (`SupplierID` [PK], `SupplierName`, `SupplierPhone`)
- **Parts**: (`PartID` [PK], `PartName`, `SupplierID` [FK])
- **Invoices**: (`InvoiceID` [PK], `CustomerID` [FK], `InvoiceDate`)
- **InvoiceLines**: (`InvoiceID` [FK], `PartID` [FK], `InvoicedPrice`) → Composite PK (`InvoiceID`, `PartID`)

### 3. Analysis of the Outcome
By splitting the tables, we now handle the anomalies:
- **Update**: Change a phone number in one row in the `Customers` table; all invoices remain linked via `CustomerID`.
- **Insertion**: Add a supplier to the `Suppliers` table without needing an invoice.
- **Deletion**: Delete an invoice line without losing the supplier's identity.
- **Integrity**: The `InvoicedPrice` remains in the `InvoiceLines` table, ensuring that historical records are immutable regardless of future price hikes in the `Parts` catalog.

## Exercise

**Scenario**: You have a `ProjectAssignment` table: `ProjectID`, `ProjectName`, `EmployeeID`, `EmployeeName`, `Role`, and `HourlyRate`. The `HourlyRate` is negotiated specifically for that project assignment, not the employee's general salary.

**Task**: Identify the functional dependencies and describe which fields must stay in the join entity to avoid losing business meaning.

**Answer**:
- Dependencies: `ProjectID` → `ProjectName`; `EmployeeID` → `EmployeeName`.
- The `Role` and `HourlyRate` depend on the combination of `(ProjectID, EmployeeID)`. 
- To avoid losing business meaning, `HourlyRate` must stay in the `ProjectAssignment` join entity because it is a snapshot of the agreement for that specific project, not a global attribute of the employee.

The invoice-line key shown assumes each part appears once per invoice; use a separate line identifier if a part can occur on several differently priced lines. Storing the invoiced price preserves its meaning independently of current catalog prices, but does not make the row technically immutable. Prevent unauthorized history edits separately.
