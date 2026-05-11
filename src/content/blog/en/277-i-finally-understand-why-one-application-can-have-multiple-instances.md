---
title: "I Finally Understand Why One Application Can Have Multiple Instances"
description: "A conceptual deep dive into horizontal scaling and the difference between a single codebase and multiple running processes."
pubDate: 2026-10-18T04:48:00.000Z
translationKey: 277-i-finally-understand-why-one-application-can-have-multiple-instances
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

For a long time, I struggled to visualize how a single application could exist in 'multiple instances.' I used to think that if I started my app, it was just *the* app. But the realization hits when you imagine a sudden spike in users: one server simply cannot handle 10,000 simultaneous requests without crashing due to CPU or RAM exhaustion.

## The Concept of Horizontal Scaling
Running multiple instances means taking the exact same compiled code (the artifact) and launching it as separate processes, either on one powerful machine or across several different servers. This is called horizontal scaling. Instead of making one server bigger (vertical scaling), you add more identical clones. A Load Balancer sits in front of these instances, distributing incoming traffic so no single instance gets overwhelmed.

## A Hypothetical Procurement Scenario
Imagine a procurement app where employees submit purchase requests. If only one instance is running, and 500 employees submit requests at 9:00 AM, the server might lag. 

By running three instances (Instance A, B, and C):
1. Request 1 goes to Instance A.
2. Request 2 goes to Instance B.
3. Request 3 goes to Instance C.

Each instance handles a fraction of the load. If Instance B crashes, the Load Balancer simply redirects traffic to A and C, ensuring the procurement process doesn't stop.

## The Stateless Requirement
For this to work, the application must be stateless. If Instance A saves a user's session in its local memory, and the next request goes to Instance B, Instance B won't know who the user is. This is why we use external stores like Redis for sessions or a shared database for data.

```java
// Illustrative excerpt: Avoiding local state
public class RequestService {
    // BAD: private Map<Long, Request> localCache = new HashMap<>();
    // GOOD: Use a shared database or distributed cache
    @Autowired
    private RequestRepository repository;

    public void processRequest(Long id) {
        var request = repository.findById(id).orElseThrow();
        // process logic
    }
}
```

## Common Mistake: Local File Storage
A frequent error is saving uploaded invoices to a local folder like `/uploads/`. In a multi-instance setup, a file uploaded to Instance A is invisible to Instance B. The correction is to use shared object storage (like S3 or a network drive).

## Practical Exercise
If you have 4 instances of an app and a Load Balancer using 'Round Robin' logic, which instance will handle the 5th request?

**Answer:** Instance 1 (The cycle restarts after the 4th instance).
