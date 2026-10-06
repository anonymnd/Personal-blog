---
title: "What Is Rate Limiting?"
description: "A beginner-friendly guide to controlling traffic flow to prevent system crashes and API abuse."
pubDate: 2026-10-15T21:48:00.000Z
translationKey: 222-what-is-rate-limiting
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement app where employees submit purchase requests. Suddenly, a buggy script starts sending 10,000 requests per second to the `/submit-request` endpoint. Your database locks up, the manager cannot approve any orders, and the entire system crashes. This is exactly why we need rate limiting: to protect your services from being overwhelmed by too many requests.

## How Rate Limiting Works
Rate limiting is a strategy used to limit the number of requests a user or IP address can make to a service within a specific timeframe. It acts as a gatekeeper at the entry point of your application. When a request arrives, the system checks if the user has exceeded their quota. If they have, the server rejects the request, typically returning an HTTP 429 "Too Many Requests" status code.

## L4 vs L7 Rate Limiting
Depending on where you apply the limit, you have two main options. Layer 4 (L4) limiting happens at the transport level (TCP/UDP), focusing on IP addresses and ports. It is extremely fast but "blind" to the content of the request. Layer 7 (L7) limiting happens at the application level (HTTP), allowing you to limit based on specific API keys, user IDs, or specific endpoints like `/order-payment`.

## Common Algorithms
Different needs require different algorithms. The **Token Bucket** allows for a certain amount of "burstiness"; users can save up tokens and spend them quickly, provided they don't exceed the long-term average. The **Leaky Bucket** is stricter, processing requests at a constant, smooth rate regardless of bursts. For simple windows, the **Fixed Window** resets at specific times (e.g., every hour), though it can allow double the traffic at the window boundary.

## Worked Example: Procurement API
Suppose we limit the `/approve-request` endpoint to 5 requests per minute per manager to prevent accidental double-clicks or script errors.

```java
// Illustrative excerpt of a rate limit check
public Response handleApproval(Request req) {
    String managerId = req.getUserId();
    if (rateLimiter.isExceeded(managerId, 5, Duration.ofMinutes(1))) {
        return Response.status(429).entity("Slow down, manager!").build();
    }
    return procurementService.approve(req.getId());
}
```
Outcome: If a manager clicks "Approve" 6 times in 30 seconds, the 6th request is blocked immediately, saving the database from redundant processing.

## Common Mistake: Local vs Distributed State
A frequent error is storing the request count in a local variable inside the application code. If you have three server instances, a user could send 3x the allowed limit because each server tracks the count separately. To fix this, use a shared external state like Redis to track counts across all instances.

## Practical Exercise
If a system uses a Leaky Bucket algorithm and the bucket leaks at 2 requests per second, what happens if a user sends 10 requests in one single second?

**Answer:** 2 requests are processed immediately, and the remaining 8 are either queued (if the bucket has space) or dropped immediately if the bucket is full.
