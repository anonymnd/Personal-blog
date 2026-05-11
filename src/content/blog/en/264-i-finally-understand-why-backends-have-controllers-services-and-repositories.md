---
title: "I Finally Understand Why Backends Have Controllers, Services and Repositories"
description: "A conceptual deep dive into the layered architecture pattern used to separate concerns in modern backend applications."
pubDate: 2026-10-17T15:48:00.000Z
translationKey: 264-i-finally-understand-why-backends-have-controllers-services-and-repositories
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

When I first started with Spring Boot, I used to put all my logic inside the Controller. It felt faster to just write a database query right where the HTTP request arrives. But as the project grew, my controllers became massive 'God Classes' that were impossible to test or modify without breaking five other things. I finally realized that the Controller-Service-Repository pattern isn't about adding more files; it's about giving every piece of code a single, clear responsibility.

## The Controller: The Gatekeeper
The Controller's only job is to handle the HTTP protocol. It listens for requests, validates that the input format is correct, and returns the appropriate HTTP status code. It should never know how to calculate a discount or how to save a record to a database. It simply delegates the actual work to the Service layer.

## The Service: The Brain
This is where the business logic lives. The Service layer is agnostic of the transport layer; it doesn't care if the request came from a REST API, a GraphQL endpoint, or a scheduled task. It coordinates the flow of data, applies business rules, and manages the logic of the application.

## The Repository: The Librarian
The Repository is the only layer that talks to the database. Its sole purpose is to perform CRUD operations. By isolating data access, you can change your database technology or optimize a query in one place without touching your business logic.

## A Worked Example: Procurement Request
Imagine a procurement app where a requester submits a purchase request. (Note: The following is an illustrative snippet; the Request entity is assumed to be a standard JPA entity).

```java
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 1000) {
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

@Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
In this flow, the Controller handles the JSON, the Service decides the approval status based on the amount, and the Repository persists it to the database.

## Common Mistake: Leaking Logic
A common error is putting business logic in the Repository (like custom SQL that calculates totals) or in the Controller. 
**Correction:** Move any 'if/else' logic regarding business rules into the Service layer. Keep the Repository focused on fetching and saving.

## Practical Exercise
If you need to send an email notification after a procurement request is approved, which layer should trigger the email service?

**Answer:** The Service layer, because sending a notification is a business process requirement, not a database operation or an HTTP concern.
