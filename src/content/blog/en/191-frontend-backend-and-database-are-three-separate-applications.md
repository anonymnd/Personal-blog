---
title: "Frontend, Backend and Database Are Three Separate Applications"
description: "Understand the logical and physical separation between the user interface, the server logic, and the data storage layer."
pubDate: 2026-10-14T14:48:00.000Z
translationKey: 191-frontend-backend-and-database-are-three-separate-applications
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Many beginners struggle with the 'invisible wall' between their HTML page and their database. They often wonder why they cannot simply write a SQL query inside a JavaScript function in the browser. The reality is that the Frontend, Backend, and Database are three distinct logical entities that operate in different environments.

## The Browser Environment (Frontend)
The frontend is the code that is downloaded and executed on the user's machine. Whether it is React, Vue, or plain HTML, it lives in the browser. Because it runs on the client side, it has no direct access to your database for security reasons; if it did, any user could open the developer console and delete your entire dataset.

## The Server Environment (Backend)
The backend is a separate application running on a remote server (using Java Jakarta EE, Node.js, or Python). It acts as the gatekeeper. It receives requests from the frontend, validates the user's identity, applies business logic, and then communicates with the database.

## The Data Layer (Database)
The database is a specialized piece of software (like PostgreSQL or MongoDB) that manages data storage. It only speaks to the backend. It does not know the frontend exists.

## Worked Example: Procurement Request
Imagine a procurement app where a requester submits a purchase request:
1. **Frontend**: The user fills a form and clicks 'Submit'. The browser sends an HTTP POST request to `https://api.company.com/requests`.
2. **Backend**: The Java server receives the request, checks if the user has a valid session, and runs a command: `INSERT INTO requests (item, qty) VALUES ('Laptop', 1);`.
3. **Database**: The DB stores the row and sends a confirmation back to the backend.
4. **Backend**: The server sends a `201 Created` response back to the browser.

## Common Mistake: Direct DB Connection
A common error is trying to use a database driver (like JDBC) directly in the frontend code. 
**Correction**: Always use an API layer. The frontend calls a REST endpoint, and the backend handles the database driver.

## Practical Exercise
If a frontend application is hosted at `http://localhost:3000` and it tries to fetch data from a backend at `http://localhost:8080`, which component is responsible for handling the CORS policy to allow this communication?

**Answer**: The Backend server must be configured to allow requests from the frontend's origin.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
