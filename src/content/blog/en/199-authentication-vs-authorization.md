---
title: "Build a JWT Authentication Flow with Explicit Trust Boundaries"
description: "A deep dive into stateless token issuance, signature validation, and the lifecycle of access and refresh tokens in a fitness application."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 199-authentication-vs-authorization
seriesOrder: 43
locale: en
tags: ["security","learning-series"]
draft: false
---

## The Stateless Trust Model

This fitness API uses signed access tokens that instances can validate without keeping a local session for every request. JWT does not require that architecture: refresh-token records, revocation checks or current permission lookups may still add state. With HMAC, validators share a secret; with an asymmetric signature, validators use a public key and only the issuer needs the private signing key.

Signing protects integrity, not confidentiality. Base64url-encoded claims can be read by whoever holds the token. Deleting a client copy does not invalidate another stolen copy; short expiry bounds the access window but does not provide immediate revocation.
## Anatomy of the Trust Boundary

To prevent security bypasses, you must validate the token's structure and claims before trusting the data inside. A decoded JWT is just a Base64 string; it is not secure until the signature is verified.

### Critical Validation Steps
1. **Algorithm Check**: Ensure the `alg` header matches your expected algorithm (e.g., HS256). This prevents "alg: none" attacks where a client claims the token isn't signed.
2. **Signature Verification**: Use the secret key to re-calculate the HMAC and compare it to the token's signature.
3. **Expiration (`exp`)**: Reject tokens where the current time is past the expiration timestamp.
4. **Issuer (`iss`) and Audience (`aud`)**: Verify the token was issued by your auth server and intended for your specific fitness app API.

## Worked Example: The Fitness App Lifecycle

Scenario: A user logs in to view workout history. We use a dual-token strategy: a short-lived **Access Token** (15 mins) and a long-lived **Refresh Token** (7 days).

### 1. The Token Schema

**Access Token Claims:**
- `sub`: "user_123"
- `iss`: "fitness-auth-service"
- `aud`: "fitness-api"
- `exp`: 1715000000
- `scope`: "workout:read"

**Refresh Token:** A random high-entropy UUID stored in a database linked to the user and device.

### 2. The Request Flow (Illustrative Java Implementation)

We implement a `JwtAuthenticationFilter` that intercepts requests to `/api/workouts`.

```java
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenProvider tokenProvider;

    public JwtAuthenticationFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        
        // The trust boundary: validate signature, exp, iss, and aud
        Optional<UserPrincipal> principal = tokenProvider.validateAndParseToken(token);

        if (principal.isPresent()) {
            // Set security context for the duration of this request
            SecurityContextHolder.getContext().setAuthentication(principal.get().getAuthentication());
        }

        filterChain.doFilter(request, response);
    }
}
```

### 3. Handling the Lifecycle

- **Requesting History**: The client sends the Access Token. The filter validates it → Request succeeds.
- **Token Expiry**: The Access Token expires. The server returns a 401 Unauthorized. The client does not prompt for login; instead, it sends the **Refresh Token** to a `/auth/refresh` endpoint.
- **Refresh Logic**: The server checks if the Refresh Token exists in the DB and isn't revoked. If valid, it issues a *new* Access Token.
- **Logout**: The server deletes the Refresh Token from the DB. While the current Access Token might still work for a few minutes, the user cannot get a new one, effectively ending the session.

## Failure Cases and Consequences

- **Secret Leak**: If the signing key is compromised, an attacker can forge tokens with any `sub` (user ID), gaining full access to any account.
- **Missing `exp` Validation**: A stolen token becomes a permanent key to the account.
- **Trusting Decoded Claims**: If the code calls `jwt.getClaims()` before `jwt.verify()`, an attacker can change their user ID in the payload, and the server will process the request as that user.

## Exercise

**Scenario**: You are auditing a fitness app. The developer uses a single JWT that lasts for 30 days. When a user clicks "Logout", the app calls `localStorage.removeItem('token')`. 

1. Why is this insufficient for security?
2. How does the dual-token (Access/Refresh) approach solve the revocation problem without making every API call stateful?

**Answer**:
1. Deleting the token from the client does not invalidate the token on the server. If an attacker intercepted the token via XSS or network sniffing, they can continue using it for the remaining 30 days because the server only checks the signature and expiration, not a session store.
2. By using a short-lived Access Token (e.g., 15 mins), the window of vulnerability for a stolen token is small. The Refresh Token is stored in the DB; by deleting the Refresh Token during logout, the server prevents the issuance of new Access Tokens, effectively revoking access once the current short-lived token expires.

The filter is only an illustrative excerpt. Register it at the correct point in a SecurityFilterChain, protect the workout route, map invalid authentication to a 401 challenge, and ensure context cleanup. Prefer a maintained JWT decoder/resource-server integration to handwritten HMAC comparison. Enforce required exp, iss, aud, expected algorithms and appropriate time claims before using sub or scopes. Token refresh needs server-side expiry and revocation, secure random opaque values, protected storage, rotation and reuse handling. A UUID is suitable only when generated with sufficient cryptographic randomness; do not assume every UUID generator is secure. Request authentication alone does not authorize access to another user’s workout.

## Further reading

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
