---
title: "How to Identify Entities in an Application"
description: "A guide to distinguishing core business objects from attributes to build a solid conceptual data model."
pubDate: 2026-10-08T03:48:00.000Z
translationKey: 036-how-to-identify-entities-in-an-application
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are building a procurement system. You start listing things like 'Request Date', 'Product Name', and 'Manager Name'. Suddenly, you realize you aren't sure if 'Manager' is just a piece of text or a separate object that needs its own profile. This confusion often leads to redundant data and rigid databases.

## The Entity vs. Attribute Distinction
An entity is a distinct object—person, place, thing, or event—that has an independent existence and multiple characteristics. An attribute is a single property that describes an entity. If you find yourself needing to store multiple pieces of information about a specific item (e.g., a Manager's email, phone, and department), that item is an entity, not an attribute.

## Applying the Procurement Logic
In a procurement app, we identify entities by looking for the 'nouns' in the business rules. 
- **Requester**: The person asking for an item.
- **PurchaseRequest**: The event of asking.
- **Product**: The item being requested.
- **Manager**: The person approving the request.

If we treated 'Manager' as a simple attribute (a string) inside the `PurchaseRequest` entity, we couldn't easily track how many requests a specific manager approved across the whole system without risking typos and data inconsistency.

## Worked Example: The Request Flow
Consider this conceptual mapping:
- **Entity: PurchaseRequest** (Attributes: RequestID, Date, TotalAmount)
- **Entity: Product** (Attributes: ProductID, SKU, UnitPrice)
- **Relationship**: A `PurchaseRequest` contains one or more `Products`.

Because the relationship 'contains' has its own data (the quantity of each product), we create a **Join Entity** called `RequestItem` to hold the `Quantity` attribute. This prevents the database from becoming a mess of comma-separated lists.

## Common Mistake: Over-Entityizing
Beginners often create entities for things that are actually static values. For example, creating a `Currency` entity for a simple 'USD' or 'EUR' string when the app only supports one currency. 
**Correction**: If the object has no properties other than its name and doesn't change, keep it as an attribute (Enum or String) to avoid unnecessary table joins.

## Practical Exercise
Scenario: You are adding a 'Supplier' feature. You need to store the Supplier's Company Name, Tax ID, and Contact Person. Is 'Supplier' an entity or an attribute?

**Answer**: It is an entity because it has multiple distinct properties (Tax ID, Contact Person) that describe it independently of any specific order.
