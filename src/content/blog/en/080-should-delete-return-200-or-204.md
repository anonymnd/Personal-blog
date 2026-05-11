---
title: "Should DELETE Return 200 or 204?"
description: "A guide to choosing the correct HTTP status code when implementing a DELETE endpoint in a REST API."
pubDate: 2026-10-09T23:48:00.000Z
translationKey: 080-should-delete-return-200-or-204
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. A manager deletes a pending purchase request. The frontend sends a DELETE request, but the developer is unsure whether to return a 200 OK with a confirmation message or a 204 No Content. This choice affects how the client handles the response and the overall API consistency.

## Understanding 204 No Content
The 204 status code is the most common choice for DELETE operations. It explicitly tells the client that the action was successful, but there is no representation to return in the response body. This is efficient because it reduces bandwidth and clearly signals that the resource is gone.

## Understanding 200 OK
A 200 OK is appropriate when the API needs to return a response body. This might include a status message, a copy of the deleted entity for undo purposes, or a summary of the operation. If your procurement app needs to tell the user exactly which request ID was removed, 200 is the way to go.

## Worked Example: Procurement Request
Consider a request to delete a purchase order:
`DELETE /api/orders/ORD-123`

**Scenario A (204 No Content):**
Response: `HTTP/1.1 204 No Content`
Outcome: The client knows the order is deleted and simply removes the item from the UI list.

**Scenario B (200 OK):**
Response: `HTTP/1.1 200 OK`
Body: `{"message": "Order ORD-123 has been successfully deleted", "deletedAt": "2023-10-27T10:00Z"}`
Outcome: The client displays a specific success toast notification using the returned message.

## Common Mistake: Confusing Idempotency with Response Codes
A common error is thinking that because DELETE is idempotent, it must always return the same code. Idempotency means the *state* of the server remains the same after multiple calls, not that the *response* must be identical. For example, the first DELETE might return 204, while subsequent calls for the same ID return 404 Not Found. This is perfectly valid.

## Practical Exercise
If your API deletes a user profile and returns the deleted user's email address in the response body to confirm the action, which status code should you use?

**Answer:** 200 OK, because a response body is being returned.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
