---
title: "Why You Should Not Cache Everything"
description: "An exploration of the trade-offs and risks associated with over-caching in distributed system design."
pubDate: 2026-10-15T20:48:00.000Z
translationKey: 221-why-you-should-not-cache-everything
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. To make the app feel 'instant,' you decide to cache every single database query in Redis. At first, the dashboard loads in milliseconds. But soon, a manager approves a request, yet the buyer still sees the status as 'Pending' for ten minutes. You have encountered the primary danger of over-caching: data inconsistency.

## The Cost of Stale Data
Caching is essentially trading freshness for speed. When you cache everything, you create a distributed state problem. If your application has multiple instances, each might hold a slightly different version of the truth. In our procurement app, if the 'Approval Status' is cached, the buyer might order an item that the manager actually rejected, leading to financial errors. This is known as the stale data problem.

## The Invalidation Nightmare
Updating a cache is harder than reading from it. You must choose an invalidation strategy. Cache-aside is common: the app checks the cache, misses, loads from the DB, and populates the cache. However, when data changes, you must explicitly delete or update the cache key. If you cache every single entity, your code becomes cluttered with invalidation logic, increasing the risk that one forgotten `cache.evict()` call leaves a bug in production.

## Resource Exhaustion and Cold Starts
Caching everything consumes expensive RAM. If your dataset is huge, you will eventually hit memory limits, triggering eviction policies like LRU (Least Recently Used). Worse is the 'Cache Stampede.' If your cache expires or crashes, thousands of simultaneous requests will hit your database at once, potentially crashing your primary data store because it was never scaled to handle the full raw load.

## Worked Example: Procurement Status
Consider this logic for fetching a request status:

```java
public String getStatus(String requestId) {
    String status = redis.get("req:" + requestId);
    if (status == null) {
        status = db.findStatus(requestId);
        redis.setex("req:" + requestId, 3600, status);
    }
    return status;
}
```
Outcome: If a manager updates the status to 'Approved' in the DB, the `getStatus` method will return 'Pending' for up to an hour unless you manually call `redis.del("req:" + requestId)` during the update process.

## Common Mistake: Caching Volatile Data
**Mistake:** Caching a 'Current Stock Level' for 30 minutes to save DB hits.
**Correction:** Only cache static data (like Category Names) or use a very short TTL (Time-to-Live) for volatile data, ensuring the system can tolerate slight delays.

## Practical Exercise
Which of these should NOT be cached for long periods: A) The list of company office locations, or B) The real-time approval status of a high-value purchase request?

**Answer:** B, because it is highly volatile and requires immediate consistency to prevent incorrect business actions.
