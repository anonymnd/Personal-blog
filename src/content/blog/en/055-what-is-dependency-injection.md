---
title: "What Is Dependency Injection?"
description: "A beginner's guide to understanding how Dependency Injection decouples components in Spring Boot applications."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 055-what-is-dependency-injection
locale: en
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a `PurchaseOrderService` that needs a `NotificationService` to send emails. If you write `NotificationService service = new EmailNotificationService();` inside your class, you have hard-coded the dependency. If you later want to switch to SMS notifications, you must change the code in every service that uses it. This is called tight coupling, and it makes testing and maintenance a nightmare.

## The Core Mechanism
Dependency Injection (DI) is a design pattern where an object does not create its own dependencies. Instead, an external entity (the Spring IoC Container) "injects" the required objects at runtime. This shifts the responsibility of object creation from the class to the framework, allowing you to swap implementations without changing the consuming class.

## Constructor Injection in Action
In modern Spring Boot, constructor injection is the gold standard. It ensures that the class is initialized with all its required dependencies and allows for final fields, making the component immutable.

```java
@Service
public class PurchaseOrderService {
    private final NotificationService notificationService;

    // Spring injects the implementation here
    public PurchaseOrderService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void completeOrder(Order order) {
        // Logic to complete order
        notificationService.send("Order " + order.getId() + " is ready!");
    }
}
```

## Outcome and Benefits
By using the `NotificationService` interface instead of a concrete `EmailNotificationService` class, the `PurchaseOrderService` doesn't care how the message is sent. The outcome is a modular system where you can inject a `MockNotificationService` during unit tests to avoid sending real emails, speeding up your development cycle.

## Common Mistake: Field Injection
Many beginners use `@Autowired` directly on private fields. While it looks cleaner, it makes the class impossible to instantiate manually in a test without using reflection or starting a full Spring context.

**Correction:** Always prefer constructor injection. It makes dependencies explicit and ensures the object is never in an uninitialized state.

## Practical Exercise
Create a `BuyerService` that depends on a `VendorRepository`. How should you define the field and the constructor to follow DI best practices?

**Answer:** Define the `VendorRepository` as a `private final` field and create a public constructor that assigns this field from a parameter.

## Further reading

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
