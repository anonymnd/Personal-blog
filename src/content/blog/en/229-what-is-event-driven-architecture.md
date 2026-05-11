---
title: "What Is Event-Driven Architecture?"
description: "A beginner's guide to understanding how systems communicate through asynchronous events rather than direct requests."
pubDate: 2026-10-16T04:48:00.000Z
translationKey: 229-what-is-event-driven-architecture
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. In a traditional system, when a requester submits a purchase request, the system waits for the manager to approve it and the buyer to order it in one long, connected chain. If the buyer's service is down, the whole process crashes. This 'tight coupling' is a common bottleneck in scaling software.

## The Core Mechanism
Event-Driven Architecture (EDA) solves this by using an 'Event Broker' (like Kafka or RabbitMQ). Instead of Service A calling Service B directly, Service A simply publishes an event—a notification that 'something happened'—to the broker. Other services 'subscribe' to these events and react whenever they arrive. This is asynchronous communication: the sender doesn't wait for a response to move on.

## Procurement App Workflow
In an EDA procurement system, the flow looks like this:
1. **Requester Service**: Publishes an event `RequestCreated`.
2. **Manager Service**: Listens for `RequestCreated`, processes the approval, and publishes `RequestApproved`.
3. **Buyer Service**: Listens for `RequestApproved` and triggers the external order.

Because these services are decoupled, the Buyer Service could be offline for maintenance, and the `RequestApproved` event would simply sit in the broker until the service wakes up and processes it.

## Worked Example: Event Payload
An event is typically a small JSON object. For our procurement app, the `RequestApproved` event might look like this:

```json
{
  "eventId": "evt_123",
  "type": "RequestApproved",
  "payload": {
    "requestId": "req_99",
    "approverId": "mgr_01",
    "timestamp": "2023-10-27T10:00:00Z"
  }
}
```
Outcome: The Buyer Service receives this, sees `req_99`, and knows exactly which item to purchase without ever having talked to the Manager Service.

## Common Mistake: Assuming Exactly-Once Delivery
Beginners often assume an event is delivered exactly once. In reality, network glitches can cause a broker to send the same event twice. If the Buyer Service isn't **idempotent** (meaning processing the same event twice doesn't cause two orders), you'll end up buying the same laptop twice.

**Correction**: Implement a check in the consumer. Store the `eventId` in a database; if the ID has already been processed, ignore the duplicate event.

## Practical Exercise
If a 'Notification Service' needs to send an email whenever a request is created, approved, or rejected, how should it be integrated into the EDA procurement app?

**Answer**: The Notification Service should subscribe to all three event types (`RequestCreated`, `RequestApproved`, `RequestRejected`) and trigger an email based on the event type received.
