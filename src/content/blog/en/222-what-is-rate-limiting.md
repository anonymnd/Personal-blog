---
title: "Choose Rate-Limiting Algorithms for Bursts and Fairness"
description: "A technical guide on Token Bucket vs Leaky Bucket algorithms, burst calculations, and client-level fairness for a geocoding API."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 222-what-is-rate-limiting
seriesOrder: 49
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## Rate Limiting Purpose and Key Selection

Rate limiting prevents service degradation by controlling the rate of incoming requests. The primary goal is to protect resources from being overwhelmed by a single malicious or malfunctioning client, ensuring high availability for others. 

Choosing the right "key" for the limiter is critical. A global limiter (one limit for the entire API) is dangerous because one aggressive user can trigger a 429 Too Many Requests response for every other user. Instead, per-client limiting (using an API key or User ID) ensures fairness: only the offender is throttled.

## Token Bucket vs. Leaky Bucket

While both control traffic, they handle "bursts" differently.

**Token Bucket**: Imagine a bucket that holds tokens. Tokens are added at a constant rate (the refill rate). Each request consumes one token. If the bucket is full, new tokens are discarded. If the bucket is empty, the request is rejected. This allows for a "burst" of traffic up to the bucket's capacity, provided tokens have accumulated.

**Leaky Bucket**: Imagine a bucket with a hole at the bottom. Requests enter the bucket and "leak" out to the processing engine at a fixed, constant rate. If the bucket overflows, new requests are dropped. This smooths out traffic completely, eliminating bursts in favor of a steady stream.

## Worked Scenario: Geocoding API

Consider a geocoding API with the following configuration:
- **Refill Rate**: 5 requests per second (rps)
- **Bucket Capacity**: 10 tokens

### Burst Calculation
If the API has been idle for several seconds, the bucket is full (10 tokens). 

1. **T=0s**: A client sends 12 requests instantly. 
   - 10 requests are processed immediately (consuming the burst capacity).
   - 2 requests are rejected with a 429 status.
2. **T=1s**: The bucket has refilled by 5 tokens. 
   - The client can now send 5 more requests immediately.

### The 429 and Retry-After Tradeoff
When a request is rejected, the server returns an HTTP 429. To prevent the client from immediately retrying and hammering the server, the `Retry-After` header should be included. 

- **Short Retry-After**: Encourages fast recovery but can lead to "thundering herd" problems if many clients retry at the exact same millisecond.
- **Long Retry-After**: Protects the server more effectively but degrades user experience.

## Implementation Considerations

To enforce one aggregate quota across instances, coordinate token consumption atomically—for example in Redis, at a gateway, or through another designed limiter. Redis is one implementation, not a universal requirement. Independent local buckets multiply a quota unless traffic allocation is deliberately accounted for. Choose failure behavior when the limiter store is unavailable.

Combine per-client quotas for fairness with a global capacity limit when needed; neither alone guarantees availability. Identity keys must be trusted, and IP-based limits can group many users behind NAT. The examples assume no intervening requests, an initially stated bucket balance and a documented refill policy. The leaky-bucket description is the queue/shaping variant; a policing variant can reject excess traffic without queueing.
## Exercise

**Scenario**: A system has a refill rate of 2 tokens/sec and a capacity of 5. The bucket is currently empty. 
1. How many requests can be processed at T=3 seconds?
2. If 10 requests arrive at T=3 seconds, how many are rejected?

**Answer**:
1. At T=3s, the bucket has refilled by 3 × 2 = 6 tokens, but it is capped at the capacity of 5. So, 5 requests can be processed.
2. 10 requests arrive, 5 are processed, and 5 are rejected.
