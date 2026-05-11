---
title: "What Is Kafka?"
description: "An introduction to Apache Kafka as a distributed event streaming platform for decoupling microservices."
pubDate: 2026-10-16T01:48:00.000Z
translationKey: 226-what-is-kafka
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imagine you are building a procurement system. When a requester submits a purchase request, several things must happen: the manager needs a notification, the budget service must check funds, and the audit log must record the entry. If you use direct API calls, your system becomes a 'spaghetti' of dependencies. If the budget service is down, the whole request fails. This is where Apache Kafka solves the problem by acting as a distributed commit log.

## The Core Mechanism
Kafka works on a publish-subscribe model. Instead of sending a message directly to a receiver, a 'Producer' sends data (an event) to a 'Topic'. A topic is like a category or a folder. This data is stored in 'Partitions', which allow Kafka to scale across multiple servers. 'Consumers' then subscribe to these topics to read the data at their own pace. Because Kafka persists data to disk, a consumer can crash and resume exactly where it left off.

## Procurement App Example
In our procurement app, the 'Request-Submitted' topic handles the flow:
1. **Producer**: The Request Service sends a JSON event: `{"id": 101, "item": "Laptop", "amount": 1200}`.
2. **Topic**: Kafka stores this event in the `purchase_requests` topic.
3. **Consumers**: 
   - The **Notification Service** reads the event and emails the manager.
   - The **Budget Service** reads the same event to reserve funds.

Outcome: The Request Service doesn't need to know who is listening; it just fires the event and moves on.

## Ordering and Idempotency
One critical detail is that Kafka only guarantees the order of messages *within a single partition*. If you have multiple partitions, messages might be processed out of order. Furthermore, because network failures can cause a producer to send the same message twice, your consumers must be 'idempotent'. This means processing the same request ID twice should not result in two separate budget deductions.

## Common Mistake: Using Kafka as a Database
Developers often mistake Kafka for a primary database because it stores data. However, Kafka is optimized for sequential streaming, not random access queries. 

**Correction**: Use Kafka to move data between services, but store the final state (like the current order status) in a database like PostgreSQL or MongoDB.

## Practical Exercise
If you have a topic with 3 partitions and 4 consumers in the same consumer group, what happens to the 4th consumer?

**Answer**: The 4th consumer will remain idle because each partition in a group can be assigned to only one consumer.
