---
title: "Endpoints Should Represent Resources, Not Buttons"
description: "Learn how to shift your API design from action-based RPC style to resource-oriented REST architecture."
pubDate: 2026-10-09T17:48:00.000Z
translationKey: 074-endpoints-should-represent-resources-not-buttons
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. You might be tempted to create an endpoint like `/approveRequest?id=123`. This feels intuitive because it mimics a button click in a user interface. However, this is a common mistake called 'RPC-style' design. In a true REST API, endpoints should represent *things* (resources), not *actions* (buttons).

## The Resource Mindset
Instead of thinking about what the user *does*, think about what the user *changes*. An approval is not a standalone action; it is a state change of a `PurchaseRequest` resource. By treating the request as a resource, you use standard HTTP methods to define the operation. This makes your API predictable for any developer who understands HTTP.

## From Actions to States
When you move from buttons to resources, your URL structure changes. Instead of `/submitOrder` or `/cancelOrder`, you use `/orders`. The action is determined by the HTTP verb:

| Action | RPC Style (Wrong) | REST Style (Right) | HTTP Method |
| :--- | :--- | :--- | :--- |
| Create Request | `/createRequest` | `/requests` | POST |
| Approve Request | `/approveRequest` | `/requests/{id}/status` | PUT/PATCH |
| Delete Request | `/deleteRequest` | `/requests/{id}` | DELETE |

## Worked Example: Procurement Approval
In a procurement app, when a manager approves a request, they are updating the status of that resource. 

**Request:**
`PATCH /requests/456` 
`Content-Type: application/json` 
`{ "status": "APPROVED" }` 

**Outcome:**
The server updates the record and returns `200 OK` with the updated resource representation. If the request was already approved and the change is redundant, it remains idempotent. If the request was already cancelled, the server should return `409 Conflict` because the state transition is invalid.

## Common Mistake: The Verb in the URL
A frequent error is mixing styles, such as `POST /requests/456/approve`. This is redundant because the `POST` method already implies an action. The correction is to target the resource property: `PATCH /requests/456` or `PUT /requests/456/status`.

## Practical Exercise
How would you redesign the endpoint `POST /orders/12/shipItem` to follow resource-oriented design?

**Answer:** Use `PATCH /orders/12` with a body `{ "status": "SHIPPED" }` or target a sub-resource like `PUT /orders/12/shipping-status`.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
