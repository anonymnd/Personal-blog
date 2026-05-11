---
title: "GET, POST, PUT, PATCH and DELETE Explained Properly"
description: "A comprehensive guide to understanding the semantic differences and correct usage of standard HTTP methods in REST API design."
pubDate: 2026-10-09T19:48:00.000Z
translationKey: 076-get-post-put-patch-and-delete-explained-properly
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. You have a request for a new laptop, but you aren't sure whether to use PUT or PATCH to update the quantity, or if POST is the only way to create the request. Choosing the wrong method leads to APIs that are unpredictable and break standard caching or retry logic.

## The Read and Create Duo: GET and POST
`GET` is used to retrieve data. It is considered 'safe' because it should never modify the server state. It is also idempotent, meaning calling it ten times yields the same result. `POST` is typically used to create a new resource. Unlike GET, POST is neither safe nor idempotent; sending the same POST request twice usually creates two identical records.

## The Update Debate: PUT vs PATCH
`PUT` is for complete replacement. If you update a procurement request using PUT, you must send the entire object. If you omit a field, the server might set it to null. It is idempotent because replacing a resource with the same data repeatedly doesn't change the final state. `PATCH` is for partial updates. You only send the field you want to change (e.g., just the status). PATCH is not inherently idempotent because some operations (like incrementing a value) change the state every time they are called.

## Removing Resources: DELETE
`DELETE` removes a resource. It is idempotent regarding the server state: once a resource is gone, it stays gone. However, the response code might change (204 No Content the first time, 404 Not Found subsequently), but the end state of the server remains the same.

## Worked Example: Procurement Request

| Action | Method | Endpoint | Payload | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| View Request | GET | `/requests/123` | None | 200 OK + JSON |
| Create Request | POST | `/requests` | `{ "item": "Laptop" }` | 201 Created |
| Replace Request | PUT | `/requests/123` | `{ "item": "MacBook", "qty": 1 }` | 200 OK |
| Update Status | PATCH | `/requests/123` | `{ "status": "Approved" }` | 200 OK |
| Cancel Request | DELETE | `/requests/123` | None | 204 No Content |

## Common Mistake: Using POST for everything
Developers often use POST for updates because it's "easier." However, this ignores the semantic meaning of REST. If a client retries a failed POST request, they might accidentally create duplicate orders. Using PUT for replacements ensures that retries are safe.

## Practical Exercise
Which method should you use to change only the delivery address of an existing order without sending the rest of the order details?

**Answer:** `PATCH`, because it is designed for partial modifications.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
