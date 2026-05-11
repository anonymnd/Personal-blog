---
title: "User Accounts vs Organizations: How to Model B2B Applications"
description: "Learn how to decouple user identities from business entities to support multi-tenancy in B2B software."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Initially, you think a user *is* the company. But then a requirement hits: a manager needs to oversee three different subsidiary companies using one email address. If your `User` table contains the `company_name`, you are stuck. This is the classic struggle of modeling B2B applications where the identity (who is logging in) is different from the organization (who owns the data).

## The Conceptual Split
In a B2B model, you must separate the **User Account** from the **Organization**. The User Account handles authentication (email, password), while the Organization handles business logic (tax ID, billing address, procurement limits). The link between them is a membership relationship. This allows a single person to belong to multiple organizations with different roles in each.

## Designing the Relationship
To implement this, you need a join entity, often called `Membership` or `OrganizationUser`. This table doesn't just link IDs; it stores the context of the relationship, such as the user's role within that specific company.

| Entity | Responsibility |
| :--- | :--- |
| User | Authentication & Profile |
| Organization | Business Identity & Settings |
| Membership | Role & Permissions per Org |

## Worked Example: Procurement Flow
Consider a requester submitting a purchase order. The system must know not just who the user is, but which organization they are acting for.

```java
// Illustrative excerpt of the domain model
public class User {
    private Long id;
    private String email;
}

public class Organization {
    private Long id;
    private String companyName;
}

public class Membership {
    private Long userId;
    private Long organizationId;
    private String role; // e.g., "MANAGER", "BUYER"
}
```
When a request is created, the `PurchaseRequest` entity should reference the `OrganizationId`, not just the `UserId`. This ensures that if a user leaves the company, the historical procurement records remain tied to the organization.

## Common Mistake: Hard-coding Org IDs
A frequent error is adding an `organization_id` directly to the `User` table. This creates a 1:N relationship, meaning a user can only ever belong to one company. The correction is to move this foreign key to a separate `Membership` table to allow a M:N (Many-to-Many) relationship.

## Practical Exercise
If a user is a 'Manager' in Org A and a 'Requester' in Org B, where should the `role` column be placed: in the `User` table, the `Organization` table, or the `Membership` table?

**Answer:** The `Membership` table, because the role depends on the specific relationship between the user and the organization.
