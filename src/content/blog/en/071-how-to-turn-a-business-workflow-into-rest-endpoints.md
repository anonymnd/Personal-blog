---
title: "How to Turn a Business Workflow Into REST Endpoints"
description: "A guide on mapping real-world business processes to a structured set of RESTful API resources and methods."
pubDate: 2026-10-09T14:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Many developers struggle when they have a complex business process—like a procurement cycle—and don't know how to translate it into a REST API. The common mistake is creating 'action-based' endpoints like `/approveRequest` or `/submitOrder`, which treats the API like a remote procedure call rather than a resource-oriented system.

## Identifying the Core Resources
To start, ignore the actions and look for the 'nouns'. In a procurement workflow, the primary resource is the `PurchaseRequest`. The workflow isn't a single endpoint; it is a series of state transitions for that resource. You identify the lifecycle: a request is created, then it moves to a 'Pending' state, then 'Approved' or 'Rejected', and finally 'Ordered'.

## Mapping Workflow Steps to HTTP Methods
Each step in the business process corresponds to a specific HTTP method based on the intent. Creating a request uses `POST`. Updating the status of that request to 'Approved' is a modification of the resource state, which typically uses `PATCH` for partial updates or `PUT` for full replacements.

## Worked Example: Procurement Workflow
Imagine a requester submitting a laptop request. 

1. **Submission**: `POST /purchase-requests` 
   - Payload: `{"item": "Laptop", "amount": 1200}`
   - Outcome: `201 Created` with a `Location` header pointing to `/purchase-requests/123`.

2. **Approval**: The manager approves the request.
   - Request: `PATCH /purchase-requests/123` 
   - Payload: `{"status": "APPROVED"}`
   - Outcome: `200 OK` with the updated representation.

3. **Ordering**: The buyer marks it as ordered.
   - Request: `PATCH /purchase-requests/123` 
   - Payload: `{"status": "ORDERED", "orderDate": "2023-10-01"}`
   - Outcome: `204 No Content` (if no body is returned).

## Handling State Conflicts
Business workflows often have rules. For example, a request cannot be 'Ordered' if it hasn't been 'Approved'. If a buyer tries to order a pending request, the API should not return a generic error. Instead, use `409 Conflict` to indicate that the resource's current state prevents this transition.

## Common Mistake: The Verb-Based URL
Avoid URLs like `/purchase-requests/123/approve`. This is a common pitfall. Instead, treat the approval as a change to the `status` field of the resource. This keeps your API consistent and follows the REST constraint of using nouns for resources.

## Practical Exercise
How would you model the action of a manager rejecting a request in this system?

**Check**: Use `PATCH /purchase-requests/{id}` with a payload `{"status": "REJECTED"}` and return `200 OK` or `204 No Content`.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
