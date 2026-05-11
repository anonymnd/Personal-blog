---
title: "Where Should Business Logic Live: Frontend or Backend?"
description: "A guide to deciding where to place validation and rules to ensure application security and performance."
pubDate: 2026-10-14T20:48:00.000Z
translationKey: 197-where-should-business-logic-live-frontend-or-backend
locale: en
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. You add a rule: 'Requests over $1,000 need manager approval.' You implement this check in the React frontend to show a warning. However, a savvy user opens the browser console and sends a manual API request for $5,000, bypassing your UI check entirely. The request is processed because the server didn't verify the rule. This is the classic struggle of business logic placement.

## The Role of Frontend Logic
Frontend logic is primarily for User Experience (UX). Its goal is to provide immediate feedback. When you check if an email is formatted correctly or if a required field is empty before the user hits 'Submit', you are using frontend logic. This prevents unnecessary network round-trips and makes the app feel snappy. However, because the browser is an environment controlled by the user, any logic here can be bypassed or modified.

## The Necessity of Backend Logic
Backend logic is the 'Source of Truth'. It is responsible for security, data integrity, and business rules. Regardless of what the frontend sends, the server must validate the request. In our procurement app, the backend must check the request amount against the user's permissions before saving it to the database. This is non-negotiable because the server is the only environment the developer fully controls.

## A Worked Example: Approval Workflow
Consider a request submission. The frontend handles the 'visual' logic, while the backend handles the 'authoritative' logic.

**Frontend (Illustrative Excerpt):**
```javascript
if (requestAmount > 1000) {
  showNotification("This will require manager approval");
}
```
**Backend (Jakarta EE Excerpt):**
```java
public Response processRequest(PurchaseRequest req) {
    if (req.getAmount() > 1000 && !req.isManagerApproved()) {
        return Response.status(403).entity("Approval required").build();
    }
    return service.save(req);
}
```
**Outcome:** The user sees a helpful hint in the UI, but the system remains secure even if the UI is bypassed.

## Common Mistake: Trusting the Client
A frequent error is implementing a complex calculation (like a discount price) only on the frontend and sending the final total to the server. A user can change the price to $0.01 in the request body. 

**Correction:** Send only the item ID and quantity. Let the backend calculate the price using the database's official price list.

## Practical Exercise
Scenario: A user must be at least 18 years old to register. Where should this check happen?

**Answer:** Both. Frontend for a better UX (instant error message), and Backend to prevent unauthorized registrations via API tools.


## Further reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
