---
title: "Why JWT Is Called Stateless Authentication"
description: "An exploration of how JSON Web Tokens eliminate the need for server-side session storage to verify user identity."
pubDate: 2026-10-15T01:48:00.000Z
translationKey: 202-why-jwt-is-called-stateless-authentication
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imagine you are building a procurement app where a manager approves purchase requests. In a traditional system, when the manager logs in, the server creates a session in its memory and gives the manager a Session ID. Every time the manager clicks 'Approve', the server must look up that ID in its database or RAM to remember who they are. As your app grows to thousands of users, this memory usage becomes a bottleneck.

## The Mechanism of Statelessness
JWT (JSON Web Token) changes this by moving the state from the server to the client. Instead of a random ID, the server issues a signed token containing the user's identity and permissions (claims). Because the token is digitally signed, the server doesn't need to store it. It simply validates the signature using a secret key. If the signature is valid and the expiration date hasn't passed, the server trusts the information inside without checking a database.

## Worked Example: The Approval Flow
1. **Login**: Manager logs in. Server creates a JWT: `{ "user": "manager1", "role": "APPROVER", "exp": 1715000000 }`.
2. **Signing**: Server signs this with a secret key: `HS256(payload, secret)`.
3. **Request**: Manager sends a request to `/approve-order` with the header `Authorization: Bearer <token>`.
4. **Validation**: The server receives the token, checks the signature with its secret key, and verifies the `exp` claim. If valid, the order is approved.

## Common Mistake: Trusting Decoded Data
A frequent error is decoding the JWT payload to get the user ID before verifying the signature. Since JWTs are usually Base64 encoded (not encrypted), anyone can change the payload. You must always verify the signature first; otherwise, a user could change their role from `REQUESTER` to `APPROVER` manually.

## The Revocation Trade-off
Statelessness comes with a cost: you cannot easily 'kill' a token. If a manager's account is compromised, the token remains valid until it expires. To fix this, developers often use short-lived Access Tokens and longer-lived Refresh Tokens stored in a database, introducing a small amount of state back into the system for security.

## Practical Exercise
**Scenario**: A JWT has a valid signature but the `exp` (expiration) timestamp is from yesterday. Should the server allow the request?

**Answer**: No. Signature validation only proves the token wasn't tampered with; the server must also check the expiration claim to ensure the token is still active.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
