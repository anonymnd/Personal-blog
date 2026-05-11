---
title: "How Do You Know Which Endpoints Your Application Needs?"
description: "A guide to deriving REST API endpoints from business requirements using a resource-centric approach."
pubDate: 2026-10-09T15:48:00.000Z
translationKey: 072-how-do-you-know-which-endpoints-your-application-needs
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Many developers start by imagining the database tables and then creating endpoints that mirror those tables. This leads to a 'leaky abstraction' where the API is just a database wrapper. The real challenge is translating a business process—like a procurement workflow—into a set of logical resources.

## Identify the Core Resources
Instead of thinking about functions, think about nouns. In a procurement app, you don't have a 'submitRequest' function; you have a `PurchaseRequest` resource. Identify the primary entities and their relationships. A `PurchaseRequest` might be linked to a `User` (requester) and a `Department`.

## Map the Business Lifecycle
Trace the path of a resource from creation to completion. 
1. **Submission**: A requester creates a request (`POST /purchase-requests`).
2. **Review**: A manager views pending requests (`GET /purchase-requests?status=pending`).
3. **Decision**: A manager approves or rejects it (`PATCH /purchase-requests/{id}`).
4. **Execution**: A buyer converts the approved request into an order (`POST /orders`).

## Choosing the Right HTTP Method
Once you have the resource, the action determines the method. Use `GET` for retrieval, `POST` for creation, `PUT` for full replacement, and `PATCH` for partial updates. For example, changing only the status of a request from 'Pending' to 'Approved' is a partial modification, making `PATCH` the appropriate choice.

## Worked Example: The Approval Flow
Suppose a manager needs to approve a request. 
**Request:** `PATCH /purchase-requests/REQ-123` 
**Body:** `{"status": "APPROVED"}`
**Outcome:** The server returns `200 OK` with the updated representation or `204 No Content`. If the request was already cancelled, the server should return `409 Conflict` because the state transition is invalid.

## Common Mistake: RPC Style Endpoints
Avoid naming endpoints like `/approveRequest` or `/updateUser`. This is Remote Procedure Call (RPC) style, not REST. 
**Correction:** Use `/purchase-requests/{id}` with a `PATCH` method. The 'approval' is a change in the resource's state, not a separate standalone action.

## Practical Exercise
If you need to allow a buyer to delete a mistaken order, what endpoint and method would you use?

**Answer:** `DELETE /orders/{id}`. This removes the resource and should be idempotent, meaning repeating the call doesn't change the state further after the first deletion.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
