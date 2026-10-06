---
title: "Why Microservices Are Not Automatically Better"
description: "A critical look at the trade-offs between monolithic and microservices architectures to avoid premature over-engineering."
pubDate: 2026-10-17T05:48:00.000Z
translationKey: 254-why-microservices-are-not-automatically-better
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a request, a manager approves it, and a buyer places the order. You might feel tempted to create three separate services immediately because 'that is how modern apps are built.' However, splitting these into microservices before you even have a single user often introduces more problems than it solves.

## The Monolith Misconception
A common mistake is thinking a monolith is just a 'big ball of mud.' In reality, a monolith can be perfectly modular. You can have separate packages for `requester`, `manager`, and `buyer` within one deployment. This gives you the organization of microservices without the operational nightmare of managing three different servers, three deployment pipelines, and network latency.

## The Cost of Distribution
Microservices introduce distributed failure. In a monolith, a method call to the approval module is nearly instantaneous and guaranteed. In microservices, that call becomes an HTTP request. If the Approval Service is down or the network lags, the Request Service fails too. You now have to handle timeouts, retries, and circuit breakers—complexity that doesn't exist in a modular monolith.

## Data Consistency Challenges
In a monolith, updating a request status and notifying the buyer happens in one database transaction. In microservices, each service has its own database. If the Approval Service updates the status but the Buyer Service fails to receive the event, your data is inconsistent. Solving this requires complex patterns like Sagas or Outbox, which are overkill for most early-stage projects.

## Example: Modular vs. Distributed
Consider this simplified logic for a procurement flow:

```java
// Modular Monolith: Simple method call
public void approveRequest(Long id) {
    Request req = requestRepo.findById(id);
    approvalService.markAsApproved(req);
    buyerService.notifyBuyer(req);
}
```

In a microservice version, `buyerService.notifyBuyer(req)` becomes a REST call. If the network fails, the request is approved but the buyer never knows. You would need a message queue (like RabbitMQ) to ensure reliability, adding significant infrastructure overhead.

## Common Mistake: Interface Illusion
Developers often think that because they defined a clean interface, the coupling is gone. Coupling is about logic, not just folders. If changing the `Request` object requires updating five different microservices, you have a 'distributed monolith'—the worst of both worlds.

## Practical Exercise
**Scenario:** You have a small team of two developers and a simple app with three modules. Should you move to microservices to 'prepare for future scale'?

**Answer:** No. Start with a modular monolith. Only split services when you have a specific measurement (e.g., one module needs 10x more CPU than others) or a team size that makes a single codebase a bottleneck.
