---
title: "I Finally Understand What a Load Balancer Does"
description: "A conceptual deep dive into how load balancers distribute traffic to prevent server crashes and ensure high availability."
pubDate: 2026-10-18T05:48:00.000Z
translationKey: 278-i-finally-understand-what-a-load-balancer-does
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where employees submit purchase requests. At first, everything works great with one server. But suddenly, the company grows, and a thousand people submit requests at the same time. Your single server starts lagging, the CPU hits 100%, and eventually, the app crashes. You might think the solution is just a bigger server, but that creates a single point of failure. If that one giant server goes down, the whole company stops.

## The Traffic Cop Analogy
I realized that a load balancer isn't just a piece of hardware; it's like a traffic cop standing in front of a group of servers. Instead of every user hitting the same server, they hit the load balancer first. The load balancer then decides which healthy server is best equipped to handle that specific request. This allows you to scale horizontally by adding more small servers rather than one expensive, risky one.

## How the Distribution Works
Load balancers use specific algorithms to decide where traffic goes. A common one is Round Robin, where the balancer simply cycles through the list: Request 1 goes to Server A, Request 2 to Server B, and so on. More advanced methods use 'Least Connections,' sending the user to the server currently handling the fewest active tasks.

## A Hypothetical Procurement Flow
Consider our procurement app. When a Manager clicks 'Approve' on a request, the HTTP request hits the Load Balancer. 

```http
GET /approve/request/123 HTTP/1.1
Host: procurement-app.com
```

The Load Balancer checks its pool: Server A is busy, but Server B is idle. It forwards the request to Server B. The Manager sees a fast response, and Server A is kept free for other employees submitting new requests.

## The Common Pitfall: Sticky Sessions
One mistake I almost made was forgetting about session data. If a user logs into Server A, but the load balancer sends their next click to Server B, Server B won't know who they are. The fix is using 'Sticky Sessions' (binding a user to one server) or, better yet, moving session data to a shared Redis cache so any server can recognize the user.

## Practical Exercise
If you have 3 servers and use a Round Robin algorithm, which server receives the 7th request?

**Answer:** Server A (1–A, 2–B, 3–C, 4–A, 5–B, 6–C, 7–A).
