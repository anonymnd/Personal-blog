---
title: "Roles vs Permissions"
description: "Learn how to decouple user identity from specific actions to build a scalable authorization system."
pubDate: 2026-10-15T05:48:00.000Z
translationKey: 206-roles-vs-permissions
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. At first, you create a 'Manager' role and give them access to the approval page. Later, you realize that a 'Senior Buyer' also needs to approve requests, but they shouldn't have access to the manager's payroll reports. If you only use roles, you end up creating dozens of overlapping roles like 'ManagerWithBuyerRights', which quickly becomes a maintenance nightmare.

## The Conceptual Difference
Roles are essentially collections of permissions. A Role answers the question 'Who are you in the organization?' (e.g., Admin, Requester), while a Permission answers 'What are you allowed to do?' (e.g., `request:create`, `request:approve`). By assigning permissions to roles, and roles to users, you create a layer of abstraction that makes your security policy flexible.

## Implementing the Mechanism
In a Java Spring application using Jakarta EE, you shouldn't check for roles directly in your business logic. Instead, check for the specific permission required for the action.

```java
// Avoid this: if (user.hasRole("MANAGER")) { ... }

// Do this: check for the specific permission
if (user.hasPermission("request:approve")) {
    approvalService.process(requestId);
}
```

## Worked Example: Procurement Workflow
Consider these mappings:
- **Role: Requester** → Permissions: `request:create`, `request:view_own`.
- **Role: Manager** → Permissions: `request:approve`, `request:view_all`.
- **Role: Buyer** → Permissions: `order:place`, `request:view_all`.

If a user is a 'Manager', they can approve a request because the `request:approve` permission is linked to their role. If the company decides that Buyers should also approve small requests, you simply add `request:approve` to the Buyer role without changing a single line of Java code.

## Common Mistake: Role Bloat
A frequent error is creating a new role for every single edge case. For example, creating a `RegionalManager` and a `GlobalManager` just because their data scope differs. 

**Correction:** Keep the role as `Manager` and use a separate 'Scope' or 'Tenant' attribute to filter which data they can see, while keeping the permissions (`request:approve`) the same.

## Practical Exercise
**Scenario:** You need to add a 'Compliance Auditor' who can see all requests and orders but cannot create or approve anything. Which approach is better?
1. Create a role 'Auditor' and give it `request:view_all` and `order:view_all` permissions.
2. Create a role 'Auditor' and give it the 'Manager' role.

**Answer:** Option 1. Giving them the Manager role would incorrectly grant them `request:approve` permissions.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
