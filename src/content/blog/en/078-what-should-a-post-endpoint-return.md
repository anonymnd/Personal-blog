---
title: "What Should a POST Endpoint Return?"
description: "A guide to selecting the correct HTTP status codes and response bodies for POST requests in REST API design."
pubDate: 2026-10-09T21:48:00.000Z
translationKey: 078-what-should-a-post-endpoint-return
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. A user submits a purchase request, but you aren't sure if you should return the created object, a simple success message, or just a status code. Choosing the wrong response can confuse frontend developers and break API consistency.

## The Gold Standard: 201 Created
When a POST request successfully creates a new resource, the most accurate response is `201 Created`. This tells the client that the server didn't just process the request, but actually generated a new entity. To be fully REST-compliant, you should include a `Location` header containing the URI of the new resource.

## Handling Asynchronous Processing: 202 Accepted
In procurement, some requests require manual manager approval before they are fully "created" in the system. If the server accepts the request but hasn't finished processing it, return `202 Accepted`. This indicates the request is valid and queued, but the final outcome is pending.

## The Generic Success: 200 OK or 204 No Content
If the POST request is used for an action (like triggering a calculation) rather than creating a resource, `200 OK` is appropriate. If the operation succeeded but there is no meaningful data to send back, use `204 No Content` to save bandwidth.

## Worked Example: Purchase Request
Consider an endpoint `/api/requests`:

**Request:**
`POST /api/requests` 
`{ "item": "Laptop", "quantity": 1 }`

**Successful Response:**
Status: `201 Created`
Header: `Location: /api/requests/123`
Body: `{"id": 123, "status": "PENDING"}`

## Common Mistake: The 200-Everything Trap
Many developers return `200 OK` for every successful request. While it works, it hides the semantic meaning of the operation. For example, returning `200` instead of `201` prevents the client from knowing for sure that a new resource was persisted. Always prefer the most specific status code available.

## Practical Exercise
Your procurement app has a `/api/orders/submit` endpoint that starts a long-running background process to contact vendors. Which status code should it return immediately after receiving the request?

**Answer:** `202 Accepted`, because the process is asynchronous and not yet complete.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
