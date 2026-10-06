---
title: "How Many Endpoints Does One Feature Really Need?"
description: "A guide to balancing API granularity by mapping business actions to the correct HTTP methods."
pubDate: 2026-10-10T05:48:00.000Z
translationKey: 086-how-many-endpoints-does-one-feature-really-need
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers struggle with 'endpoint bloat,' where they create a new URL for every single action, such as `/approveRequest` or `/cancelOrder`. This leads to a fragmented API that is hard to maintain. The goal is to map your feature's business logic to the standard REST verbs rather than creating custom paths for every state change.

## The Resource-Centric Mindset
Instead of thinking about 'actions,' think about 'resources.' A feature is usually just a set of operations on a specific object. If you are building a procurement system, the 'Purchase Request' is your resource. You don't need a separate endpoint for every step of the lifecycle; you simply modify the state of that resource.

## Mapping Actions to Methods
To determine the number of endpoints, map your requirements to these standard patterns:
- **GET /requests**: List all requests.
- **GET /requests/{id}**: View a specific request.
- **POST /requests**: Create a new request (Returns 201 Created).
- **PUT /requests/{id}**: Replace the entire request or create it if the ID is client-generated.
- **PATCH /requests/{id}**: Update a specific field, like changing the status from 'Pending' to 'Approved'.
- **DELETE /requests/{id}**: Remove the request.

## Worked Example: Procurement Approval
Imagine a manager needs to approve a request. Instead of `/requests/{id}/approve`, use a PATCH request:

```http
PATCH /requests/123
Content-Type: application/json

{ "status": "APPROVED" }
```
**Outcome:** The server updates the status and returns a 200 OK with the updated object. If the request was already cancelled, the server returns a 409 Conflict because the state transition is invalid.

## Common Mistake: The 'Action' URL
Developers often create endpoints like `POST /requests/{id}/submit`. This is a mistake because 'submitting' is just updating the status field. 
**Correction:** Use `PATCH /requests/{id}` with a body of `{"status": "SUBMITTED"}`. This keeps your API surface small and predictable.

## Practical Exercise
If you need to implement a feature where a buyer marks a request as 'Ordered', which HTTP method and URL structure should you use?

**Answer:** `PATCH /requests/{id}` with a body specifying the new status (e.g., `{"status": "ORDERED"}`).

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
