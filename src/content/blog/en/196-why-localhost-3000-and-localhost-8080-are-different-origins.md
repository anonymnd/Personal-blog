---
title: "Why localhost:3000 and localhost:8080 Are Different Origins"
description: "Understand how the browser defines an origin and why different ports trigger CORS restrictions during local development."
pubDate: 2026-10-14T19:48:00.000Z
translationKey: 196-why-localhost-3000-and-localhost-8080-are-different-origins
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have a React app running on `localhost:3000` and a Spring Boot API on `localhost:8080`. You send a fetch request to get data, but the browser blocks the response with a red error mentioning 'CORS'. You might wonder: 'They are both on my machine, why does the browser think they are different?'

## The Anatomy of an Origin
In web security, an **Origin** is not just the domain name. It is a strict combination of three specific components: the **Scheme** (protocol), the **Host**, and the **Port**. If any one of these three differs, the browser treats the request as 'Cross-Origin'.

| Component | Origin A | Origin B | Match? |
| :--- | :--- | :--- | :--- |
| Scheme | http | http | Yes |
| Host | localhost | localhost | Yes |
| Port | 3000 | 8080 | **No** |

Because the ports differ, `http://localhost:3000` and `http://localhost:8080` are entirely different origins.

## How the Browser Enforces the Same-Origin Policy
The Same-Origin Policy (SOP) is a security measure that prevents a script loaded from one origin from reading data from another. It is important to note that SOP does not necessarily block the *sending* of a request. A 'simple request' might reach your server and even trigger a database change, but the browser will block the JavaScript code from reading the response unless the server explicitly allows it via CORS (Cross-Origin Resource Sharing) headers.

## Worked Example: Procurement Request
Imagine a procurement app where a requester on port 3000 submits a purchase request to a backend on port 8080.

**Frontend Request:**
```javascript
fetch('http://localhost:8080/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'Laptop', qty: 1 })
});
```

**Outcome:** The browser sends the request. The server processes it and returns a `201 Created`. However, because the server didn't send an `Access-Control-Allow-Origin` header, the browser blocks the frontend from seeing the success message, throwing a CORS error.

## Common Mistake: The Wildcard Trap
Developers often use `@CrossOrigin("*")` in Jakarta EE/Spring to fix this. While this works for public APIs, it fails when you need to send cookies or authorization headers (credentials). If `credentials` is set to `include` in the fetch request, the server **cannot** use a wildcard `*`; it must specify the exact origin `http://localhost:3000`.

## Practical Exercise
If your frontend is at `https://app.local` and your backend is at `https://api.local`, are they the same origin?

**Answer:** No. The hosts (`app.local` vs `api.local`) are different, making them different origins.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
