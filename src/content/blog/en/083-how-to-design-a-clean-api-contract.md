---
title: "How to Design a Clean API Contract"
description: "Learn how to define a predictable and scalable interface between your client and server using REST standards."
pubDate: 2026-10-10T02:48:00.000Z
translationKey: 083-how-to-design-a-clean-api-contract
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system where a requester submits a purchase request. If the API contract is messy—using inconsistent naming or vague status codes—the frontend team will constantly ask you what a 'status 200' actually means for a specific request, or why some endpoints use `userId` while others use `user_id`.

## Defining Resource-Based Endpoints
A clean contract starts with nouns, not verbs. Instead of `/createRequest` or `/approveRequest`, use `/requests`. The action is defined by the HTTP method. For our procurement app, `POST /requests` creates a new request, while `GET /requests/{id}` retrieves it. This makes the API intuitive and predictable for any developer.

## Mastering HTTP Methods and Idempotency
Choosing the right method ensures the client knows the effect of their call. `GET` is safe and idempotent, meaning it doesn't change state. `PUT` replaces the entire resource and is idempotent; sending the same `PUT` request ten times results in the same state. `PATCH` is used for partial updates (e.g., just changing the status to 'Approved') and is not inherently idempotent. `DELETE` is idempotent regarding the server state, even if the response code changes from 204 (No Content) to 404 (Not Found) after the first call.

## Precise Status Codes
Avoid returning `200 OK` for everything. Use specific codes to communicate the outcome:
- `201 Created`: Returned after a successful `POST` to create a request, usually including a `Location` header.
- `202 Accepted`: For asynchronous processing (e.g., the request is queued for manager approval).
- `401 Unauthorized`: Missing or invalid authentication.
- `403 Forbidden`: The user is authenticated but doesn't have permission to approve the request.
- `409 Conflict`: The request is already approved and cannot be edited.

## Worked Example: Request Approval
When a manager approves a procurement request, the contract should look like this:

**Request:** `PATCH /requests/REQ-123` 
**Body:** `{"status": "APPROVED"}`
**Response:** `200 OK` with the updated request body.

**Common Mistake:** Using `POST /updateRequest?id=123`. 
**Correction:** Use `PATCH` or `PUT` on the specific resource URI to follow REST standards.

## Practical Exercise
Which HTTP method and status code should be used to completely replace an existing procurement request's details, and what is the result if the operation succeeds without returning a body?

**Answer:** Use `PUT`. The status code should be `204 No Content`.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
