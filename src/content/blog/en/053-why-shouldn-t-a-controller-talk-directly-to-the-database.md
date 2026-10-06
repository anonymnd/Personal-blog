---
title: "Why Shouldn’t a Controller Talk Directly to the Database?"
description: "Learn why separating your web layer from your data layer prevents architectural decay and simplifies maintenance in Spring Boot."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 053-why-shouldn-t-a-controller-talk-directly-to-the-database
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. In a rush, you decide to inject your `PurchaseRequestRepository` directly into the `PurchaseController`. It works perfectly for the first two days. But then, the manager asks that every request over $1,000 must be flagged for 'Senior Review' before being saved. Suddenly, you are writing complex if-else logic inside your HTTP handler, mixing web routing with business rules.

## The Problem of Leaky Abstractions
When a controller talks directly to the database, it suffers from 'leaky abstractions.' The controller should only care about HTTP requests, status codes, and JSON mapping. When it handles database logic, it becomes tightly coupled to the data schema. If you change a table column or switch from a relational database to a NoSQL one, you have to rewrite your web layer, which should theoretically remain untouched by data storage changes.

## The Role of the Service Layer
Introducing a Service layer creates a buffer. The Controller handles the *what* (the request), and the Service handles the *how* (the business logic). The Service layer is where you enforce rules that the Repository cannot. For example, checking if a requester has enough budget before calling `.save()` is a business rule, not a database operation.

## Worked Example: Procurement Approval
Consider this flow: a manager approves a request. 

```java
// BAD: Controller doing everything
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    var req = repository.findById(id).orElseThrow();
    req.setStatus("APPROVED"); // Business logic in controller!
    repository.save(req);
    return ResponseEntity.ok().build();
}

// GOOD: Controller delegates to Service
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    service.approveRequest(id);
    return ResponseEntity.ok().build();
}
```
In the 'Good' version, the `PurchaseService` handles the status change and any side effects (like sending an email to the buyer), keeping the controller lean.

## Common Mistake: Over-reliance on Repositories
A common error is thinking that `JpaRepository` methods are enough to handle business logic. While `.save()` handles persistence, it doesn't know that a request cannot be approved if it's already cancelled. You must wrap the repository call in a service method to validate these states.

## Practical Exercise
**Scenario:** You need to ensure a `PurchaseRequest` has a description longer than 10 characters before saving.
**Question:** Where should this validation logic live to follow the architectural pattern discussed?
**Answer:** In the Service layer, before calling the repository's save method.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
