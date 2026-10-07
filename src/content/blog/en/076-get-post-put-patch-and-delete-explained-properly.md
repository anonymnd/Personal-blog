---
title: "HTTP Methods and Successful Responses: One Consistent Guide"
description: "A deep dive into safe and idempotent semantics for POST, PUT, PATCH, and DELETE using a playlist API scenario."
pubDate: 2026-10-07T08:48:00.000Z
translationKey: 076-get-post-put-patch-and-delete-explained-properly
seriesOrder: 17
locale: en
tags: ["rest-api","learning-series"]
draft: false
---

## Semantics of Safety and Idempotency

Safety describes the requested semantics: a GET must not request a playlist edit, although incidental logging may occur. Idempotency concerns the intended effect of repeating a request, not identical responses or the absence of logs. PUT and DELETE are idempotent by their semantics; POST is not guaranteed idempotent but an API may provide a deduplication contract. PATCH depends on the patch operation and format.
## The Playlist API: A Worked Example

Consider a Playlist resource. The client owns the representation of the playlist (title, description, and a list of track IDs).

### 1. Creation (POST)
When a client creates a playlist, they send a `POST` to `/playlists`. The server assigns the ID.

**Request:** `POST /playlists` 
**Body:** `{"title": "Chill Vibes", "tracks": [101, 102]}`

**Successful Response:** `201 Created`. 
Crucially, the server should include a `Location` header: `Location: /playlists/789`. This tells the client exactly where the new resource lives.

### 2. Full Replacement (PUT)
`PUT` is used to replace the entire target resource. The client sends the complete updated representation.

**Request:** `PUT /playlists/789` 
**Body:** `{"title": "Chill Vibes Updated", "tracks": [101, 102, 103]}`

**Successful Response:** `200 OK` (returning the updated playlist) or `204 No Content` (if the client doesn't need the body back).

### 3. Partial Modification (PATCH)
`PATCH` is used for modifications. Unlike `PUT`, the client only sends the fields that need to change.

**Request:** `PATCH /playlists/789` 
**Body:** `{"title": "Midnight Jazz"}`

**Successful Response:** `200 OK` with the modified representation.

### 4. Removal (DELETE)
`DELETE` removes the resource identified by the URI.

**Request:** `DELETE /playlists/789` 
**Successful Response:** `204 No Content`. This is the standard for successful deletions where no body is returned.

## Contrast: Idempotency in Action

With a documented patch format that sets title to a value, repeating the update has the same intended effect. For JSON Patch, use application/json-patch+json and an array of operations. Appending to the tracks array uses the /- suffix:

```json
[{"op":"add","path":"/tracks/-","value":104}]
```

Repeating that append adds another track when duplicates are permitted. An add at /tracks would replace the whole member rather than append to its array; do not confuse these paths.
## Asynchronous Processing (202 Accepted)
If creating a playlist requires heavy processing (e.g., validating 1,000 tracks against a copyright database), the server should not keep the connection open. Instead, it returns `202 Accepted`. This indicates the request is valid and has been accepted for processing, but the final outcome is not yet known. The response usually includes a `Location` header pointing to a status monitor URI.

## Summary Table of Success Responses

| Status | Meaning | Typical Use Case |
| :--- | :--- | :--- |
| 200 OK | Success | `GET` results, `PUT`/`PATCH` updates with body |
| 201 Created | Resource Created | `POST` creation, `PUT` creation (if allowed) |
| 202 Accepted | Processing Started | Long-running tasks, async jobs |
| 204 No Content | Success, No Body | `DELETE` success, `PUT` update without body |

## Focused Exercise

**Scenario:** You are designing an endpoint to 'Archive' a playlist. Archiving is a business transition that marks the playlist as inactive but keeps the data. You want the operation to be idempotent.

1. Which HTTP method should you use if you are treating 'archived' as a property of the resource?
2. Which status code should you return if the playlist was already archived and no change occurred?
3. If the archiving process triggers a background cleanup of cached files that takes 30 seconds, which status code is most appropriate?

**Answer:**
1. `PATCH` (to update the `archived` status to `true`) or `PUT` (if sending the full representation).
2. `200 OK` or `204 No Content`. Because the method is idempotent, the *effect* is the same (it is archived), so the request is successful even if no state change happened during that specific call.
3. `202 Accepted`.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
