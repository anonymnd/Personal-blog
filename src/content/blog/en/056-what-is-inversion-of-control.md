---
title: "What Is Inversion of Control?"
description: "A fundamental architectural shift where the framework manages object lifecycles instead of the developer."
pubDate: 2026-10-08T23:48:00.000Z
translationKey: 056-what-is-inversion-of-control
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement application. You have a `ProcurementService` that needs a `BuyerRepository` to save orders. In a traditional approach, the service creates the repository using `new BuyerRepository()`. This creates a 'hard dependency'; the service is now responsible for knowing exactly how to instantiate the repository and its dependencies. If the repository changes, you must change the service code.

## The Core Mechanism
Inversion of Control (IoC) flips this relationship. Instead of the service controlling the creation of its dependencies, it simply declares what it needs. An external entity—the IoC Container—takes over the responsibility of instantiating the objects and 'injecting' them into the service. The control of the object lifecycle is inverted from the application code to the framework.

## IoC in Action: A Procurement Example
In Spring Boot, we use annotations to tell the container which classes are managed components. Here is an illustrative excerpt:

```java
@Repository
public class BuyerRepository {
    public void saveOrder(String orderId) {
        System.out.println("Order " + orderId + " saved to DB");
    }
}

@Service
public class ProcurementService {
    private final BuyerRepository buyerRepo;

    // The container injects the dependency here
    @Autowired
    public ProcurementService(BuyerRepository buyerRepo) {
        this.buyerRepo = buyerRepo;
    }

    public void processOrder(String id) {
        buyerRepo.saveOrder(id);
    }
}
```
In this scenario, `ProcurementService` doesn't care where `BuyerRepository` comes from or how it is created. It just knows it will be provided at runtime.

## Common Mistake: Manual Instantiation
A frequent error for beginners is using `@Autowired` but then manually calling `new ProcurementService()` in another class. When you use the `new` keyword, you bypass the IoC container. Consequently, the `buyerRepo` field will be `null`, leading to a `NullPointerException` because the framework never had the chance to inject the dependency.

## Comparison: Traditional vs IoC
| Feature | Traditional Control | Inversion of Control |
| :--- | :--- | :--- |
| Object Creation | Manual (`new` keyword) | Managed by Container |
| Coupling | Tight (Hard-coded) | Loose (Interface-based) |
| Testing | Hard to mock dependencies | Easy to inject mocks |

## Practical Exercise
If you have a `ManagerService` that needs an `ApprovalService`, and you want to use IoC, should you write `this.approvalService = new ApprovalService();` inside the constructor?

**Answer:** No. You should declare the `ApprovalService` as a final field and let the IoC container inject it via the constructor using `@Autowired`.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
