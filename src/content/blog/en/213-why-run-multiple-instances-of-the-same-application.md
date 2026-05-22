---
title: "Scale Application Instances and Route Traffic with a Load Balancer"
description: "Learn how to scale a document-rendering service by externalizing state and choosing between L4/L7 routing algorithms."
pubDate: 2026-10-08T13:48:00.000Z
translationKey: 213-why-run-multiple-instances-of-the-same-application
seriesOrder: 46
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## The Problem with Vertical Scaling

When a single instance of a service reaches its CPU or memory limit, the traditional response is to add more resources (vertical scaling). However, this has a hard ceiling and creates a single point of failure. Horizontal scaling—running multiple identical instances of the same application—allows us to distribute the load. 

But moving from one instance to many introduces a critical challenge: **State**. If a user uploads a document to Instance A and then requests the status of that render from Instance B, Instance B will have no record of the job if the state is stored in local memory or a local disk. To scale, the application must be stateless. All durable state (session data, job status, uploaded files) must be moved to an external shared store, such as a database or a distributed cache. 

## L4 vs L7 Load Balancing

To distribute incoming traffic across these instances, we use a Load Balancer (LB). The choice between Layer 4 (Transport) and Layer 7 (Application) routing depends on how much the LB needs to "understand" the traffic.

### Layer 4 (L4) Load Balancing
L4 operates at the TCP/UDP level. It looks only at the IP address and port. It does not inspect the contents of the packet. 
- **Mechanism**: It simply forwards TCP packets to the backend instances.
- **Pros**: Extremely fast, low CPU overhead, as it doesn't decrypt SSL/TLS or parse HTTP headers.
- **Cons**: Blind to the request content. It cannot route based on a URL path or a cookie.

### Layer 7 (L7) Load Balancing
L7 operates at the Application level (HTTP/HTTPS). It terminates the connection, reads the request, and then makes a routing decision.
- **Mechanism**: It can inspect HTTP headers, cookies, and the URL path.
- **Pros**: Intelligent routing. For example, it can send `/status` requests to a lightweight pool of instances and `/render` requests to a pool with high-CPU resources.
- **Cons**: Higher latency and CPU usage because it must parse the application data.

## Routing Algorithms: Round Robin vs. Least Connections

Round robin spreads routing selections; it does not equalize CPU cost. L4 normally balances connections or flows, so many HTTP requests on one persistent connection can stay on one backend. L7 can make decisions per request depending on implementation.

Least connections uses connection count as a proxy, not a measurement of actual load. A connection may carry many HTTP/2 streams, one long render or only idle keep-alive traffic. Compare representative traffic, backend concurrency and queue depth before choosing. Weighted routing and bounded per-instance concurrency can help avoid assigning more work than a render process can safely perform.
## Worked Example: Document Rendering Service

Imagine a service with two types of traffic: 
1. `GET /status/{id}` (Fast, low CPU)
2. `POST /render` (Slow, high CPU)

### The Architecture Plan
- **External State**: Use a shared PostgreSQL database for job metadata and an S3-compatible object store for the actual documents. This ensures any instance can handle any request.
- **LB Choice**: L7 Load Balancer. This allows us to use **Path-Based Routing**.
- **Routing Logic**:
    - Path `/status` → Route to "Light Pool" (Small instances) using **Round Robin** (since requests are uniform).
    - Path `/render` → Route to "Heavy Pool" (Compute-optimized instances) using **Least Connections** (since render times vary by document size).
- **Health Checks**: The LB periodically sends a request to `/health`. If an instance returns a 500 error or times out, the LB removes it from the rotation until it becomes healthy again.

### Capacity Measurement
To determine when to scale, we monitor **Concurrent Requests per Instance**. If the "Heavy Pool" average is 80% of the maximum allowed concurrent renders, we trigger the creation of a new instance.

## Exercise

Uneven memory pressure despite similar traffic counts is evidence to investigate request cost, connection reuse, leaks and concurrency—not proof that one routing algorithm is at fault. Profile render memory and cap concurrent jobs. Queue heavy work or separate heavy endpoints when measured demand justifies it, and test weighted/least-connection routing as appropriate.

External shared state simplifies this stateless API design, but stateful services can also scale with deliberate partitioning or replication; statelessness is not a universal prerequisite. A distributed cache is not automatically durable storage. Health checks and scale-out take time; verify draining, retries, duplicate-work protection and capacity during instance loss. Treat the example’s 80% trigger as a policy to test, not a universal threshold.
