---
title: "What Is Cache-Aside?"
description: "A deep dive into the Cache-Aside pattern for optimizing database read performance in distributed systems."
pubDate: 2026-10-15T19:48:00.000Z
translationKey: 220-what-is-cache-aside
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imagine your application is struggling because every single user request triggers a heavy SQL query to fetch procurement data. Your database CPU spikes to 90%, and the page load time becomes unbearable. You realize that while the data doesn't change every second, you are fetching the same 'Approved Purchase Orders' list thousands of times per minute. This is where the Cache-Aside pattern becomes essential.

## How the Mechanism Works
In a Cache-Aside architecture, the application is responsible for managing the relationship between the data store (Database) and the cache (like Redis). Unlike other patterns where the cache sits 'in front' of the DB automatically, here the application logic decides when to read from or write to the cache. When the app needs data, it first checks the cache. If the data is there (a cache hit), it returns it immediately. If not (a cache miss), the app fetches the data from the database, stores a copy in the cache for next time, and then returns it to the user.

## Worked Example: Procurement Request
Consider a procurement app where a manager views a specific request. 
1. **Request**: Manager requests `Request_ID: 505`.
2. **Check**: App checks Redis for key `req_505`. Result: *Miss*.
3. **Fetch**: App queries PostgreSQL: `SELECT * FROM requests WHERE id = 505`.
4. **Populate**: App saves the result in Redis with a TTL (Time to Live) of 30 minutes.
5. **Return**: Manager sees the request details.

Next time the manager refreshes, the app finds `req_505` in Redis (Hit) and skips the database entirely.

## The Stale Data Problem
One major challenge is data consistency. If a buyer updates the status of `req_505` to 'Ordered' in the database, the cache still holds the old 'Approved' status. To fix this, you must implement an invalidation strategy. The most common approach is to delete the cache key immediately after updating the database. This forces the next read to fetch the fresh data from the DB.

## Common Mistake: Updating Instead of Deleting
Developers often try to update the cache value instead of deleting it. In high-concurrency environments, two simultaneous updates can lead to a race condition where the cache ends up with an older value than the database. **Correction**: Always delete the cache key on write; let the next read repopulate it.

## Practical Exercise
If you have a Cache-Aside setup and you update a record in the DB but forget to invalidate the cache, what happens to the user experience?

**Answer**: The user will see stale (outdated) data until the cache entry expires naturally via its TTL.
