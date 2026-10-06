---
title: "What Happens When a JWT Expires?"
description: "Understand the technical mechanism of token expiration and how to handle session continuity using refresh tokens."
pubDate: 2026-10-15T02:48:00.000Z
translationKey: 203-what-happens-when-a-jwt-expires
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imagine a user is filling out a long procurement request in your app. Just as they hit 'Submit', the server returns a 401 Unauthorized error. The user is confused because they logged in only an hour ago. This is the classic 'expired token' scenario.

## The Expiration Mechanism
JSON Web Tokens (JWT) are stateless. The server doesn't keep a session record in a database; instead, it trusts the `exp` (expiration) claim inside the token payload. When a request arrives, the server decodes the token, verifies the signature, and checks if the current Unix timestamp is greater than the `exp` value. If it is, the token is mathematically invalid, regardless of whether the signature is correct.

## The Procurement Workflow Example
Consider a procurement app where a Requester submits a purchase request. 
1. **Login**: User gets an Access Token (expires in 15 mins) and a Refresh Token (expires in 7 days).
2. **Request**: The user sends a POST to `/api/requests` with the Access Token.
3. **Expiration**: After 16 minutes, the server sees `exp: 1715000000` (past time) and rejects the request.
4. **Recovery**: The client catches the 401 error, sends the Refresh Token to `/api/refresh`, and receives a new Access Token without asking the user for a password.

## Common Mistake: Trusting Decoded Claims
A frequent error is decoding the JWT on the frontend to check the expiration date and assuming the token is still valid. 

**Wrong**: `if (decoded.exp > now) { sendRequest(); }` 
**Correction**: Always treat the server's 401 response as the source of truth. The server must verify the signature before trusting any claim, including the expiration date.

## Handling the Logout Gap
Because JWTs are stateless, you cannot 'delete' a token from the server. If a token expires in 10 minutes, it remains valid for those 10 minutes even if the user clicks 'Logout'. To fix this, developers often implement a 'blacklist' in Redis to store revoked tokens until their original `exp` time passes.

## Practical Exercise
**Scenario**: A JWT has an `exp` claim of `1672531200`. The current server time is `1672531201`. Does the server accept the request?

**Answer**: No. The current time is greater than the expiration timestamp, so the token is expired.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
