---
title: "Why Distributed Systems Need Circuit Breakers"
description: "Learn how the Circuit Breaker pattern prevents cascading failures in microservices by stopping requests to failing dependencies."
pubDate: 2026-10-16T00:48:00.000Z
translationKey: 225-why-distributed-systems-need-circuit-breakers
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine your procurement app where a Requester submits a purchase request. The Request Service must call an external Inventory Service to check stock. If the Inventory Service slows down or crashes, the Request Service keeps sending requests, hanging its own threads while waiting for a timeout. Soon, all available threads are exhausted, and the entire procurement system crashes—even parts that don't need the inventory check. This is a cascading failure.

## The Mechanism of Failure
In a distributed system, a failure in one service can act like a domino. Without a circuit breaker, a client will repeatedly try to call a failing service. This puts more pressure on the struggling service, making it harder for it to recover, while simultaneously draining the resources of the caller.

## How the Circuit Breaker Works
The pattern operates like an electrical circuit breaker with three states:
1. **Closed**: Requests flow normally. The system tracks the number of failures.
2. **Open**: When failures hit a threshold, the circuit "trips." All calls fail immediately with an error without even trying to hit the network.
3. **Half-Open**: After a timeout, the system allows a few test requests to see if the service has recovered. If they succeed, it closes; otherwise, it opens again.

## Worked Example: Procurement Approval
Consider a Manager approving a request. The Approval Service calls a Notification Service to email the buyer. 

```java
// Illustrative excerpt using a conceptual circuit breaker
public Response approveRequest(Long requestId) {
    return circuitBreaker.execute(() -> {
        // Call to Notification Service (L7 HTTP call)
        return notificationClient.sendEmail(requestId);
    }, fallback() -> {
        // Return a cached response or queue for later
        return Response.accepted("Approval saved, notification pending");
    });
}
```
**Outcome**: If the Notification Service is down, the Manager still sees "Approval saved" instantly instead of the screen freezing for 30 seconds before showing a 504 Gateway Timeout.

## Common Mistake: Confusing with Retries
A frequent error is replacing a circuit breaker with a retry loop. Retries are dangerous when a service is overloaded; they act like a self-inflicted Denial of Service (DoS) attack. A circuit breaker *stops* the calls, whereas a retry *increases* them.

## Practical Exercise
**Scenario**: Your system has a 50% failure rate on a dependency. You have a circuit breaker that trips after 5 consecutive failures. Will the circuit open if the failures are interleaved (Fail, Success, Fail, Success)?

**Answer**: No. Because the failures are not consecutive, the counter resets or doesn't hit the threshold, keeping the circuit Closed.
