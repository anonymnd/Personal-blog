---
title: "Model Users, Organizations and Tenant Memberships"
description: "A deep dive into B2B multi-tenancy modeling where users belong to multiple organizations with tenant-scoped uniqueness."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
seriesOrder: 9
locale: en
tags: ["database-design","learning-series"]
draft: false
---

## The Multi-Tenant Membership Challenge

In B2B software, a common mistake is treating a User as a direct child of an Organization. This fails when a consultant works for multiple firms simultaneously. To support this, we must decouple the identity (User) from the organizational context (Organization) using an explicit membership entity.

Consider a consultant who belongs to two different firms. Each firm has its own billing contacts and project lists. The consultant must switch contexts between these firms, and their identity (email/password) remains global, but their access and profile details may vary by tenant.

## The Logical Model

To implement this, we use a Many-to-Many relationship resolved by a join entity. This allows us to store metadata about the relationship itself, such as the date they joined the organization or their specific tenant-level status.

### Entity Definitions
- **User**: Global identity (e.g., `userId`, `email`, `passwordHash`).
- **Organization**: The tenant entity (e.g., `orgId`, `companyName`, `billingAddress`).
- **Membership**: The link between the two (e.g., `membershipId`, `userId`, `orgId`, `joinedAt`).

### Tenant-Scoped Uniqueness
One critical requirement is ensuring that certain attributes are unique *only within a tenant*. For example, a user might have a specific "Username" or "Employee ID" inside Firm A, which might overlap with an ID in Firm B. This attribute must live in the `Membership` entity, not the `User` entity.

## Worked Example: The Consultant Scenario

Let's trace the data for a consultant, Sarah, who works for "TechCorp" and "DesignStudio".

### Data Trace

**Users Table**
| userId | email |
| :--- | :--- |
| U1 | sarah@email.com |

**Organizations Table**
| orgId | companyName |
| :--- | :--- |
| O1 | TechCorp |
| O2 | DesignStudio |

**Memberships Table**
| membershipId | userId | orgId | tenantUsername |
| :--- | :--- | :--- | :--- |
| M1 | U1 | O1 | sarah_tech |
| M2 | U1 | O2 | sarah_design |

### Resource Tenant Checks
When Sarah requests a project, the system must not simply check if she is a user. It must verify the membership link. 

**The Logic Flow:**
1. Request arrives: `GET /projects/{projectId}`
2. System identifies the `orgId` associated with `{projectId}`.
3. System queries: `SELECT 1 FROM memberships WHERE userId = :currentUserId AND orgId = :projectOrgId`.
4. If no record exists, access is denied, even if Sarah is a valid user in the system.

## Failure Cases

- **The Global Leak**: Storing `orgId` directly on the `Project` entity but forgetting to check the `Membership` table during the request. This allows any authenticated user to access any project if they guess the ID.
- **The Identity Collision**: Placing the `tenantUsername` in the `User` table. This prevents Sarah from having different aliases across her two firms.
- **The Orphaned Membership**: Deleting an Organization without cascading the deletion to Memberships, leading to users belonging to non-existent tenants.

## Exercise

**Scenario**: You need to add a "Join Date" and a "Membership Status" (Active/Pending) to the model. Where do these attributes belong, and why?

**Answer**: Both belong in the `Membership` entity. The "Join Date" is specific to when the user joined a *particular* organization, not when the user account was created. The "Status" is tenant-specific; a user could be "Active" in Firm A but "Pending" in Firm B.
