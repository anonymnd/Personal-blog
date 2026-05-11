---
title: "Why Run Multiple Instances of the Same Application?"
description: "An exploration of horizontal scaling to improve availability and performance through load distribution."
pubDate: 2026-10-15T12:48:00.000Z
translationKey: 213-why-run-multiple-instances-of-the-same-application
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imagine you built a procurement app where employees submit purchase requests. At first, one server handles everything perfectly. But as the company grows, hundreds of people submit requests simultaneously. Suddenly, the server slows down, requests time out, and if that single server crashes, the entire procurement process stops. This is the 'Single Point of Failure' problem.

## Scaling Out vs. Scaling Up
When a server struggles, you can add more CPU or RAM (Vertical Scaling), but there is a physical limit to how big one machine can get. Running multiple instances of the same application (Horizontal Scaling) allows you to distribute the load across several smaller machines. This ensures that if one instance fails, others continue to process requests.

## The Role of the Load Balancer
To make multiple instances work, you need a Load Balancer. This acts as a traffic cop, receiving incoming HTTP requests and routing them to available instances. It can use different algorithms: Round Robin simply rotates through servers, while Least Connections sends traffic to the instance with the lowest current load.

## Managing Shared State
One critical challenge is that instances must be stateless. If a requester uploads a document to Instance A, and the manager tries to approve it via Instance B, Instance B won't find the file if it's stored locally. You must move state to an external shared store, such as a database or a distributed cache like Redis.

## Worked Example: Procurement Approval
Consider a request flow:
1. **Requester** sends a POST `/request` → Load Balancer → **Instance 1**. Instance 1 saves the request to a shared PostgreSQL DB.
2. **Manager** sends a GET `/pending` → Load Balancer → **Instance 2**. Instance 2 fetches the data from the same PostgreSQL DB.

**Outcome:** The system remains available even if Instance 1 crashes during the manager's review.

## Common Mistake: Local Sessions
Developers often store user sessions in local memory (`HttpSession` in Jakarta EE). In a multi-instance setup, a user might be logged into Instance 1 but get routed to Instance 2, causing them to be suddenly logged out. 
**Correction:** Use a distributed session store or JWTs (JSON Web Tokens) so any instance can verify the user.

## Practical Exercise
If you have 3 instances and use a Round Robin load balancer, which instance receives the 4th request?

**Answer:** Instance 1 (The cycle restarts: 1, 2, 3, then 1).
