---
title: "Database vs Cache vs Message Broker"
description: "A guide to understanding when to store data, when to speed up access, and when to decouple communication in system design."
pubDate: 2026-10-16T05:48:00.000Z
translationKey: 230-database-vs-cache-vs-message-broker
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

A procurement app must record a request, display its status and notify a manager. A database, a cache and a message broker serve different purposes. Start with the simplest architecture that meets measured needs, then add components when their benefits justify their operational cost.
## The Source of Truth: Database
A database is the durable source of truth for purchase requests. PostgreSQL can enforce constraints and commit transactions so an approval remains recorded after a restart. Its performance depends on queries, indexes, workload and configuration; disk storage does not automatically make every database operation slow.
## The Speed Layer: Cache
A cache stores reusable results to reduce repeated work. In cache-aside, the application checks the cache, loads a missing value from the database and caches it. Cached approval status can become stale: invalidate or update it when the authoritative state changes, and choose a suitable TTL. Redis can persist data with RDB snapshots or AOF, so a restart does not always erase it. Here we deliberately treat cached values as disposable and rebuildable.
## The Communication Hub: Message Broker
A broker decouples producers from consumers. After an approval, a notification worker can process a queued event without keeping the requester waiting for email delivery. Durability depends on broker configuration, acknowledgements and retention. Consumers should handle redelivery without sending duplicate emails; an outbox can coordinate a database update with eventual event publication.
## Comparison Summary

| Feature | Database | Cache | Message Broker |
| :--- | :--- | :--- | :--- |
| Primary Goal | Persistence | Latency | Decoupling |
| Storage Medium | Disk | RAM | Queue/Log |
| Data Life | Durable records | Rebuildable values | Configured retention |

## Common Mistake: Using Redis as a DB
Do not assume that Redis is a durable source of truth just because it is fast. Redis supports persistence, but the chosen settings, eviction rules and recovery plan must match your requirements. For this example, keep purchase history in PostgreSQL and cache only values that can be reconstructed.
## Practical Exercise
Which component should you use to handle a burst of 10,000 "Order Confirmation" emails without crashing the email server?

**Answer:** A Message Broker. It buffers the requests in a queue, allowing the email server to process them at its own pace.
