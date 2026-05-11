---
title: "Why Authentication Is More Than a Login Endpoint"
description: "Explore the critical layers of identity management beyond the initial credential check, focusing on token lifecycle and security pitfalls."
pubDate: 2026-10-15T11:48:00.000Z
translationKey: 212-why-authentication-is-more-than-a-login-endpoint
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers start their security journey by creating a `/login` endpoint that checks a password and returns a success message. However, this is only the 'front door'. The real challenge begins after the user is identified: how do you maintain that identity securely across thousands of requests without asking for a password every time?

## The Token Lifecycle
Once a user is authenticated, we typically issue a JSON Web Token (JWT). A common misconception is that JWTs are encrypted; in reality, they are usually just signed. This means anyone can decode the payload to see the user's ID, but they cannot change it without breaking the signature. To keep this secure, your backend must validate the algorithm, the issuer, the audience, and the expiration date before trusting any claim inside the token.

## Authentication vs. Authorization
Authentication confirms *who* the user is, but authorization decides *what* they can do. In a procurement app, authentication lets a user enter the system. Authorization ensures that a Requester cannot approve their own purchase request, and a Buyer cannot change the budget of a department they don't manage. Checking a token's validity is not the same as checking if that user owns the specific resource they are trying to access.

## The Password Hashing Trap
Storing passwords requires one-way salted hashing, not encryption. While BCrypt is widely used in Spring applications, it has a 72-byte input limit. For modern systems, OWASP recommends Argon2id. The goal is to make the process computationally expensive for attackers while remaining fast for a single user.

## Worked Example: Token Validation
Imagine a procurement request flow. The user sends a request to `/api/requests/123` with a Bearer token.

```java
// Illustrative excerpt of validation logic
public boolean validateToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
    
    // Check expiration and issuer
    return !claims.getExpiration().before(new Date()) 
           && "procurement-app".equals(claims.getIssuer());
}
```
Outcome: If the token is expired or the signature is forged, the request is rejected with a 401 Unauthorized before it ever hits the database.

## Common Mistake: The Logout Illusion
Developers often think deleting a JWT from the client-side `localStorage` constitutes a logout. Because JWTs are stateless, the token remains valid on the server until it expires. To truly revoke access, you need a blacklist or a short-lived access token paired with a refresh token.

## Practical Exercise
Scenario: You have a JWT with a `role: "USER"` claim. The user manually changes this to `role: "ADMIN"` in their browser and sends the request. Why does the server still reject it?

**Answer:** Because the server verifies the cryptographic signature. Changing the payload without the secret key makes the signature invalid.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
