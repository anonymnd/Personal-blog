---
title: "CRUD Is Not the Same Thing as Business Logic"
description: "Learn why mapping your API directly to database operations creates rigid software and how to separate resource management from business rules."
pubDate: 2026-10-09T16:48:00.000Z
translationKey: 073-crud-is-not-the-same-thing-as-business-logic
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement app. You have a `PurchaseRequest` entity. A beginner might create a `PUT /requests/{id}` endpoint that simply updates any field in the database. However, in the real world, a requester cannot change the price after a manager has already approved the request. If your API is just a CRUD (Create, Read, Update, Delete) wrapper, you end up putting complex `if/else` checks inside your update method, making it a bloated mess.

## The CRUD Trap
CRUD is about data persistence. It asks: "How do I store this record?" Business logic is about domain rules. It asks: "Is this action allowed given the current state of the system?" When you treat your API as a database interface, you expose your internal schema and force the client to understand your business rules to avoid receiving 400 or 409 errors.

## Resource-Based vs. Action-Based
Instead of a generic `UPDATE`, define specific transitions. For a procurement request, instead of `PUT /requests/123` with a status field, use a specific endpoint like `POST /requests/123/approvals`. This explicitly signals a business action rather than a data modification.

## Worked Example: The Approval Flow
Consider a request that needs manager approval. 

**Wrong (Pure CRUD):**
`PUT /requests/123` 
Body: `{"status": "APPROVED"}`
(The server must now check if the user is a manager and if the request is in 'PENDING' state).

**Right (Business Logic):**
`POST /requests/123/approvals`
Body: `{"managerId": "MGR-01", "comments": "Budget verified"}`

**Outcome:** The API returns `200 OK` or `204 No Content` if successful. If the request was already approved, it returns `409 Conflict`, indicating a state violation rather than a generic data error.

## Common Mistake: The God-Endpoint
Developers often create one `PATCH` endpoint that handles every possible change. 
*Correction:* Split the logic. Use `PATCH` for simple profile updates (e.g., changing a description) but use dedicated action endpoints for state transitions (e.g., `submit`, `approve`, `cancel`).

## Practical Exercise
In a procurement app, a Buyer needs to mark a request as 'Ordered'. Should this be a `PUT /requests/{id}` with a status change, or a `POST /requests/{id}/order`?

**Answer:** `POST /requests/{id}/order` is better because 'Ordering' is a business process that likely triggers other events (like sending an email to a vendor), not just a column update in a table.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
