---
title: "Monolith vs Microservices"
description: "A comparative guide to choosing between a single unified deployment and a distributed system of independent services."
pubDate: 2026-10-17T04:48:00.000Z
translationKey: 253-monolith-vs-microservices
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. At first, you have one project where the requester, manager, and buyer logic all live together. As the team grows, you find that a small change in the 'Approval' logic requires redeploying the entire application, causing downtime for the 'Ordering' module. This is the classic tension between Monoliths and Microservices.

## Understanding the Monolith
A monolithic architecture is a single deployment unit. It doesn't mean the code is messy; a well-structured monolith uses separate modules for different domains. The primary characteristic is that all components share the same memory space and database connection. This makes development simple and deployment fast, but it creates a 'blast radius' where a memory leak in one module can crash the whole system.

## The Microservices Shift
Microservices break the application into independent services based on domain capabilities. In our procurement app, the Request Service, Approval Service, and Order Service would be separate processes. They communicate via APIs (like REST or gRPC). This allows the Order Service to be scaled independently if the buyer's workload increases, without wasting resources on the Request module.

## The Trade-off Table
| Feature | Monolith | Microservices |
| :--- | :--- | :--- |
| Deployment | Single unit | Multiple independent units |
| Consistency | Strong (ACID) | Eventual (Distributed) |
| Complexity | Low operational overhead | High operational overhead |
| Failure | Single point of failure | Distributed failure risks |

## Worked Example: Procurement Workflow
In a monolith, the `RequestService` calls `ApprovalService.approve(id)` directly in Java. In microservices, it looks like this:

```java
// Illustrative excerpt of a Microservice call
public void submitRequest(Request req) {
    requestRepo.save(req);
    restTemplate.postForEntity("http://approval-service/approve", req, Void.class);
}
```
Outcome: If the Approval Service is down, the Request Service can still accept requests and queue them, preventing a total system blackout.

## Common Mistake: The Distributed Monolith
A frequent error is splitting services by technical layers (e.g., a 'Database Service' and a 'UI Service') rather than business domains. This creates tight coupling where every change requires updating five different services. Correction: Define boundaries based on business capabilities (e.g., 'Procurement' vs 'Inventory').

## Practical Exercise
Scenario: Your app has a 'Reporting' module that consumes 90% of the CPU every Monday, slowing down the 'Order' process for everyone. Which architecture solves this most efficiently?

**Answer:** Microservices. By isolating 'Reporting' into its own service, you can scale its hardware independently without affecting the 'Order' service.
