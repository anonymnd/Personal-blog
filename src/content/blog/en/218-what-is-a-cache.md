---
title: "What Is a Cache?"
description: "A beginner-friendly guide to understanding how caching optimizes system performance by storing frequently accessed data in high-speed memory."
pubDate: 2026-10-15T17:48:00.000Z
translationKey: 218-what-is-a-cache
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are a procurement manager. Every time a requester asks for the status of a purchase order, you have to walk to a physical archive room in the basement, find the folder, and read the status. If ten people ask for the same order, you make ten trips. This is how a system feels when it fetches data from a slow disk-based database every single time.

## The Core Mechanism
Caching is the process of storing copies of data in a temporary, high-speed storage layer (the cache) so that future requests for that data can be served faster. While a database lives on a hard drive (slow), a cache typically lives in RAM (fast). When a request comes in, the system first checks the cache. If the data is there, it is a 'cache hit'; if not, it is a 'cache miss,' and the system must fetch it from the primary source.

## Cache-Aside Pattern
In a procurement app, the most common strategy is 'Cache-Aside'. Here is how it works:
1. The app checks the cache for `order_123`.
2. **Miss:** The app queries the database, gets the order, and stores it in the cache for next time.
3. **Hit:** The app returns the cached data immediately.

```java
// Illustrative excerpt of Cache-Aside logic
public Order getOrder(String id) {
    Order order = cache.get(id);
    if (order == null) {
        order = database.findOrder(id);
        cache.put(id, order, Duration.ofMinutes(10));
    }
    return order;
}
```

## The Trade-off: Stale Data
The biggest challenge is 'cache invalidation'. If a manager approves a request, the database is updated, but the cache still holds the old 'Pending' status. This is called stale data. To fix this, you must either delete the cache entry when the data changes or set a Time-to-Live (TTL) so the data expires automatically.

## Common Mistake: The Cache as a Database
A frequent error is treating a cache like Redis as a primary database. Caches are volatile; if the server restarts, the data is gone. Always ensure your primary database remains the 'source of truth'.

## Practical Exercise
**Scenario:** A user updates their profile name. You have a cache with a 24-hour TTL. Why is this a problem, and how do you fix it?

**Answer:** The user will see their old name for up to 24 hours (stale data). The fix is to explicitly call `cache.remove(userId)` immediately after the database update.
