---
title: "Interfaces Explained Through Real Application Architecture"
description: "Learn how Java interfaces decouple business logic from implementation details using a procurement system example."
pubDate: 2026-10-11T19:48:00.000Z
translationKey: 124-interfaces-explained-through-real-application-architecture
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. Initially, you might write a class that sends notifications via Email. But what happens when the company decides to switch to Slack or SMS? If your business logic is hard-coded to an `EmailService` class, you have to rewrite your core logic every time the communication tool changes. This is where interfaces solve the 'tight coupling' problem.

## The Role of the Interface
An interface is a contract. It tells the application *what* a service can do without specifying *how* it does it. In our procurement app, we don't care how a notification is sent; we only care that a `sendNotification` method exists. By coding to an interface, the manager's approval logic remains identical whether the notification goes to an inbox or a mobile app.

## Designing the Procurement Contract
Here is how we define the contract for our notification system using a Java interface:

```java
public interface NotificationService {
    void sendNotification(String recipient, String message);
}
```

Now, we create two different implementations. One for Email and one for Slack:

```java
public class EmailNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Sending Email to " + recipient + ": " + message);
    }
}

public class SlackNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Posting to Slack channel " + recipient + ": " + message);
    }
}
```

## Implementation in Action
In the procurement workflow, the `ProcurementManager` class uses the interface rather than a specific class. This allows us to swap implementations at runtime.

```java
public class ProcurementManager {
    private final NotificationService notificationService;

    public ProcurementManager(NotificationService service) {
        this.notificationService = service;
    }

    public void approveRequest(String requester) {
        // Business logic for approval
        notificationService.sendNotification(requester, "Your request was approved!");
    }
}
```

## Common Mistake: Over-Interfacing
A frequent error is creating an interface for every single class, even when only one implementation will ever exist. This adds unnecessary boilerplate. Only use interfaces when you expect multiple implementations or need to decouple components for testing.

## Practical Exercise
**Task:** Create an interface called `PaymentProcessor` with a method `processPayment(double amount)`. Implement it for `CreditCardPayment` and `PayPalPayment`.

**Check:** Does your `ProcurementManager` accept `PaymentProcessor` in its constructor? If yes, you have successfully decoupled the payment logic.


## Further reading

- [Java records](https://dev.java/learn/records/)
