---
title: "REST API Design Mistakes Beginners Make"
description: "A guide to avoiding common architectural pitfalls when designing RESTful interfaces for professional applications."
pubDate: 2026-10-10T07:48:00.000Z
translationKey: 088-rest-api-design-mistakes-beginners-make
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. You've created an endpoint called `/updateRequest` that uses a POST method to change the status of a purchase request. While it works, other developers on your team are confused because they expect standard REST conventions. This is where most beginners struggle: they treat APIs like a set of remote functions rather than a resource-oriented architecture.

## Misusing HTTP Methods
A common mistake is using POST for everything. In a procurement app, if you want to replace an entire request object, you should use PUT. If you only want to change the status from 'Pending' to 'Approved', PATCH is the correct choice. Remember that GET must be safe and idempotent, meaning it should never modify the server state.

## Confusing 401 and 403 Errors
Beginners often use 401 Unauthorized for every permission issue. However, 401 specifically means the user is not authenticated (they aren't logged in). If a requester tries to approve their own purchase request—which only a manager should do—the server should return 403 Forbidden. The user is known, but they lack the necessary rights.

## Ignoring Proper Status Codes
Returning a 200 OK for every successful request is a missed opportunity. When a requester submits a new purchase request, the API should return 201 Created along with a `Location` header pointing to the new resource. If the request is accepted for processing but not yet finished, 202 Accepted is the professional choice.

## The Idempotency Trap
Many believe that an idempotent method must always return the same response. In reality, idempotency means the *state of the server* remains the same after multiple identical calls. For example, calling DELETE on a request ID twice will result in the resource being gone both times, even if the first call returns 204 No Content and the second returns 404 Not Found.

## Worked Example: Procurement Update
**Wrong Approach:**
`POST /changeStatus?id=123&status=Approved` $ightarrow$ returns 200 OK

**Correct Approach:**
`PATCH /requests/123` with body `{"status": "Approved"}` $ightarrow$ returns 200 OK with the updated object.

**Common Mistake:** Using PUT to update a single field. 
**Correction:** PUT replaces the entire resource. If you send only the status via PUT, you might accidentally wipe out the requester's name and the item list.

## Practical Exercise
Which status code should you return if a user tries to create a purchase request that conflicts with an existing one (e.g., same reference number)?

**Answer:** 409 Conflict.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
