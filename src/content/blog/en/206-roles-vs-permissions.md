---
title: "Model Roles and Permissions Without Losing Resource Ownership"
description: "Implementing a hybrid RBAC and ABAC model to handle role-based access and specific resource ownership in a museum context."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 206-roles-vs-permissions
seriesOrder: 44
locale: en
tags: ["security","learning-series"]
draft: false
---

## The Gap Between Roles and Ownership

Role-Based Access Control (RBAC) is efficient for broad categorization. In a museum, assigning a user the role of `CURATOR` allows them to access the curation dashboard. However, RBAC alone fails when you need to specify that Curator A can edit 'The Rosetta Stone' exhibit, but Curator B cannot. If you simply check `hasRole('CURATOR')`, you grant global edit permissions, violating the principle of least privilege.

To solve this, we combine RBAC (what you are) with Attribute-Based Access Control or Ownership checks (what you own/are assigned to). This prevents 'privilege creep' where a `FINANCE` role might accidentally inherit editing permissions because they share a high-level administrative group.

## Designing the Permission Schema

Instead of hardcoding roles into business logic, we decouple them using a permission-based approach. Roles act as containers for permissions, and resource assignments act as the final gate.

### The Data Model

We use a many-to-many relationship between users and roles, and a specific assignment table for resource ownership.

```java
// Illustrative Domain Model
public record User(Long id, String username, Set<Role> roles) {}

public record Role(Long id, String name, Set<Permission> permissions) {}

public record Permission(Long id, String code) {}

// The critical link for resource ownership
public record ResourceAssignment(
    Long userId,
    Long resourceId,
    String resourceType,
    String accessLevel // e.g., "EDITOR", "VIEWER"
) {}
```

## Worked Example: Museum Exhibit Access

**Scenario:**
- **Volunteer:** Can view exhibits.
- **Curator:** Can edit exhibits, but only those they are assigned to.
- **Finance:** Can view financial reports of exhibits, but cannot edit the exhibit content.

### The Enforcement Logic

When a request comes in to edit an exhibit, the system must pass two checks: the **Functional Check** (Does the role allow editing in general?) and the **Ownership Check** (Is this specific user allowed to edit this specific exhibit?).

```java
public class ExhibitSecurityService {
    private final ResourceAssignmentRepository assignmentRepo;

    public ExhibitSecurityService(ResourceAssignmentRepository repo) {
        this.assignmentRepo = repo;
    }

    public boolean canEditExhibit(User user, Long exhibitId) {
        // 1. Functional Check: Does the user have the 'EXHIBIT_EDIT' permission via any role?
        boolean hasPermission = user.roles().stream()
            .flatMap(role -> role.permissions().stream())
            .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

        if (!hasPermission) return false;

        // 2. Ownership Check: Is the user assigned as an EDITOR for this specific exhibit?
        return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
            .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
            .orElse(false);
    }
}
```

### Trace of Outcomes

1. **Volunteer** tries to edit Exhibit 101 → Functional Check fails (no `EXHIBIT_EDIT` permission) → **Denied**.
2. **Finance** tries to edit Exhibit 101 → Functional Check fails (Finance has `REPORT_VIEW`, not `EXHIBIT_EDIT`) → **Denied**.
3. **Curator A** (assigned to Exhibit 101) tries to edit Exhibit 101 → Functional Check passes → Ownership Check passes → **Allowed**.
4. **Curator A** tries to edit Exhibit 202 (not assigned) → Functional Check passes → Ownership Check fails → **Denied**.

## Failure Cases and Edge Cases

This design grants the union of role permissions, then checks an exhibit-specific assignment. Keep resource type in the lookup so an assignment for a financial report with the same numeric ID cannot authorize an exhibit edit. findForResource is a custom repository method, not the standard JpaRepository findById signature.

An authenticated principal must supply the user identity; never accept roles or user ID from an untrusted request body. Enforce the policy on every protected operation and define how assignment changes race with edits. A separate reassignment permission can recover an unassigned exhibit without granting everyone global edit access.

Direct user grants can be audited if deliberately modeled; this project chooses roles for simplicity, not because other models are impossible. A super-curator bypass is an explicit powerful permission that requires restricted assignment and audit. It must still respect the domain’s tenant or museum boundary.
## Exercise

**Task:** Modify the logic to allow a `SUPER_CURATOR` role to edit *any* exhibit regardless of the `ResourceAssignment` table, while keeping the standard `CURATOR` restricted to their assigned exhibits.

**Answer:**
Update the `canEditExhibit` method to check for a `SUPER_CURATOR` role before the ownership check:
```java
public boolean canEditExhibit(User user, Long exhibitId) {
    boolean isSuper = user.roles().stream().anyMatch(r -> r.name().equals("SUPER_CURATOR"));
    if (isSuper) return true; // Bypass ownership check

    boolean hasPermission = user.roles().stream()
        .flatMap(role -> role.permissions().stream())
        .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

    if (!hasPermission) return false;

    return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
        .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
        .orElse(false);
}
```

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
