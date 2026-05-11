---
title: "What Is Inside a JWT?"
description: "A deep dive into the three components of a JSON Web Token and how they ensure secure stateless communication."
pubDate: 2026-10-15T00:48:00.000Z
translationKey: 201-what-is-inside-a-jwt
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a manager approves a purchase request. After the manager logs in, the server doesn't want to query the database every single time the manager clicks 'Approve' just to verify who they are. This is where a JSON Web Token (JWT) comes in. It acts like a digital ID card that the client carries and shows to the server.

## The Three-Part Structure

A JWT is not a single blob of data but a string divided into three parts separated by dots: `Header.Payload.Signature`. Each part is Base64Url encoded, meaning it looks like gibberish but can be easily decoded by anyone.

## The Header: The Metadata
The header typically contains two things: the type of token (JWT) and the signing algorithm being used, such as HMAC SHA256 (HS256) or RSA. It tells the server how to verify the signature later.

## The Payload: The Claims
This is the heart of the token. It contains 'claims,' which are statements about the user. In our procurement app, the payload might look like this:

```json
{
  "sub": "1234567890",
  "name": "Ahmed Manager",
  "role": "MANAGER",
  "exp": 1715456000
}
```
`sub` (subject) is the user ID, and `exp` (expiration) is a timestamp. Crucially, this data is encoded, not encrypted. Anyone who intercepts the token can read your role and name.

## The Signature: The Security Seal
To prevent users from changing their role from `EMPLOYEE` to `MANAGER`, the server creates a signature. It takes the encoded header, the encoded payload, and a secret key known only to the server, then hashes them together. If a single character in the payload changes, the signature becomes invalid.

## Common Mistake: Trusting Decoded Data
Developers often decode the payload and immediately use the `role` to grant access. **This is a critical security flaw.** You must verify the signature using the secret key *before* trusting any claim inside the payload.

## Practical Exercise
If a JWT has a payload `{"role": "USER"}` and a signature generated with secret `key123`, what happens if a hacker changes the payload to `{"role": "ADMIN"}` but keeps the original signature?

**Answer:** The server will recalculate the signature using the new payload and `key123`. The result won't match the original signature, and the server will reject the token as tampered.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
