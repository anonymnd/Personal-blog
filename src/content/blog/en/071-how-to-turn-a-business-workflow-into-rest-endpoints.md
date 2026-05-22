---
title: "Design a REST Contract Around Resources and Business Transitions"
description: "A guide to separating resource management from business state transitions in a document-signing workflow."
pubDate: 2026-10-07T07:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
seriesOrder: 16
locale: en
tags: ["rest-api","learning-series"]
draft: false
---

## Resources vs. Actions

A common mistake in API design is treating endpoints like remote procedure calls (RPC), where the URI represents a 'button' (e.g., `/envelopes/sign-document`). In a true RESTful contract, URIs identify resources, and HTTP methods define the operation. 

In a document-signing system, we have two distinct types of changes: **Metadata Updates** (changing a description) and **Business Transitions** (marking a document as signed). While both modify the database, they have different semantic meanings and authorization requirements. Metadata updates are typically CRUD operations, whereas business transitions are state machine movements that often trigger side effects like email notifications or legal timestamps.

## The Resource Hierarchy

To maintain a clean contract, we define resources based on their lifecycle. An `Envelope` is the root aggregate. `Signers` are dependent resources. 

### Collection and Detail Endpoints
- `GET /envelopes`: Returns a paginated list of envelopes. Filtering (e.g., `?status=pending`) happens via query parameters, not separate endpoints.
- `GET /envelopes/{id}`: Returns the current state of a specific envelope.
- `POST /envelopes`: Creates a new envelope. The server assigns the ID and returns a `201 Created` with the `Location` header.

### Nesting and Sub-resources
Nesting should represent a strong ownership relationship. Since a signer cannot exist without an envelope, they are nested:
- `GET /envelopes/{id}/signers`: Lists all signers for a specific envelope.
- `POST /envelopes/{id}/signers`: Adds a signer to the envelope.

Avoid deep nesting (more than two levels). If you need to modify a specific signer, use `/signers/{signerId}` rather than `/envelopes/{id}/signers/{signerId}` to keep URIs concise.

## Modeling Business Transitions

When a user 'signs' a document, they aren't just updating a boolean field; they are performing a legal action. Using `PATCH /envelopes/{id}` to change `status` to `SIGNED` is technically possible but architecturally weak because it blends administrative editing with business logic.

Instead, treat the transition as a sub-resource or a specific command. There are two primary patterns:

1. **The State Resource**: `PUT /envelopes/{id}/status` (Replacing the status value).
2. **The Action Resource**: `POST /envelopes/{id}/signatures` (Creating a signature record that triggers the state change).

For a signing workflow, the second approach is superior because it allows the API to capture the 'who' and 'when' of the transition as a first-class resource.

## Worked Example: The Signing Contract

Below is the agreed contract for the signing workflow. This ensures the frontend knows exactly which endpoint to call for a metadata change versus a legal transition.

### Contract Specification

| Intent | Method | Endpoint | Payload | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| Create Envelope | `POST` | `/envelopes` | `{ "title": "NDA" }` | `201 Created` + Location |
| Edit Title | `PATCH` | `/envelopes/{id}` | `{ "title": "New NDA" }` | `200 OK` (Updated Resource) |
| Assign Signer | `POST` | `/envelopes/{id}/signers` | `{ "email": "a@b.com" }` | `201 Created` |
| Perform Signing | `POST` | `/envelopes/{id}/signatures` | `{ "signerId": "s1" }` | `202 Accepted` or `201` |
| Cancel Envelope | `DELETE` | `/envelopes/{id}` | N/A | `204 No Content` |

### Illustrative Java Representation

```java
// Using records for immutable representation
public record EnvelopeResponse(UUID id, String title, String status, LocalDateTime createdAt) {}
public record SignerRequest(String email, String role) {}
public record SignatureRequest(UUID signerId, String digitalFingerprint) {}

// The controller separates metadata from transitions
@RestController
@RequestMapping("/envelopes")
public class EnvelopeController {

    // Metadata update: Partial modification
    @PatchMapping("/{id}")
    public ResponseEntity<EnvelopeResponse> updateMetadata(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        // Logic to update only provided fields
        return ResponseEntity.ok(updatedEnvelope);
    }

    // Business Transition: Creating a signature resource triggers the 'Signed' state
    @PostMapping("/{id}/signatures")
    public ResponseEntity<Void> signDocument(@PathVariable UUID id, @RequestBody SignatureRequest request) {
        // Business logic: verify signer, apply timestamp, change envelope status
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
```

### Failure Cases and Consequences
- **State Conflict (409)**: If a user tries to `POST /envelopes/{id}/signatures` on an envelope that was already removed via `DELETE`, the server must return `404 Not Found`.
- **Representation Mismatch**: If the frontend expects the `status` to change immediately but the backend processes the signature asynchronously, the `POST` should return `202 Accepted`. The frontend must then poll `GET /envelopes/{id}` to see the transition complete.

## Exercise

**Scenario**: You need to add a 'Review' phase to the workflow. A manager must approve the envelope before it is sent to signers. 

1. Which endpoint would you use to change the envelope's description during review?
2. Which endpoint would you create to handle the manager's approval transition?
3. Why not use `PATCH /envelopes/{id}` for the approval?

**Answer**:
1. `PATCH /envelopes/{id}` with the description field.
2. `POST /envelopes/{id}/approvals` (creating an approval record) or `PUT /envelopes/{id}/status` (if simple).
3. Because approval is a business transition with specific authorization and audit requirements, whereas `PATCH` is for general attribute modification. Mixing them makes it harder to trigger specific 'on-approval' events (like sending emails) without polluting the general update logic.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
