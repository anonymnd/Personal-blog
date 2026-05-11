---
title: "What Is CORS?"
description: "A beginner-friendly guide to understanding Cross-Origin Resource Sharing and how browsers handle security between different domains."
pubDate: 2026-10-14T18:48:00.000Z
translationKey: 195-what-is-cors
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement app where the frontend runs on `http://localhost:3000` and the backend API is on `http://localhost:8080`. You write a perfect `fetch()` call to submit a purchase request, but the browser blocks the response with a red error message mentioning 'CORS'. This happens because of the Same-Origin Policy, a security measure that prevents a script on one site from reading data from another site unless explicitly allowed.

## Defining the Origin
An origin is defined by three components: the scheme (http/https), the host (domain), and the port. If any of these differ, the request is considered cross-origin. For example, `http://api.app.com` and `https://api.app.com` are different origins because the scheme differs.

## How CORS Works
CORS is a mechanism that uses HTTP headers to tell the browser that a server allows requests from a specific origin. When a browser makes a cross-origin request, it checks the response for the `Access-Control-Allow-Origin` header. If the header matches the requester's origin or is a wildcard (`*`), the browser allows the frontend to read the response.

## Preflight Requests
For 'complex' requests (like those using `PUT` or `DELETE` or custom JSON headers), the browser sends an `OPTIONS` request first. This is a 'preflight' check to ask the server: "Are you okay with me sending this specific request?" The server must respond with a 200 OK and the correct allowed methods and origins before the actual request is sent.

## Worked Example: Procurement Approval
Suppose a manager approves a request via a frontend at `https://manager.app`. The backend (Jakarta EE) needs to allow this:

```java
// Illustrative filter excerpt
response.setHeader("Access-Control-Allow-Origin", "https://manager.app");
response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
response.setHeader("Access-Control-Allow-Headers", "Content-Type");
```
Outcome: The browser sees the header matches `https://manager.app` and allows the approval confirmation to be read by the UI.

## Common Mistake: Confusing CORS with Auth
A frequent error is thinking CORS is a security wall that stops requests from reaching the server. In reality, CORS is a browser-enforced policy for *reading* the response. A request can still hit your server and change data in the database even if the browser blocks the response. You still need proper server-side authentication and authorization.

## Practical Exercise
If your frontend is at `http://localhost:3000` and your server sends `Access-Control-Allow-Origin: http://localhost:8080`, will the browser allow the frontend to read the data?

**Answer:** No, because the origin in the header must match the requester's origin (`localhost:3000`) or be a wildcard.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
