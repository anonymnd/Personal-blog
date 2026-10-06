---
title: "What Is Separation of Concerns?"
description: "A fundamental architectural principle that organizes code by dividing a program into distinct sections, each addressing a separate concern."
pubDate: 2026-10-17T10:48:00.000Z
translationKey: 259-what-is-separation-of-concerns
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement application. At first, you write a single function that checks if a requester has enough budget, saves the request to the database, and sends an email to the manager. This works for a small demo, but as the app grows, changing the email provider requires you to touch the budget logic. This is the 'Big Ball of Mud' problem, where every part of the code is tangled with every other part.

## Understanding the Core Mechanism
Separation of Concerns (SoC) is the practice of partitioning a program so that each section addresses a specific 'concern'—a set of information or logic that affects a particular part of the functionality. The goal is to achieve high cohesion (things that belong together stay together) and low coupling (different sections depend on each other as little as possible).

## Applying SoC to Procurement
In a professional architecture, we split the procurement flow into distinct layers. The Web layer handles HTTP requests, the Service layer manages business rules (like approval workflows), and the Data layer handles persistence.

```java
// Service Layer: Focuses only on business logic
public class ProcurementService {
    private RequestRepository repository;
    private NotificationService notifier;

    public void submitRequest(PurchaseRequest request) {
        if (request.getAmount() > 1000) {
            repository.save(request);
            notifier.sendApprovalEmail(request.getManager());
        }
    }
}
```

## Monoliths vs. Microservices
Many beginners think SoC only happens in microservices. This is a misconception. A monolith can be perfectly separated into modules within a single deployment. Microservices take SoC further by providing operational independence, but they introduce complexity like network latency and data consistency issues. The boundary should be defined by domain capabilities, not just folder names.

## Common Mistake: The 'Interface Illusion'
Developers often believe that adding an interface automatically solves coupling. If your `ProcurementService` interface still requires a specific `SqlDatabase` object in its constructor, you are still tightly coupled to a specific technology. True separation means the service depends on an abstraction, not a concrete implementation.

## Practical Exercise
Scenario: You have a class `OrderManager` that calculates taxes, validates user permissions, and writes logs to a file. How should you apply SoC here?

**Check:** Split it into three classes: `TaxCalculator` (logic), `PermissionChecker` (security), and `Logger` (infrastructure). `OrderManager` should then coordinate these three services.
