---
title: "Understand Origins, CORS and Browser-Enforced Access"
description: "A deep dive into the Same-Origin Policy, preflight mechanisms, and the critical distinction between CORS and authentication."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 195-what-is-cors
seriesOrder: 42
locale: en
tags: ["web-communication","learning-series"]
draft: false
---

## The Origin Tuple

Security in the browser starts with the Same-Origin Policy (SOP). An 'origin' is not just a domain; it is a strict tuple of three components: **Scheme (Protocol), Host, and Port**. If any of these differ, the browser considers the request cross-origin.

Consider our scenario: a dashboard running at `http://localhost:3000` attempting to call a backend at `http://localhost:8080`.

*   **Scheme:** `http` == `http` (Match)
*   **Host:** `localhost` == `localhost` (Match)
*   **Port:** `3000` != `8080` (Mismatch)

Because the ports differ, these are distinct origins. This applies similarly to subdomains: `dashboard.example.com` and `api.example.com` are different origins because the hosts differ.

## SOP vs. CORS: The Reading Policy

A common misconception is that SOP blocks the *sending* of requests. In reality, SOP primarily blocks the *reading* of the response. For many requests, the browser will send the data to the server, the server will process it and send a response, but the browser will prevent the JavaScript code from accessing that response unless the server explicitly permits it via Cross-Origin Resource Sharing (CORS).

## Simple Requests vs. Preflight

Not all cross-origin requests are treated the same. The browser categorizes them into 'Simple' and 'Preflighted'.

### Simple Requests
Requests that use `GET`, `POST`, or `HEAD` with standard headers (like `Accept`, `Content-Type: application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`) are sent immediately. The browser checks the `Access-Control-Allow-Origin` header in the response. If it doesn't match the requesting origin, the browser throws a CORS error and hides the response from the script.

### Preflight Requests (OPTIONS)
If a request uses a method like `PUT` or `DELETE`, or a header like `Content-Type: application/json`, the browser first sends an `OPTIONS` request. This is the 'Preflight'. It asks the server: "I intend to send a JSON PUT request; do you allow this?"

If the server responds with a `200 OK` and the correct `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`, the browser then sends the actual request.

## Credentials and the Wildcard Trap

For cross-origin cookies, the client needs credentials: include (or XHR withCredentials), and the response needs Access-Control-Allow-Credentials: true plus an allowed explicit origin rather than *. Cookie domain, SameSite and browser policies can still prevent sending cookies.

A manually supplied Authorization header is a separate case: include it explicitly and allow it in the preflight headers; credentials: include is not inherently required solely to send that header. Do not treat every bearer-token request as a cookie request. Reflecting any Origin blindly would undermine an allowlist.
## Worked Example: Diagnosis Trace

The dashboard sends a JSON POST with cookies. Its preflight includes Origin, Access-Control-Request-Method: POST and Access-Control-Request-Headers: content-type. A successful preflight needs the appropriate allowed origin, credential permission and header permission. A missing Access-Control-Allow-Headers: content-type blocks this JSON request. POST itself is CORS-safelisted, so missing Allow-Methods alone is not the right example of failure here.

After a successful preflight, the actual response must also carry the allowed explicit origin and credential permission. Returning Allow-Origin: * for credentials mode include makes the response unreadable. A 204 preflight can be successful; 200 is not the only acceptable success status.
## CORS is Not Security

CORS is a browser-enforced mechanism to protect the user's data from malicious scripts in other tabs. It is **not** a replacement for:
*   **Authentication:** CORS does not verify who the user is.
*   **Authorization:** CORS does not check if the user has permission to delete a resource.
*   **CSRF Protection:** Since simple requests are sent *before* the CORS check, a malicious site can still trigger a state-changing POST request (CSRF) even if it cannot read the response.

## Exercise

**Question:** You have a production environment where the frontend is at `https://app.example.com` and the API is at `https://api.example.com`. The frontend sends a `DELETE` request with a custom header `X-Request-ID` and includes session cookies. What specific headers must the server return during the preflight and the actual response to allow this?

**Answer:**
1.  **Preflight (OPTIONS):**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Methods: DELETE`
    *   `Access-Control-Allow-Headers: X-Request-ID`
    *   `Access-Control-Allow-Credentials: true`
2.  **Actual Response (DELETE):**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Credentials: true`

## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
