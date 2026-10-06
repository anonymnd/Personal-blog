---
title: "What Happens When You Click a Button in a Web Application?"
description: "A step-by-step breakdown of the journey from a browser click to a server response and back."
pubDate: 2026-10-14T16:48:00.000Z
translationKey: 193-what-happens-when-you-click-a-button-in-a-web-application
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are using a procurement app. You've filled out a request for a new laptop, and now you're staring at the 'Submit Request' button. You click it, and a loading spinner appears. But what is actually happening behind the scenes in those few milliseconds?

## The Event Trigger
When you click the button, the browser detects a 'click event'. In the frontend code (JavaScript), an event listener is waiting for this specific action. Instead of refreshing the whole page, modern apps use an API call (like `fetch` or `axios`) to send data asynchronously. The browser packages your request into an HTTP packet containing a method (usually POST), a destination URL, and the request body (the laptop details in JSON format).

## The Network Journey and CORS
Before the request leaves the browser, it checks the 'Origin' (scheme, host, and port). If the API is on a different domain than the website, the browser enforces CORS (Cross-Origin Resource Sharing). It's important to note that CORS is a browser-enforced policy to prevent unauthorized reading of responses; it doesn't stop the request from reaching the server, but it might block the browser from letting your JavaScript read the answer if the server doesn't give permission.

## Server-Side Processing
Once the request hits the server, a controller receives it. In a Java Jakarta EE environment, it might look like this:

```java
@POST
@Path("/requests")
public Response submitRequest(ProcurementRequest request) {
    // Business logic: check if requester has budget
    boolean approved = budgetService.verify(request.getAmount());
    return Response.ok(new ResponseDto("Submitted", approved)).build();
}
```
The server processes the business logic, interacts with a database to save the request, and generates an HTTP response (e.g., `201 Created` or `400 Bad Request`).

## The Frontend Update
The browser receives the response. The JavaScript promise resolves, and the code updates the DOM (Document Object Model) to hide the spinner and show a success message. 

## Common Mistake: Relying on CORS for Security
A frequent error is thinking CORS is a security wall that stops malicious requests. In reality, CORS only protects the browser user. A hacker using a terminal (curl) can bypass CORS entirely. You must always implement server-side authorization to verify who is making the request.

## Practical Exercise
If a button click sends a request to `api.company.com` from `app.company.com` and the browser console shows a 'CORS error', did the server receive the request?

**Answer:** Yes, the request usually reaches the server, but the browser blocks the frontend from reading the response because the server's headers didn't allow that origin.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
