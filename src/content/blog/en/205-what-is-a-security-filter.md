---
title: "What Is a Security Filter?"
description: "An exploration of how security filters intercept requests to protect application resources before they reach the business logic."
pubDate: 2026-10-15T04:48:00.000Z
translationKey: 205-what-is-a-security-filter
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement application where a requester submits a purchase request, but only a manager should be able to approve it. If you check the user's role inside every single method of your service layer, your code becomes cluttered and repetitive. This is where a Security Filter comes in.

## The Interception Mechanism
A security filter is a component that sits between the client's request and the server's target resource. It operates on the principle of a 'chain'. When an HTTP request arrives, it must pass through a series of filters. A security filter intercepts the request, inspects the headers or session, and decides whether to let the request proceed to the controller or block it immediately with a 401 Unauthorized or 403 Forbidden response.

## How it Works in Practice
In a Java environment using Jakarta EE or Spring Security, a filter typically implements a specific interface that allows it to wrap the request. It checks for a credential—such as a JWT (JSON Web Token). The filter doesn't just decode the token; it must validate the signature, the issuer, and the expiration date before trusting any claims inside the token.

## Worked Example: Procurement Approval
Consider a request to `/api/procurement/approve`. The security filter intercepts the call:

```java
// Illustrative excerpt of a Filter logic
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    String token = ((HttpServletRequest) request).getHeader("Authorization");
    if (token != null && jwtProvider.validateToken(token)) {
        Claims claims = jwtProvider.getClaims(token);
        if ("MANAGER".equals(claims.get("role"))) {
            chain.doFilter(request, response); // Pass to the controller
            return;
        }
    }
    ((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN);
}
```
Outcome: If a 'REQUESTER' tries to access the approve endpoint, the filter stops them before the business logic is ever executed.

## Common Mistake: Trusting Decoded Data
A frequent error is decoding a JWT to check the user's role without first verifying the cryptographic signature. If you trust the claims without verification, an attacker can simply change their role to 'ADMIN' in the base64-encoded string and bypass your security.

## Practical Exercise
Scenario: You have a filter that checks for a valid session cookie. If the cookie is missing, it redirects to `/login`. If the cookie is present but expired, what should the filter do?

Answer: The filter should invalidate the expired cookie and redirect the user to the login page with a 401 status, ensuring the request never reaches the protected resource.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
