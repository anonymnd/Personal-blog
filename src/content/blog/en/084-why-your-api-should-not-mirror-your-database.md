---
title: "Why Your API Should Not Mirror Your Database"
description: "Learn how to decouple your API representation from your database schema to ensure long-term maintainability and security."
pubDate: 2026-10-10T03:48:00.000Z
translationKey: 084-why-your-api-should-not-mirror-your-database
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Your database has a table `purchase_requests` with columns like `req_id`, `user_id`, `status_code`, and `internal_audit_flag`. If you simply return this table as a JSON object in your API, any change to your database schema—like renaming `req_id` to `request_id`—will instantly break every mobile app and frontend using your service. This tight coupling is a common trap for beginners.

## The Danger of Leaking Schemas
When your API mirrors your database, you leak internal implementation details. If a client sees `status_code: 4`, they have no idea what that means without internal documentation. More dangerously, if you return the whole row, you might accidentally expose sensitive fields like `internal_audit_flag` to a requester who should only see the request status.

## The DTO Pattern
To solve this, use Data Transfer Objects (DTOs). A DTO is a simple class that defines exactly what the API should send or receive, regardless of how it is stored. In a Jakarta EE environment, your entity might be complex, but your DTO remains clean.

```java
// Database Entity
public class PurchaseRequestEntity {
    private Long reqId;
    private Integer statusCode;
    private Boolean internalAuditFlag;
}

// API DTO
public class PurchaseRequestDTO {
    private String requestId;
    private String statusLabel; // "Pending", "Approved"
}
```

## Worked Example: Procurement Approval
Consider a manager approving a request. The database needs an `updated_by` timestamp and a `version` column for locking. However, the API client only needs to send the approval decision.

**Request:** `PATCH /requests/123` 
`{ "status": "APPROVED" }` 

**Outcome:** The server receives the DTO, fetches the entity, updates the `statusCode` to the internal value (e.g., `2`), sets the `updated_by` timestamp internally, and returns a `200 OK` with the updated `PurchaseRequestDTO`.

## Common Mistake: The "Pass-Through" Controller
Many developers write controllers that return the Entity directly: `return repository.findById(id);`. 
**Correction:** Always map the Entity to a DTO using a mapper method or a library. This ensures that adding a column to the database doesn't change the API contract.

## Practical Exercise
Your database has a `User` table with `password_hash` and `email`. You need to create a `GET /profile` endpoint.

**Question:** Should you return the `User` entity directly?
**Answer:** No. Create a `UserProfileDTO` containing only the `email` (and other public fields), omitting the `password_hash` entirely to prevent security leaks.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
