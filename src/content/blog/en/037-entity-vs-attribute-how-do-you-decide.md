---
title: "Entity vs Attribute: How Do You Decide?"
description: "Learn the fundamental criteria for distinguishing between a standalone entity and a simple attribute during database conceptual modeling."
pubDate: 2026-10-08T04:48:00.000Z
translationKey: 037-entity-vs-attribute-how-do-you-decide
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imagine you are designing a procurement system. You have a 'Purchase Request' and you need to handle the 'Department' it belongs to. Should 'Department' be a simple text column (attribute) inside the request table, or should it be its own table (entity)? This is the most common crossroads in conceptual data modeling (MCD).

## The Rule of Independence
An attribute is a property that describes an entity; it cannot exist without that entity. For example, the `requestDate` of a purchase request is an attribute because it has no meaning outside the context of that specific request. An entity, however, has its own identity and properties. If you need to store the department's budget, its manager, and its location, the department is no longer just a label—it is an entity.

## The Multiplicity Test
Ask yourself: 'Can this value be shared across many records, and does it have its own attributes?' If you only store the name 'IT Department' as a string, you risk data inconsistency (e.g., 'IT' vs 'Information Tech'). By making it an entity, you create a single source of truth. If a department can exist even if no one has submitted a purchase request yet, it must be an entity.

## Worked Example: Procurement App
Let's look at the difference in a conceptual model:

**Approach A (Attribute):**
`PurchaseRequest` { requestId, amount, deptName }

**Approach B (Entity):**
`PurchaseRequest` { requestId, amount } → belongs to → `Department` { deptId, deptName, budget }

In Approach B, if the manager changes the department name, you update it in one place, not in every single request. The `deptId` becomes a foreign key in the logical model.

## Common Mistake: The 'Flat Table' Trap
Beginners often put everything as attributes to avoid joins. For example, putting `supplierAddress` and `supplierPhone` inside the `Order` entity. 
**Correction:** Since a supplier exists independently of a single order, create a `Supplier` entity. This prevents redundancy and ensures that updating a phone number doesn't require updating thousands of order rows.

## Practical Exercise
Scenario: You are adding 'Product Category' to your app. You need to store the category name and a description of what products fit there. Is 'Category' an entity or an attribute?

**Answer:** It is an entity, because it has its own properties (description) and is shared across multiple products.
