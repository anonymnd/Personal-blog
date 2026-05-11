---
title: "What Is a Circuit Breaker?"
description: "Learn how the Circuit Breaker pattern prevents cascading failures in distributed systems by stopping requests to a failing service."
pubDate: 2026-10-15T23:48:00.000Z
translationKey: 224-what-is-a-circuit-breaker
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a Requester submits a purchase request, and the system must call an external Tax Calculation API to determine the final cost. Suddenly, the Tax API goes down or becomes extremely slow. Your application keeps sending requests, and because each request waits for a timeout, your server's threads fill up. Eventually, your entire procurement app crashes, even though only the tax service was broken. This is a cascading failure.

## The Core Mechanism

A Circuit Breaker acts as a proxy between your application and the remote service. It monitors for failures and operates in three distinct states:

1. **Closed**: Requests flow normally. The breaker counts failures. If failures exceed a threshold, it "trips" to Open.
2. **Open**: The breaker immediately rejects requests (fail-fast) without even trying to call the remote service. This gives the failing service time to recover.
3. **Half-Open**: After a timeout, the breaker allows a few test requests. If they succeed, it closes; if they fail, it returns to Open.

## Worked Example: Procurement Approval

In our app, when a Manager approves a request, the system calls a Notification Service. If the Notification Service is lagging, the Circuit Breaker triggers:

- **Scenario**: 5 consecutive timeouts occur.
- **Action**: Circuit moves to **Open**. 
- **Outcome**: For the next 30 seconds, any Manager clicking "Approve" gets an immediate message: "Notification system unavailable, approval saved locally." The system doesn't hang, and the database isn't overwhelmed by waiting threads.

## Common Mistake: Confusing with Retries

A common error is using a Retry loop instead of a Circuit Breaker. Retries are dangerous when a service is overloaded because they add *more* traffic to a struggling system (a "retry storm"). A Circuit Breaker does the opposite: it stops the traffic entirely until the system is healthy.

## Implementation Excerpt

Using a library like Resilience4j in a Jakarta EE environment:

```java
@CircuitBreaker(name = "taxService", fallbackMethod = "calculateTaxFallback")
public BigDecimal getTax(Request request) {
    return taxClient.callRemoteApi(request);
}

public BigDecimal calculateTaxFallback(Request request, Throwable t) {
    return BigDecimal.ZERO; // Return a safe default
}
```

## Practical Exercise

**Question**: If a circuit is in the 'Open' state and a request arrives, does the application attempt to contact the remote server?

**Answer**: No. It fails fast immediately to protect the system and the remote service.
