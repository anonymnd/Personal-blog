---
title: "PUT vs PATCH: What’s the Real Difference?"
description: "A clear guide to choosing between full resource replacement and partial updates in REST API design."
pubDate: 2026-10-09T20:48:00.000Z
translationKey: 077-put-vs-patch-what-s-the-real-difference
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement app. A manager needs to update a purchase request. If they only want to change the status from 'Pending' to 'Approved', should the API send the entire request object back to the server, or just the status field? This is the core dilemma between PUT and PATCH.

## The Mechanism of PUT
PUT is designed for replacement. When you send a PUT request, you are telling the server: "Take this entire representation and replace whatever is at this URI with it." If the resource exists, it is overwritten. If it doesn't exist, some APIs allow PUT to create it. A key characteristic of PUT is idempotency: if you send the exact same PUT request ten times, the final state of the server remains the same as if you sent it once.

## The Mechanism of PATCH
PATCH is used for partial modifications. Instead of sending the whole object, you send only the changes. This is more efficient for large resources. Unlike PUT, PATCH is not inherently idempotent. For example, if a PATCH request adds an item to a list, repeating the request might add the same item multiple times, changing the state with every call.

## Worked Example: Procurement Request
Consider a request object: `{ "id": 101, "item": "Laptop", "qty": 1, "status": "Pending" }`.

**Using PUT:**
To change the quantity to 2, you must send the full object:
`PUT /requests/101` 
`{ "id": 101, "item": "Laptop", "qty": 2, "status": "Pending" }` 
Outcome: The server replaces the old record with this new version.

**Using PATCH:**
To change the quantity to 2, you send only the delta:
`PATCH /requests/101` 
`{ "qty": 2 }` 
Outcome: The server updates only the `qty` field and leaves others untouched.

## Common Mistake: The Partial PUT
A frequent error is using PUT but only sending the fields that changed. If the server strictly follows REST standards, a PUT request with only `{ "qty": 2 }` might wipe out the `item` and `status` fields, setting them to null because they were missing from the replacement payload. To fix this, either use PATCH for partials or ensure the client fetches the full object before sending a PUT.

## Practical Exercise
Scenario: You need to update a user's email address in a profile containing 50 different fields. Which method is more appropriate and why?

**Answer:** PATCH, because sending 49 unchanged fields via PUT would be inefficient and increase the risk of accidentally overwriting data with stale values.

## A contract, not a database overwrite
PUT replaces the resource representation defined by the API contract, not every column in a database row. Server-owned fields need not be writable by the client. Idempotency concerns the intended effect; logs may still record every attempt. For concurrent edits, both PUT and PATCH may need version checks, such as an ETag with `If-Match`, to avoid lost updates.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
