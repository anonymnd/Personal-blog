---
title: "Design DTOs and Mappings Around an API Contract"
description: "Learn to decouple internal database entities from external API contracts using Java Records and mapping strategies to control data visibility and editability."
pubDate: 2026-10-07T01:48:00.000Z
translationKey: 050-why-your-database-should-not-mirror-your-ui
seriesOrder: 10
locale: en
tags: ["database-design","learning-series"]
draft: false
---

## The Boundary Problem

A common mistake in API design is treating the database entity as the communication contract. When a JPA entity is returned directly to a client, the API leaks internal implementation details. More critically, allowing a client to send an entity directly back to the server creates a security vulnerability: if the entity contains a field like `loyaltyLevel` or `accountBalance`, a malicious user could include those fields in a JSON request to escalate their privileges, even if the UI doesn't show those fields.

To solve this, we introduce Data Transfer Objects (DTOs). A DTO is a projection of the data required for a specific use case. It is not a mirror of the database, nor is it necessarily a mirror of the UI. It is a contract. Even if a Request DTO and a Response DTO share the same fields, they should remain distinct because their evolution paths differ: one defines what the server accepts, the other defines what the server promises to provide.

## Scenario: Hotel Guest Management

Consider a system where a `Guest` entity contains sensitive identity data and a server-managed loyalty status. The business rules are:
1. Guests can update their contact details (email, phone).
2. Guests cannot modify their own `loyaltyLevel`.
3. Public API responses must exclude the `identityDocumentNumber` for privacy.

### The Entity Model

```java
@Entity
public class Guest {
    @Id @GeneratedValue
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String identityDocumentNumber;
    private String loyaltyLevel; // Server-owned
    // Getters, setters, etc.
}
```

### The Contract Design

We use Java Records for DTOs because they are immutable, concise, and perfectly suited for data carriers. We define three distinct shapes:

1. **GuestUpdateRequest**: Only contains fields the user is allowed to change.
2. **GuestResponse**: Contains public info, excluding the identity document.
3. **GuestInternalResponse**: (Optional) For admin views, including sensitive data.

```java
// Only editable fields
public record GuestUpdateRequest(
    String email,
    String phone
) {}

// Publicly visible fields
public record GuestResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String loyaltyLevel
) {}
```

## Implementing the Mapping Logic

Mapping is the process of transforming an entity into a DTO (and vice versa). While libraries exist, explicit mapping provides the most control over business rules.

### Worked Example: The Mapping Service

```java
@Service
public class GuestMapper {

    public GuestResponse toResponse(Guest guest) {
        return new GuestResponse(
            guest.getId(),
            guest.getFullName(),
            guest.getEmail(),
            guest.getPhone(),
            guest.getLoyaltyLevel()
        );
    }

    public void updateEntityFromDto(GuestUpdateRequest dto, Guest guest) {
        // We explicitly ignore loyaltyLevel here
        if (dto.email() != null) guest.setEmail(dto.email());
        if (dto.phone() != null) guest.setPhone(dto.phone());
    }
}
```

### Trace of a Request

1. **Request**: Client sends `PUT /guests/1` with body `{"email": "new@email.com", "loyaltyLevel": "PLATINUM"}`.
2. **Binding**: Spring binds the JSON to `GuestUpdateRequest`. Because the record does not have a `loyaltyLevel` component, the extra JSON field is ignored by the message converter.
3. **Processing**: The service fetches the `Guest` entity via `findById`. The `GuestMapper` updates only the email and phone.
4. **Persistence**: The updated entity is saved.
5. **Response**: The service maps the updated entity to `GuestResponse`. The `identityDocumentNumber` is never included in the record constructor, ensuring it never leaves the server.

## Failure Cases and Consequences

*   **The "Pass-Through" Failure**: If you use the same DTO for both request and response, you might accidentally expose the `id` as editable or require the client to send the `loyaltyLevel` back just to update a phone number.
*   **The "Entity Leak" Failure**: Returning the `Guest` entity directly. If a new field `internalNotes` is added to the database for staff use, it is automatically leaked to the API response unless explicitly marked with `@JsonIgnore`. Using a DTO makes this leak impossible by design.
*   **The "Null Overwrite" Failure**: In the `updateEntityFromDto` method, if you simply call `guest.setEmail(dto.email())` without a null check, a client omitting the email field in a partial update would overwrite a valid email with `null` in the database.

## Exercise

**Scenario**: You are adding a `GuestRegistrationRequest` DTO. The registration requires `fullName`, `email`, and `identityDocumentNumber`. However, the `GuestResponse` must still exclude the `identityDocumentNumber`.

**Task**: Define the `GuestRegistrationRequest` record and explain why it cannot be reused as the `GuestResponse`.

**Answer**:
```java
public record GuestRegistrationRequest(
    String fullName,
    String email,
    String identityDocumentNumber
) {}
```
It cannot be reused as the `GuestResponse` because the registration request requires the `identityDocumentNumber` for creation, but the response must exclude it for security/privacy. Reusing the record would either force the API to leak the document number or prevent the user from registering.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
