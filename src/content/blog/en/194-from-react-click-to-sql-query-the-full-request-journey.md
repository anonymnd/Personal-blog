---
title: "From React Click to SQL Query: The Full Request Journey"
description: "A step-by-step breakdown of how a user interaction in a React frontend triggers a data retrieval process in a SQL database."
pubDate: 2026-10-14T17:48:00.000Z
translationKey: 194-from-react-click-to-sql-query-the-full-request-journey
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A manager clicks an 'Approve' button on a purchase request, but you aren't sure what actually happens between that mouse click and the database record updating. This gap between the UI and the disk is where most beginners get lost.

## The Trigger: React Event Handling
Everything starts with an event listener. In React, the button has an `onClick` handler. When clicked, this function triggers an asynchronous HTTP request, usually via the `fetch` API or Axios. The browser packages this request with a URL, a method (like POST), and a body containing the request ID.

## The Bridge: HTTP and CORS
The request travels over the network to the server. Before the browser allows the frontend to read the response, it checks CORS (Cross-Origin Resource Sharing). If your React app is on `localhost:3000` and your API is on `localhost:8080`, the browser ensures the server explicitly allows this origin. Note that CORS is a browser-enforced security policy to prevent unauthorized reading of data, not a replacement for server-side authentication.

## The Logic: Backend Controller
Once the request hits the server (e.g., a Spring Boot app), a Controller intercepts it. It parses the JSON body and passes the data to a Service layer. Here, the business logic happens: the system checks if the user has the actual authority to approve this specific procurement request before proceeding to the database.

## The Final Step: SQL Execution
Finally, the backend uses a repository to execute a SQL query. For our procurement app, it might look like this:

```sql
UPDATE purchase_requests 
SET status = 'APPROVED' 
WHERE id = 123 AND status = 'PENDING';
```

## Common Mistake: Relying on CORS for Security
A frequent error is thinking that configuring CORS prevents unauthorized users from hitting your API. In reality, CORS only stops the *browser* from reading the response. A malicious actor using a terminal (cURL) can bypass CORS entirely. You must always validate the user's session and permissions on the server.

## Practical Exercise
If a React app sends a request to an API and the browser console shows a 'CORS error', but the database record was actually updated, why did this happen?

**Answer:** The request reached the server and executed the SQL, but the server didn't send the correct `Access-Control-Allow-Origin` header, so the browser blocked the frontend from reading the success response.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
