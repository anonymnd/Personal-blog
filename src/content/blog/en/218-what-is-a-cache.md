---
title: "Use Redis Cache-Aside Without Serving Incorrect Data"
description: "A deep dive into the Cache-Aside pattern to manage cinema screening data while preventing stale reads and cache stampedes."
pubDate: 2026-10-08T15:48:00.000Z
translationKey: 218-what-is-a-cache
seriesOrder: 48
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## The Cache-Aside Mechanism

In a Cache-Aside (or Lazy Loading) architecture, the application is responsible for managing the relationship between the database (the source of truth) and the cache (the fast-access layer). Unlike write-through caching, the cache does not automatically update when the database does. Instead, the application follows a specific logic flow: check the cache; if missing (a miss), fetch from the DB and populate the cache; if present (a hit), return the data immediately.

While this decouples the cache from the database, it introduces the risk of stale data. If a cinema screening is cancelled in the database but the cache still holds the old schedule, users will see incorrect information.

## Scenario: Cinema Screening Management

Consider a system where users query screening times for a specific movie. The data is read-heavy but occasionally updated (e.g., a screening is cancelled due to technical issues).

### The Workflow Trace

1. **Initial Read (Miss):** User requests `movie_123`. Cache is empty. App queries DB → DB returns "19:00". App stores "19:00" in Redis with a TTL (Time-to-Live) of 3600s. User sees "19:00".
2. **Subsequent Read (Hit):** Another user requests `movie_123`. App finds "19:00" in Redis. User sees "19:00" instantly.
3. **The Update (Invalidation):** An admin cancels the 19:00 screening. The app updates the DB to "Cancelled". To prevent stale data, the app must immediately issue a `DEL movie_123` command to Redis.
4. **Post-Update Read:** User requests `movie_123`. Cache is empty (due to deletion). App queries DB → DB returns "Cancelled". App stores "Cancelled" in Redis. User sees "Cancelled".

## Handling Edge Cases and Failures

A reader can load an old screening, pause, then refill the cache after another transaction commits a cancellation and invalidates the key. Invalidation after commit avoids clearing for a transaction that later rolls back, but does not by itself prevent this late stale refill. A TTL bounds how long that particular entry survives; repeated stale writes, replica lag or resets require additional analysis. Version-aware writes, coordinated invalidation or an explicit bounded-staleness policy are possible designs. Booking eligibility must still use authoritative state.

For a hot-key miss, coalesce requests so one loader refreshes while others wait or use permitted stale data. In a multi-instance service, a local mutex coalesces only within one instance; distributed leases need expiry and safe ownership handling. Negative caching stores an explicit not-found marker with a short TTL, not a Java null indistinguishable from a miss. Include tenant and relevant query dimensions in the key.
## Worked Example: Implementation Logic

Use a typed cache envelope with separate found and value fields, and a configured serializer. Redis stores bytes; Java null is not a reliable negative-cache marker. The following flow is illustrative pseudocode:

```text
GET screening:tenant-7:id-123
  MISS → database lookup
  FOUND → SET {found:true,value:...} with positive TTL
  ABSENT → SET {found:false,value:null} with short negative TTL
HIT {found:false,...} → return absent without a DB lookup
UPDATE → commit authoritative change → invalidate key
```

A cache hit saves a DB read. It does not guarantee only one DB query per hour: eviction, retries, concurrent misses and invalidations can cause more reads. If Redis fails, decide whether to fall back with bounded concurrency or fail; unlimited fallback can overload the database. Observe hit rate, load duration and stale-data incidents. After-commit invalidation still needs retry or reconciliation when the cache operation fails. The baseline trace demonstrates the normal flow, not strict consistency under all races.
## Exercise

A single premiere key expiring can trigger many concurrent misses: use request coalescing for that key. TTL jitter spreads expiration across different keys or independently cached entries; it does not stagger requests for the same single Redis key. Test a burst at expiry, a Redis outage, and a reader paused across a cancellation. Confirm the chosen staleness policy and that booking decisions remain authoritative.
