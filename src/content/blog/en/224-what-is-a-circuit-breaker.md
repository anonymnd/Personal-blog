---
title: "Use Circuit Breakers to Contain Dependency Failures"
description: "Learn how to prevent cascading failures in distributed systems using the Circuit Breaker pattern to manage unstable dependencies."
pubDate: 2026-10-08T17:48:00.000Z
translationKey: 224-what-is-a-circuit-breaker
seriesOrder: 50
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## The Problem: Cascading Failures

In a distributed system, a service often depends on others to complete a request. Consider a Checkout service that calls a Shipping Estimate service. If the Shipping service becomes sluggish or hangs without timing out, the Checkout service's worker threads will wait. Under high load, all available threads in the Checkout service become blocked, waiting for responses that may never come. This exhausts the thread pool, causing the Checkout service to crash or stop responding to other requests that don't even require shipping estimates. This is a cascading failure.

## The Circuit Breaker Mechanism

A Circuit Breaker acts as a proxy between the caller and the dependency. It monitors for failures and transitions through three primary states:

1. **Closed**: The normal state. Requests flow through to the dependency. The breaker tracks the success/failure rate. If the failure count or rate exceeds a predefined threshold (e.g., 5 failures or 50% of the last 100 calls), the breaker trips to the Open state.
2. **Open**: The breaker immediately rejects requests without calling the dependency. It returns a failure or a fallback response. This prevents the caller from wasting resources on a known-failing service and gives the dependency time to recover.
3. **Half-Open**: After a configured "sleep window," the breaker allows a limited number of probe requests. If these probes succeed, the breaker assumes the service is healthy and returns to Closed. If any probe fails, it immediately returns to Open.

## Interaction with Timeouts and Retries

Circuit breakers do not replace timeouts or retries; they coordinate with them:

* **Timeouts**: Essential to prevent threads from hanging indefinitely. A timeout triggers a failure, which the Circuit Breaker then counts toward the threshold.
* **Retries**: Retrying against a failing service can worsen the outage (a "retry storm"). The Circuit Breaker prevents this by opening the circuit, ensuring that retries are blocked until the system is likely recovered.

## Worked Example: Checkout to Shipping

Imagine a system where the Shipping service is failing. We implement a Circuit Breaker with a failure threshold of 3 and a sleep window of 5 seconds.

**Trace of Events:**
1. **Request 1-3**: Shipping service times out. Circuit Breaker records 3 failures. State: **Closed → Open**.
2. **Request 4-10**: Circuit Breaker sees state is **Open**. It immediately returns a `FallbackShippingEstimate` (e.g., a flat rate of $10) without calling the Shipping service. Worker threads are released instantly.
3. **Wait**: 5 seconds pass.
4. **Request 11**: State transitions to **Half-Open**. The breaker allows one request to the Shipping service.
5. **Outcome A**: Request 11 fails → State returns to **Open**. Timer resets.
6. **Outcome B**: Request 11 succeeds → State returns to **Closed**. Traffic resumes.

## Fallback Quality and Scope

A fallback is the logic executed when the circuit is open. The quality of the fallback determines the user experience:
* **Static Fallback**: Returning a default value (e.g., "Shipping calculated at checkout").
* **Cached Fallback**: Returning the last known good value from a local cache.
* **Degraded Functionality**: Skipping the feature entirely but allowing the rest of the process to continue.

## Exercise

Define the threshold policy before solving the trace. Suppose this toy breaker opens after five failures in its current ten-call window, successes do not reset that count, and the open interval is ten seconds. Four failures, one success and two more failures cross the threshold on the first of those last two calls; the remaining call is rejected while open. After the wait, one permitted half-open probe fails, so the breaker reopens.

A five-consecutive-failures policy would give a different answer because the success resets its count. Real libraries may use rates, minimum sample sizes, slow-call thresholds and several probes. Configure timeout and retry order deliberately; a breaker does not automatically cancel a hanging call or guarantee no retry amplification. Mark any flat shipping fallback as an estimate, not a binding quote invented during an outage.
