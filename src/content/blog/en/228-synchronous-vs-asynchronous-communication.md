---
title: "Synchronous vs Asynchronous Communication"
description: "A guide to choosing between immediate request-response and decoupled message-based communication in system design."
pubDate: 2026-10-16T03:48:00.000Z
translationKey: 228-synchronous-vs-asynchronous-communication
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. A requester submits a purchase request, and the system must notify the manager. If you use a synchronous call, the requester's screen freezes until the manager's notification service confirms receipt. If that service is down, the whole request fails. This is the core tension between synchronous and asynchronous patterns.

## Synchronous Communication: The Direct Line
Synchronous communication follows a request-response cycle. The client sends a request and waits (blocks) for the server to process it and return a result. This is typically implemented via HTTP/REST or gRPC. It is ideal for operations where the user needs an immediate answer, such as checking if a product is in stock before adding it to a cart.

## Asynchronous Communication: The Message Queue
Asynchronous communication decouples the sender and receiver. The sender pushes a message to a broker (like Kafka or RabbitMQ) and immediately moves on. The receiver processes the message whenever it has capacity. This is perfect for long-running tasks, like generating a PDF report or sending an email notification after a manager approves a request.

## Worked Example: Procurement Workflow
In a procurement system, we combine both:
1. **Sync**: Requester $ightarrow$ API $ightarrow$ Database (Save Request). The user gets a `201 Created` immediately.
2. **Async**: API $ightarrow$ Message Broker $ightarrow$ Notification Service. The manager is notified in the background.

```java
// Illustrative excerpt: Async producer
public void approveRequest(Long requestId) {
    requestRepo.updateStatus(requestId, "APPROVED");
    // Non-blocking call to broker
    messageBroker.send("notification-topic", new ApprovalEvent(requestId));
}
```
Outcome: The manager's approval is saved instantly, and the notification happens eventually without slowing down the UI.

## Common Mistake: The Sync Chain
Developers often create "Sync Chains" where Service A calls B, B calls C, and C calls D. If Service D is slow, the entire chain hangs, leading to a cascading failure. 
**Correction**: Replace non-critical downstream calls with asynchronous events. If Service B doesn't need an immediate answer from C to respond to A, use a queue.

## Practical Exercise
Scenario: A user uploads a large CSV file of 10,000 items to be imported into the procurement system. Should this be Synchronous or Asynchronous?

**Answer**: Asynchronous. Processing 10,000 items takes time; a synchronous HTTP connection would likely timeout. The system should return a "Processing" status and notify the user via a webhook or email when finished.
