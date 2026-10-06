---
title: "Why the Frontend Should Never Connect Directly to the Database"
description: "An exploration of the critical security and architectural risks of bypassing the backend layer in web applications."
pubDate: 2026-10-14T15:48:00.000Z
translationKey: 192-why-the-frontend-should-never-connect-directly-to-the-database
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Imagine you are building a procurement app where a requester submits a purchase request. If your React or Vue frontend connects directly to your PostgreSQL database using a connection string, you have just handed the keys of your entire warehouse to every visitor on the internet. Because frontend code is executed in the user's browser, any secret embedded there is public knowledge.

## The Exposure of Credentials
When a browser connects to a database, it needs a username and password. Since the browser is a client-side environment, a user can simply open the 'Developer Tools' and find these credentials in the source code or network tab. Once an attacker has these, they can bypass your UI entirely and run commands like `DROP TABLE users;` or `UPDATE salaries SET amount = 999999;` using a standard database client.

## The Lack of Business Logic
Connecting directly means the database handles the request without a 'gatekeeper'. In our procurement app, a requester should only be able to create a request, not approve it. If the frontend talks to the DB, the only thing stopping a user from approving their own expensive request is a hidden button in the UI. A malicious user can send a direct SQL update to change the status to 'Approved' because there is no server-side code to verify if the user has the 'Manager' role.

## CORS and Network Constraints
Browsers enforce a Cross-Origin Resource Sharing (CORS) policy. While CORS is a browser-side security mechanism to prevent unauthorized cross-origin reading of responses, most databases aren't designed to handle HTTP-based CORS preflight requests. Attempting to bridge this gap usually leads to developers disabling security settings, which further exposes the system.

## A Worked Example: The Wrong Way vs. The Right Way
**Wrong Way (Direct):**
`Frontend` $ightarrow$ `SQL: UPDATE requests SET status='Approved' WHERE id=101` $ightarrow$ `Database` (No check if user is a manager).

**Right Way (Via Backend):**
`Frontend` $ightarrow$ `POST /api/approve/101` $ightarrow$ `Backend (Jakarta EE/Spring)` $ightarrow$ `Database`.

In the right way, the backend performs a check: `if (!user.hasRole("MANAGER")) throw new UnauthorizedException();`. Only then is the SQL executed.

## Common Mistake: Relying on Frontend Validation
Developers often think that hiding a field or using a `disabled` attribute on a button is security. 
**Correction:** Always assume the frontend is compromised. Every request hitting the database must be validated and authorized by a backend service.

## Practical Exercise
If a procurement app allows a user to change the price of an item via a direct database connection, what is the most effective way to prevent this?

**Answer:** Implement a backend API layer that validates the user's permissions and ensures only authorized 'Buyers' can modify price fields before sending the update to the database.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
