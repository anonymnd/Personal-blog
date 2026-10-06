---
title: "The Observer Design Pattern Explained Simply"
description: "Learn how to create a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically."
pubDate: 2026-10-12T02:48:00.000Z
translationKey: 131-the-observer-design-pattern-explained-simply
locale: en
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement system. When a manager approves a purchase request, several things must happen: the buyer needs to be notified to place the order, the requester needs an email, and the budget tracker must update. If you hardcode all these calls inside the `ApprovalService`, your code becomes a tangled mess that is hard to modify whenever a new notification type is added.

## The Core Mechanism
The Observer pattern solves this by decoupling the 'Subject' (the object being watched) from its 'Observers' (the objects waiting for updates). The Subject maintains a list of observers and provides methods to attach or detach them. When a specific event occurs, the Subject iterates through this list and calls a predefined method on each observer.

## Implementation Example
In a procurement app, the `PurchaseRequest` acts as the Subject. We define an `Observer` interface to ensure all listeners have a consistent `update` method.

```java
interface RequestObserver {
    void update(String status);
}

class PurchaseRequest {
    private List<RequestObserver> observers = new ArrayList<>();
    private String status;

    public void attach(RequestObserver observer) { observers.add(observer); }
    
    public void setStatus(String status) {
        this.status = status;
        notifyObservers();
    }

    private void notifyObservers() {
        for (RequestObserver obs : observers) {
            obs.update(status);
        }
    }
}

class BuyerNotification implements RequestObserver {
    public void update(String status) {
        if ("APPROVED".equals(status)) {
            System.out.println("Buyer: Ordering items now!");
        }
    }
}
```
When `request.setStatus("APPROVED")` is called, the `BuyerNotification` automatically triggers its logic without the `PurchaseRequest` needing to know the specific details of the buyer's workflow.

## Common Mistake: Memory Leaks
A frequent error is forgetting to detach observers. If an observer object is no longer needed but remains attached to a long-lived Subject, the Garbage Collector cannot reclaim it, leading to a memory leak. Always provide a `detach` method and call it when the observer's lifecycle ends.

## Practical Exercise
Create a `BudgetTracker` class that implements `RequestObserver`. It should print "Budget Updated" only when the status is "APPROVED".

**Check:** Your class should implement the interface and use an `if` statement inside the `update` method to filter for the "APPROVED" string.


## Further reading

- [Java records](https://dev.java/learn/records/)
