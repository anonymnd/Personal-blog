---
title: "Choose Module Boundaries Before Choosing Microservices"
description: "A deep dive into cohesion, coupling, and the transition from modular monoliths to microservices using a travel booking scenario."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 253-monolith-vs-microservices
seriesOrder: 57
locale: en
tags: ["architecture-boundaries","learning-series"]
draft: false
---

## The Fallacy of the 'Microservice First' Approach

Many teams mistake microservices for an organizational pattern rather than a deployment strategy. The primary challenge of software engineering is not deciding whether to use a network call or a method call, but defining where one capability ends and another begins. When boundaries are drawn incorrectly, you end up with a distributed monolith: a system with the complexity of microservices but the tight coupling of a monolith, where a change in the 'Payment' service requires a simultaneous deployment of the 'Itinerary' service.

## Cohesion and Coupling as Boundary Metrics

To determine a boundary, we evaluate two metrics:

1. **Cohesion**: How closely related are the responsibilities within a module? High cohesion means everything in the module supports a single, well-defined capability. If the 'Payment' module starts handling 'Customer Loyalty Points', cohesion drops because loyalty logic is a separate domain capability.
2. **Coupling**: How much does one module depend on the internal details of another? Low coupling means modules interact through stable contracts. If the 'Itinerary' module directly queries the 'Payment' database tables, they are tightly coupled, regardless of whether they live in the same JVM or different servers.

## Scenario: Travel Booking System

Consider a system with three primary capabilities: **Itinerary**, **Payment**, and **Customer Support**. 

### The Modular Monolith Phase
Initially, we organize these as distinct packages in a single Spring Boot application. The key is to avoid layer-based packaging (e.g., `com.app.service`, `com.app.repository`) in favor of feature-based packaging:

- `com.travel.itinerary`
- `com.travel.payment`
- `com.travel.support`

In this phase, we enforce boundaries using Java visibility modifiers and architectural tests (like ArchUnit). The `Payment` module should not access the `Itinerary` repository directly; it must go through a defined service interface.

### Evaluating the Need for Distributed Deployment
Now we ask: Does the `Payment` module actually need to be a separate microservice?

**Reasons to keep it in the monolith:**
- **Transactional Integrity**: If booking an itinerary and processing payment must happen in one atomic database transaction to avoid orphaned bookings, keeping them in one deployment simplifies consistency.
- **Operational Overhead**: A separate service requires its own CI/CD pipeline, monitoring, and security patching.

**Reasons to move to a microservice:**
- **Scaling Requirements**: Payment processing might require high-compute encryption or handle massive bursts during sales that would crash the Itinerary module.
- **Security Isolation**: The Payment module handles PCI-DSS sensitive data. Isolating it into a separate deployment allows for stricter network firewalls and limited access to the underlying OS.
- **Independent Evolution**: The Payment team needs to deploy updates five times a day without risking the stability of the Itinerary system.

## Worked Artifact: Boundary Enforcement Plan

Below is a plan to transition from a shared-database monolith to a modular structure that allows for future extraction.

### 1. Data Ownership Schema
Instead of a giant shared schema, we logically partition the data. Even in one database, we use separate schemas or naming prefixes.

| Module | Owned Tables | Access Rule |
| :--- | :--- | :--- |
| Itinerary | `itinerary`, `flight_segment` | Only `com.travel.itinerary` can write/read |
| Payment | `transaction`, `payment_method` | Only `com.travel.payment` can write/read |
| Support | `ticket`, `case_log` | Only `com.travel.support` can write/read |

### 2. Contract-Based Interaction (Illustrative)
To prevent tight coupling, we use records for Data Transfer Objects (DTOs) and avoid sharing JPA entities across boundaries.

```java
// Located in com.travel.payment.api
public record PaymentRequest(String bookingId, BigDecimal amount, String currency) {}
public record PaymentResponse(String transactionId, PaymentStatus status) {}

// com.travel.payment.api
public interface PaymentService {
    // The only entry point for other modules
    PaymentResponse processPayment(PaymentRequest request);
}
```

### 3. Failure Trace: The Distributed Trap
If we move `Payment` to a microservice without fixing the boundaries, we encounter this failure trace:
1. `ItineraryService` calls `PaymentClient.process()`.
2. `PaymentService` encounters a timeout due to network latency.
3. `ItineraryService` throws a 500 error, but the payment actually succeeded in the background.
4. Result: The customer is charged, but the itinerary is not confirmed. 

**Solution**: Implement an asynchronous pattern (Outbox pattern) or a Saga to handle eventual consistency, which is the cost of choosing distributed deployment over a modular monolith.

## Exercise

**Scenario**: You have a `CustomerSupport` module that needs to show the last three payments for a user. Currently, it calls `PaymentRepository.findByUserId()`. 

**Question**: Why is this a boundary violation, and how should it be fixed to allow the `Payment` module to be moved to a separate server later?

**Answer**: It is a violation because `CustomerSupport` depends on the internal data structure (the Repository) of the `Payment` module. If the `Payment` database schema changes, `CustomerSupport` breaks. To fix it, the `Payment` module must expose a public method (e.g., `PaymentService.getRecentPayments(userId)`) that returns a DTO. The `CustomerSupport` module calls this method, remaining ignorant of how the data is stored.

A module boundary is an intentional access rule, not enforcement created by a table prefix. Place the public PaymentService contract in payment.api and keep implementation details internal; use visibility, architecture checks and database permissions where appropriate. Microservices also affect team ownership and operations, not only deployment. Even a monolith cannot atomically include an external payment provider in its ordinary SQL transaction. A timeout means an uncertain payment outcome: use stable payment idempotency keys, reconciliation and explicit pending/confirmed states. Outbox or saga coordination does not by itself undo an external charge. Separate deployment can improve isolation but is not proof of compliance with a security standard.
