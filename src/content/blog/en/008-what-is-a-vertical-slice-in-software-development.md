---
title: "What Is a Vertical Slice in Software Development?"
description: "Learn how to deliver functional value early by implementing a single feature across all architectural layers instead of building layer by layer."
pubDate: 2026-10-06T23:48:00.000Z
translationKey: 008-what-is-a-vertical-slice-in-software-development
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Your manager asks for a progress update, and you show them a beautifully designed database schema and a set of API endpoints that return empty JSON. The manager is frustrated because they cannot actually *do* anything with the app. This is the trap of 'horizontal slicing,' where you build the entire database layer, then the entire service layer, before ever touching the UI.

## The Concept of the Vertical Slice

A vertical slice is a development approach where you implement one small, end-to-end feature. Instead of building the whole foundation first, you cut a thin slice through every layer of the architecture: the UI, the business logic, and the data storage. The goal is to produce a working piece of functionality that delivers actual business value, allowing you to test your architectural assumptions early.

## Applying it to a Procurement App

Instead of building the entire 'User Management' system, start with one specific outcome: "A requester can submit a purchase request." 

**Business Rules:**
- The request must have an item name and a quantity.
- The request status starts as 'Pending'.

**Acceptance Criteria:**
- User fills a form and clicks 'Submit'.
- The data is saved in the database.
- A success message appears on the screen.

## Worked Example: The Request Submission

In a Jakarta EE context, a vertical slice for this feature would look like this illustrative excerpt:

```java
@Path("/requests")
public class RequestResource {
    @Inject RequestService service;

    @POST
    public Response submitRequest(PurchaseRequest req) {
        service.save(req); // Logic to set status to 'Pending'
        return Response.ok("Request Submitted").build();
    }
}
```

Outcome: The requester can now actually send a request. You have proven that your API, service, and database are communicating correctly.

## Common Mistake: The 'Infrastructure First' Trap

A common error is spending two weeks perfecting the generic repository pattern or the global error handler before implementing the first feature. 

**Correction:** Build the simplest possible path for the first slice. If you need a repository, create a basic one. Refactor it into a generic pattern only after you have three or four slices that reveal a common pattern.

## Practical Exercise

**Scenario:** You need to add a 'Manager Approval' feature to the procurement app. Define what a vertical slice for this would look like.

**Check:** Your answer should include a specific UI action (e.g., clicking an 'Approve' button), a business rule (e.g., status changes from 'Pending' to 'Approved'), and a data change (updating the record in the DB).
