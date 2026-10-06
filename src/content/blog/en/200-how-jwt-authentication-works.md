---
title: "How JWT Authentication Works"
description: "A deep dive into the stateless nature of JSON Web Tokens and how they secure modern API communications."
pubDate: 2026-10-14T23:48:00.000Z
translationKey: 200-how-jwt-authentication-works
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where a Requester submits a purchase request. After logging in, the server needs to remember who the user is for every subsequent request without querying the database every single time. This is where JSON Web Tokens (JWT) come in, solving the problem of session management in a stateless way.

## The Anatomy of a Token
A JWT is not a session ID; it is a portable container of information. It consists of three parts separated by dots: the Header (algorithm and token type), the Payload (claims like `userId` or `role`), and the Signature. The signature is the most critical part, created by hashing the header and payload with a secret key known only to the server.

## The Authentication Flow
When a user logs in, the server verifies their credentials. Instead of creating a session in memory, the server generates a JWT and sends it back to the client. The client stores this token and attaches it to the `Authorization: Bearer <token>` header for future requests. The server then validates the signature to ensure the token hasn't been tampered with, checks the expiration date (`exp`), and confirms the issuer (`iss`).

## Worked Example: Procurement Approval
Consider a Manager approving a request. The JWT payload might look like this:
```json
{
  "sub": "manager_123",
  "role": "MANAGER",
  "exp": 1715600000
}
```
When the Manager hits `/approve/request/45`, the server decodes the token. If the signature is valid and the `role` is `MANAGER`, the action is permitted. If a user manually changes their role to `ADMIN` in the payload, the signature becomes invalid because the server's secret key no longer matches the hash of the modified content.

## Common Mistake: Trusting Decoded Data
A frequent error is decoding the payload (which is just Base64) and using the data before verifying the signature. Since anyone can decode a JWT, you must always run the verification step first. If you trust the `userId` from an unverified token, an attacker can impersonate any user by simply changing the ID in the payload.

## Practical Exercise
**Scenario:** A token has a payload with `exp: 1600000000` (a date in 2020). The signature is perfectly valid. Should the server accept this request?

**Answer:** No. Even if the signature is valid, the token has expired. The server must reject it and prompt the user to re-authenticate.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
