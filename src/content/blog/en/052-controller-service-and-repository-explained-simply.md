---
title: "Controller, Service and Repository Explained Simply"
description: "A beginner's guide to understanding the three-tier architecture in Spring Boot to separate concerns and improve code maintainability."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a request for a new laptop, but if you put the validation, the database query, and the API response all in one single class, your code becomes a 'spaghetti' mess. It becomes impossible to test or change one part without breaking everything else. This is why we use the Controller-Service-Repository pattern.

## The Controller: The Receptionist
The Controller is the entry point of your application. Its only job is to handle incoming HTTP requests and return a response. It should not contain business logic. Think of it as a receptionist: they take your request, hand it to the right department, and give you the answer once it's ready.

## The Service: The Brain
The Service layer is where the business rules live. This is where you decide if a request is valid. For example, in our procurement app, the Service checks if the requester has enough budget before allowing the request to proceed. It coordinates the flow of data between the Controller and the Repository.

## The Repository: The Librarian
The Repository is the data access layer. It communicates directly with the database using Spring Data JPA. It doesn't care about business rules; it only cares about CRUD operations (Create, Read, Update, Delete). It acts like a librarian who knows exactly where a specific record is stored.

## Worked Example: Procurement Request
Here is how a request flows through these layers:

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 5000) { 
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

// Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
**Outcome:** The Controller receives the JSON, the Service applies the budget rule, and the Repository saves it to the database.

## Common Mistake: Logic in the Repository
A common error is putting business logic inside the Repository or Controller. For instance, checking if a user is an admin inside the Repository. 
**Correction:** Move all decision-making logic to the Service layer. The Repository should only execute queries.

## Practical Exercise
If you need to send an email notification after a procurement request is approved, which layer should trigger the email service?

**Answer:** The Service layer, because sending a notification is a business process requirement.

## Layers are not separate servers
These are logical responsibilities inside the backend. They can run together in one Spring Boot process; calling them three layers does not mean deploying three servers. The excerpt focuses on that separation. In a real API, use dedicated request and response DTOs, validate input and check authorization before saving a request.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
