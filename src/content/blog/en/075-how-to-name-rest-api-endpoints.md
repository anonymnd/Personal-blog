---
title: "How to Name REST API Endpoints"
description: "A practical guide to designing intuitive, resource-oriented URLs for professional RESTful services."
pubDate: 2026-10-09T18:48:00.000Z
translationKey: 075-how-to-name-rest-api-endpoints
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Many developers start by naming endpoints like `/getAllRequests` or `/updateOrder`, treating the URL like a function call. This approach leads to a bloated API that is hard to maintain because every new action requires a new unique name. The core shift in REST is moving from 'actions' to 'resources'.

## Focus on Nouns, Not Verbs
In REST, the URL should represent the *thing* (the resource), while the HTTP method represents the *action*. Instead of `/createRequest`, use `POST /requests`. The verb is implied by the method. Always use plural nouns for collections to keep your API consistent. For example, `/users` is better than `/user` because it clearly represents a collection of resources.

## Handling Resource Hierarchies
When a resource belongs to another, use a nested structure. In a procurement app, a specific request has many line items. Instead of `/getRequestItems?requestId=123`, use `/requests/123/items`. This creates a logical path that mirrors the data relationship: Collection → ID → Sub-collection.

## A Worked Example: Procurement Workflow
Consider a system where a requester submits a purchase request for manager approval.

| Action | Endpoint | Method | Success Code |
| :--- | :--- | :--- | :--- |
| Submit Request | `/requests` | `POST` | 201 Created |
| View Request | `/requests/45` | `GET` | 200 OK |
| Approve Request | `/requests/45/status` | `PATCH` | 200 OK |
| Cancel Request | `/requests/45` | `DELETE` | 204 No Content |

Example request excerpt:
`PATCH /requests/45/status` 
`{ "status": "APPROVED" }` 
Outcome: The resource state is partially updated without replacing the entire request object.

## Common Mistake: Over-nesting
Developers often create deep chains like `/departments/5/managers/2/requests/10/items/1`. This makes URLs fragile and overly long. If a resource is frequently accessed directly, promote it to a top-level endpoint. Instead of the chain above, use `/request-items/1` for direct access.

## Practical Exercise
How would you name the endpoint to retrieve all orders associated with a specific buyer (ID: 99)?

**Answer:** `GET /buyers/99/orders`

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
