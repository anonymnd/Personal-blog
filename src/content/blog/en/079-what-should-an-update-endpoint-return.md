---
title: "What Should an UPDATE Endpoint Return?"
description: "A guide on choosing the correct HTTP status codes and response bodies when modifying resources in a REST API."
pubDate: 2026-10-09T22:48:00.000Z
translationKey: 079-what-should-an-update-endpoint-return
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have just finished implementing a feature where a manager approves a procurement request. The logic works, the database updates, but now you are staring at the return statement: should you return the updated object, a simple success message, or nothing at all? Choosing the wrong response can lead to unnecessary network traffic or force the frontend to make redundant API calls.

## The 200 OK vs 204 No Content Dilemma
When an update is successful, the two most common choices are `200 OK` and `204 No Content`. Use `200 OK` when the client needs the updated state of the resource immediately. This is helpful if the server calculates fields—like an `updatedAt` timestamp or a status change from 'Pending' to 'Approved'—that the frontend must display. Use `204 No Content` when the client already knows exactly what the state is and doesn't need the server to send the data back, saving bandwidth.

## Handling PUT and PATCH
While both update resources, their semantics differ. A `PUT` request typically replaces the entire resource. If the resource didn't exist and the API allows creation via PUT, a `201 Created` is appropriate. A `PATCH` request applies partial modifications. Since PATCH is not inherently idempotent, returning the full updated representation via `200 OK` is often preferred to confirm exactly what changed.

## Managing Errors and Conflicts
Not every update succeeds. If the requester isn't authorized to approve a request, return `403 Forbidden`. If the request ID doesn't exist, `404 Not Found` is standard. A critical one for updates is `409 Conflict`. This happens if the resource was modified by someone else since the client last fetched it (optimistic locking), preventing the user from accidentally overwriting changes.

## Worked Example: Procurement Approval
Imagine a `PATCH /requests/{id}` endpoint to approve a purchase.

**Request:**
`PATCH /requests/123` 
`{ "status": "APPROVED" }`

**Response (200 OK):**
```json
{
  "id": 123,
  "status": "APPROVED",
  "approvedBy": "manager_01",
  "updatedAt": "2023-10-27T10:00:00Z"
}
```
Outcome: The frontend updates the UI instantly with the server-generated timestamp.

## Common Mistake: The 200 "Success" String
Many developers return `200 OK` with a body like `{"message": "Updated successfully"}`. This is a mistake because it provides no structural data about the resource. Either return the actual resource representation or use `204 No Content`.

## Practical Exercise
If you implement a `PUT` request that replaces a user's profile and you want to tell the client the update worked but you don't want to send any data back, which status code do you use?

**Answer:** `204 No Content`.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
