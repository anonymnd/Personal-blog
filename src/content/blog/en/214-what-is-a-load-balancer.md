---
title: "What Is a Load Balancer?"
description: "A comprehensive guide to understanding how load balancers distribute network traffic across multiple servers to ensure high availability."
pubDate: 2026-10-15T13:48:00.000Z
translationKey: 214-what-is-a-load-balancer
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imagine you have a procurement application where employees submit purchase requests. Initially, one server handles everything. But as the company grows, that single server crashes under the pressure of hundreds of simultaneous requests. You add three more servers, but now you have a new problem: how do you decide which server should handle which request?

## The Core Mechanism
A load balancer acts as a reverse proxy, sitting between the client and a pool of backend servers. Instead of the client connecting directly to a server, it hits the load balancer, which forwards the request based on a specific algorithm. This prevents any single server from becoming a bottleneck and ensures that if one server fails, the traffic is rerouted to healthy ones.

## L4 vs L7 Load Balancing
Load balancers operate at different layers of the OSI model. Layer 4 (Transport) is fast because it only looks at IP addresses and TCP/UDP ports. It doesn't know what's inside the packet. Layer 7 (Application) is smarter; it can inspect HTTP headers, cookies, or URL paths. For example, it could send `/orders` requests to one server group and `/approvals` to another.

## Distribution Algorithms
Choosing the right algorithm depends on your traffic pattern:

| Algorithm | Logic | Best Use Case |
| :--- | :--- | :--- |
| Round Robin | Sequential order | Servers with identical specs |
| Least Connections | Server with fewest active tasks | Long-lived connections (WebSockets) |
| IP Hash | Client IP determines server | Basic session persistence |

## Worked Example: Procurement App
Suppose we have three servers (S1, S2, S3) and a Round Robin load balancer. 
1. Requester A submits a request → LB sends to S1.
2. Manager B opens the approval dashboard → LB sends to S2.
3. Buyer C processes an order → LB sends to S3.
4. Requester D submits a request → LB loops back to S1.

Outcome: Traffic is spread evenly, and no single server is overwhelmed.

## Common Mistake: The State Trap
Developers often forget that load balancers make the system stateless. If a user logs into S1, and their next request goes to S2, S2 won't know who they are. 
**Correction:** Use a shared external state (like Redis) or "Sticky Sessions" (session affinity) to ensure a user stays with the same server.

## Practical Exercise
If you have servers with vastly different CPU and RAM capacities, why is Round Robin a poor choice?

**Answer:** Round Robin treats all servers as equal. A weak server will be overwhelmed while a powerful server remains underutilized.
