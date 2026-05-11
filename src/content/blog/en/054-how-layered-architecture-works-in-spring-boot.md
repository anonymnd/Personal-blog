---
title: "How Layered Architecture Works in Spring Boot"
description: "A beginner's guide to organizing Spring Boot applications into Controller, Service, and Repository layers for better maintainability."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 054-how-layered-architecture-works-in-spring-boot
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. If you put the validation, the database logic, and the API response all in one single class, your code becomes a 'Big Ball of Mud'. Changing one small rule about who can approve a request might accidentally break how the data is saved to the database. This is why we use Layered Architecture.

## The Controller Layer (The Entry Point)
The Controller is the face of your application. Its only job is to handle incoming HTTP requests, validate the basic input format, and return a response. It should never contain business logic. For example, it doesn't decide if a request is 'too expensive'; it simply receives the request and passes it to the service layer.

## The Service Layer (The Brain)
This is where the business rules live. In our procurement app, the Service layer checks if the requester has enough budget or if the manager has the authority to approve the order. It coordinates the flow of data between the controller and the repository. By keeping logic here, you can reuse the same business rules for both a REST API and a scheduled task.

## The Repository Layer (The Data Access)
This layer communicates with the database using Spring Data JPA. It focuses on CRUD operations. It doesn't care why a request is being saved; it only cares how to save it efficiently. 

## Worked Example: Submitting a Request
Here is how a request flows through the layers:

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<RequestDTO> create(@RequestBody RequestDTO dto) {
        return ResponseEntity.ok(service.processRequest(dto));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private RequestRepository repository;

    public RequestDTO processRequest(RequestDTO dto) {
        // Business Rule: Only requests under 1000 are auto-approved
        // Business Rule: Only requests under 1000 are auto-approved
        String status = dto.amount() < 1000 ? "AUTO_APPROVED" : "PENDING";
        var entity = new RequestEntity(dto, status);
        entity = repository.save(entity);
        return new RequestDTO(entity);
    }
}

// Repository
public interface RequestRepository extends JpaRepository<RequestEntity, Long> {}
```

## Common Mistake: Logic in the Repository
Beginners often put business checks (like `if (amount > 1000)`) inside the Repository or the Controller. 
**Correction:** Move all decision-making logic to the `@Service` class. The Repository should only contain queries.

## Practical Exercise
If you need to add a rule that 'Managers cannot approve their own requests', which layer should this code go into?

**Answer:** The Service Layer, because it is a business rule.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
