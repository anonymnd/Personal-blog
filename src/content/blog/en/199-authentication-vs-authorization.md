---
title: "Authentication vs Authorization"
description: "A clear guide to distinguishing between verifying identity and managing access permissions in secure applications."
pubDate: 2026-10-14T22:48:00.000Z
translationKey: 199-authentication-vs-authorization
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imagine you are entering a secure office building. The security guard asks for your ID card to prove who you are; that is authentication. Once inside, you try to enter the server room, but your badge only opens the breakroom door; that is authorization. Many beginners confuse these two because they happen sequentially, but they solve entirely different problems.

## The Core Difference
Authentication (AuthN) is the process of verifying that a user is who they claim to be. It focuses on identity. Common methods include passwords, biometrics, or Multi-Factor Authentication (MFA). Authorization (AuthZ), on the other hand, determines what an authenticated user is allowed to do. It focuses on permissions and access control.

## Mechanism in Modern Apps
In a modern Java application using Jakarta EE or Spring, these processes often rely on tokens like JSON Web Tokens (JWT). When a user logs in, the server authenticates them and issues a JWT. This token contains 'claims'—pieces of information like the user's ID and their role (e.g., `ROLE_MANAGER`). The server doesn't need to check the database for every single request because it can validate the token's digital signature to ensure it hasn't been tampered with.

## Procurement App Example
Consider a procurement system where users request equipment:
- **Authentication**: A user enters their email and password. The system verifies the password hash (using BCrypt or Argon2id) and grants access.
- **Authorization**: 
    - A **Requester** can create a request but cannot approve it.
    - A **Manager** can see requests from their team and click 'Approve'.
    - A **Buyer** can mark the request as 'Ordered'.
If a Requester tries to call the `/api/approve` endpoint, the system returns a `403 Forbidden` error because they lack the necessary authorization, even though they are authenticated.

## Common Mistake: Trusting Decoded Tokens
A frequent error is decoding a JWT on the client side or server side and trusting the claims without verifying the signature first. If you simply base64-decode a token, a malicious user could change their role from `USER` to `ADMIN`. You must always validate the signature, issuer, and expiration date before trusting the data inside.

## Practical Exercise
Scenario: A user is logged in but receives a '403 Forbidden' when trying to delete a record. Is this an Authentication or Authorization failure?

**Answer**: This is an Authorization failure. The user is already logged in (authenticated), but they do not have the permission (authorization) to perform the delete action.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
