---
title: "What Is Role-Based Access Control?"
description: "A beginner's guide to managing user permissions by grouping them into roles rather than assigning rights individually."
pubDate: 2026-10-15T06:48:00.000Z
translationKey: 207-what-is-role-based-access-control
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement application. You have fifty employees, and each needs different permissions. If you assign 'can_approve_budget' or 'can_create_order' to every single user manually, you will eventually make a mistake, granting a junior employee the power to approve their own million-dollar request. This manual chaos is why we use Role-Based Access Control (RBAC).

## The Core Mechanism of RBAC
RBAC introduces a middle layer between the user and the permission. Instead of mapping User → Permission, we map User → Role → Permission. A role is essentially a collection of permissions. When a user is assigned a role, they inherit every permission associated with it. This makes management scalable; if the company policy changes, you update the role once, and every user assigned to that role is updated instantly.

## RBAC in Action: Procurement App
In our procurement system, we define three distinct roles:

| Role | Permissions |
| :--- | :--- |
| Requester | `CREATE_REQUEST`, `VIEW_OWN_REQUESTS` |
| Manager | `APPROVE_REQUEST`, `VIEW_DEPARTMENT_REQUESTS` |
| Buyer | `PLACE_ORDER`, `UPDATE_VENDOR_STATUS` |

If Sarah is a Manager, she is assigned the `MANAGER` role. When she tries to access the `/approve` endpoint, the system checks if her role contains the `APPROVE_REQUEST` permission. If yes, access is granted.

## Implementation Example
In a Java Spring application using Jakarta security, you might protect a method like this:

```java
@Service
public class ProcurementService {
    @PreAuthorize("hasRole('MANAGER')")
    public void approveRequest(Long requestId) {
        // Logic to approve the procurement request
    }
}
```

## Common Mistake: Role Explosion
A frequent error is creating too many granular roles (e.g., `MANAGER_NORTH_REGION`, `MANAGER_SOUTH_REGION`). This is called 'Role Explosion' and defeats the purpose of RBAC. Instead, use a single `MANAGER` role and handle regional restrictions using attributes or ownership checks (Attribute-Based Access Control).

## Practical Exercise
**Scenario:** You need to add a 'Compliance Auditor' who can view all requests and orders but cannot create or approve anything. How do you implement this in RBAC?

**Answer:** Create a new role called `AUDITOR` and assign it only the `VIEW_ALL` permission. Assign this role to the auditor's user account.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
