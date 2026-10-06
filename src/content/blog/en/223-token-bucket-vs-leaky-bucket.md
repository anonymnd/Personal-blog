---
title: "Token Bucket vs Leaky Bucket"
description: "A comparative guide to understanding rate limiting algorithms for managing traffic bursts and smoothing flow in system design."
pubDate: 2026-10-15T22:48:00.000Z
translationKey: 223-token-bucket-vs-leaky-bucket
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system where employees submit purchase requests. Suddenly, at the end of the quarter, hundreds of users submit requests simultaneously. If your server processes every request the instant it arrives, the database might crash. You need a way to control this flow, but should you allow short bursts of activity or force a perfectly steady stream?

## The Token Bucket Mechanism
In a Token Bucket, a bucket holds a maximum number of tokens. Tokens are added at a constant rate. When a request arrives, it must 'spend' a token to be processed. If the bucket is empty, the request is dropped or delayed. The key advantage here is that if the bucket is full, a sudden burst of requests can be handled immediately until the tokens run out.

## The Leaky Bucket Mechanism
Think of the Leaky Bucket as a funnel. Requests enter the bucket at any speed, but they 'leak' out of the bottom at a fixed, constant rate. If the bucket fills up because requests are coming in faster than they leak, new requests overflow and are discarded. Unlike the Token Bucket, this algorithm completely smooths out bursts, ensuring the downstream system sees a predictable load.

## Practical Example: Procurement App
Consider a `PurchaseRequestController` using these strategies:

| Feature | Token Bucket | Leaky Bucket |
| :--- | :--- | :--- |
| **Burst Handling** | Allows bursts up to bucket size | No bursts allowed |
| **Output Rate** | Variable (bursty) | Constant (smooth) |
| **Use Case** | API endpoints with occasional spikes | Background processing tasks |

```java
// Illustrative excerpt of a Token Bucket check
public boolean allowRequest() {
    long now = System.currentTimeMillis();
    refillTokens(now);
    if (currentTokens > 0) {
        currentTokens--;
        return true;
    } 
    return false;
}
```

## Common Mistake: Confusing the Two
Developers often think Leaky Bucket allows bursts because the 'bucket' holds requests. In reality, while it *buffers* requests, the *processing* rate remains rigid. If you need to support a user who occasionally sends 10 requests in one second but averages 1 per second, a Leaky Bucket will throttle them, while a Token Bucket will let them through.

## Practical Exercise
Scenario: You have a system that sends email notifications. You want to ensure the email provider doesn't ban you by limiting the output to exactly 5 emails per second, regardless of how many are triggered by the app. Which algorithm should you use?

**Answer:** Leaky Bucket, because it enforces a strict, constant output rate.
