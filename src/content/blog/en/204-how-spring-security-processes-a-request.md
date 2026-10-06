---
title: "How Spring Security Processes a Request"
description: "A deep dive into the DelegatingFilterProxy and the SecurityFilterChain that intercept every incoming HTTP request."
pubDate: 2026-10-15T03:48:00.000Z
translationKey: 204-how-spring-security-processes-a-request
locale: en
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imagine you are building a procurement app where a requester submits a purchase order. You want to ensure that only an authenticated manager can approve it. You might wonder: how does Spring Security actually 'know' who the user is before the request even hits your @RestController?

## The Entry Point: DelegatingFilterProxy
Spring Security doesn't live inside the Servlet container by default; it lives in the Spring ApplicationContext. To bridge this gap, Spring uses the `DelegatingFilterProxy`. This is a standard Servlet Filter that does one thing: it finds a Spring-managed bean called the `FilterChainProxy` and delegates the request to it. This allows your security logic to benefit from Spring's dependency injection.

## The Heart: FilterChainProxy and SecurityFilterChain
The `FilterChainProxy` acts as a coordinator. It manages one or more `SecurityFilterChain` instances. When a request arrives, Spring checks which chain matches the request URL. Each chain contains a list of ordered filters (like `UsernamePasswordAuthenticationFilter` or `JwtAuthenticationFilter`).

## The Mechanism: Authentication and SecurityContext
As the request passes through the filters, one filter is responsible for extracting credentials (like a JWT or a session cookie). It passes these to an `AuthenticationManager`. If valid, an `Authentication` object is created and stored in the `SecurityContextHolder`. This context is the 'source of truth' for the rest of the request's lifecycle.

## Worked Example: Procurement Approval
Consider a request to `POST /orders/approve`. 
1. **Filter Stage**: A JWT filter extracts the token, validates the signature and expiration, and finds the user 'Manager_Ali'.
2. **Context Stage**: The `SecurityContext` is populated with `Authentication(principal=Manager_Ali, authorities=[ROLE_MANAGER])`.
3. **Authorization Stage**: The `AuthorizationFilter` checks if the current user has `ROLE_MANAGER`. Since they do, the request proceeds to the Controller.

## Common Mistake: Confusing Authentication with Authorization
A frequent error is assuming that because a user is authenticated (logged in), they are authorized to perform any action. For example, a 'Requester' might be authenticated, but they should not be able to access the `/orders/approve` endpoint. Always define specific role-based access controls (RBAC) after the authentication filter has finished.

## Practical Exercise
If a request bypasses the `SecurityFilterChain` because of a permitAll() configuration, will the `SecurityContextHolder` contain the user's details?

**Answer**: No. If the request is permitted without authentication, the filters that populate the `SecurityContext` are either skipped or do not find credentials, leaving the context empty.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
