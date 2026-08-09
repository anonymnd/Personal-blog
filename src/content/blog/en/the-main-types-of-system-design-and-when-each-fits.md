---
title: "The Main Types of System Design (And When Each One Fits)"
description: "A map of the system design vocabulary—monolith, layered, client-server, microservices, event-driven, SOA, P2P, and serverless—and the tradeoff each one is actually solving."
pubDate: 2026-10-12T02:00:00.000Z
translationKey: the-main-types-of-system-design-and-when-each-fits
locale: en
tags: ["system-design", "architecture", "distributed-systems"]
draft: false
---

"System design" gets used as if it were one skill, but it's really a vocabulary of recurring shapes, each one trading a specific cost for a specific benefit. Before picking a shape for your own system, it helps to know what shapes exist and what each one is actually buying you. This is a map, not a ranking—nothing here is "the modern one."

## Monolithic architecture

A monolith deploys as a single unit: one codebase, one build, one running process (or a small fleet of identical copies behind a load balancer). Every module calls every other module in-process, as a function call, not a network call.

The benefit is that most of distributed systems' hardest problems simply don't exist yet. There's no network partition between the order module and the payment module, because they're the same process. A stack trace spans the whole request. A database transaction can touch two "modules" atomically because nothing stops it.

The cost shows up as the codebase and the team grow: build times climb, a bug in one module can take down the whole process, and every deploy ships the entire system even if one line changed. None of this is about code quality—a well-factored monolith with clean internal boundaries is a legitimate end state, not just a starting point (see [Choose Module Boundaries Before Choosing Microservices](/Personal-blog/en/blog/253-monolith-vs-microservices/) for how to draw those internal boundaries before anything splits).

## Layered (n-tier) architecture

Layering is a cut orthogonal to monolith-vs-distributed: it's about how responsibilities stack, not how they deploy. A classic 3-tier split is presentation (UI/API), business logic (services), and data access (repositories), each layer only allowed to call the layer below it.

The benefit is that a change to how data is stored shouldn't ripple into business rules, and a change to the API shape shouldn't ripple into persistence. The cost is indirection—a request to fetch a user can pass through four layers before touching SQL, and over-layering a small system adds files without adding safety. A monolith is almost always layered internally; the layering is what keeps a monolith from becoming an unstructured ball of mud.

## Client-server architecture

This is the oldest split: a client that requests, a server that responds, over a defined protocol. Every web app, every REST API, every database connection is client-server at its core. What varies is how "thin" the client is—a browser rendering server-sent HTML is a thin client; a native app holding business logic and only fetching raw data is a thick client.

The tradeoff is where state and logic live. Thin clients centralize control (one place to fix a bug, one place to enforce a rule) but need a network round-trip for everything. Thick clients feel faster and work offline but duplicate logic across every client you ship, and that logic drifts out of sync with the server's.

## Service-oriented architecture (SOA)

SOA splits a system into services that communicate over a network, usually through a shared integration layer—historically an enterprise service bus (ESB) that handled routing, transformation, and orchestration between services. Each service is meant to be independently reusable by multiple consumers.

The benefit is reuse: a "customer lookup" service can serve the website, the mobile app, and a nightly batch job without three separate implementations. The cost is that the shared bus becomes a bottleneck and a single point of failure—every service's availability depends on the bus's availability, and the bus's own logic (routing rules, transformations) becomes a second codebase that's hard to test. This is the direct ancestor of microservices, and the distinction matters.

## Microservices

Microservices push SOA's idea further: small, independently deployable services, each owning its own data, communicating directly (REST, gRPC, messaging) instead of through a shared bus. "Independently deployable" is the load-bearing phrase—if two services must ship together to avoid breaking, they're not actually independent, whatever the deployment pipeline looks like.

The benefit is that teams can own, scale, and deploy services independently: the checkout service can scale to handle a flash sale without the catalog service scaling with it. The cost is that every one of the monolith's non-problems becomes a real problem—network calls can fail or time out, a transaction spanning two services needs a saga or a compensating action instead of a database COMMIT, and you now need service discovery, distributed tracing, and a plan for what happens when a dependency is slow instead of down. Splitting a system into microservices before you know where its real boundaries are usually produces a distributed monolith: network latency and serialization cost, with none of the independence.

## Event-driven architecture

Instead of services calling each other directly, they publish events ("OrderPlaced", "PaymentFailed") to a broker (Kafka, RabbitMQ, SQS), and other services subscribe to the events they care about. The publisher doesn't know or care who's listening.

The benefit is decoupling in time and in knowledge: the order service doesn't need the shipping service to be online right now, and doesn't need to know shipping exists at all. New consumers can be added later without touching the publisher. The cost is that the system's behavior is no longer visible by reading one service's code—tracing "what happens when an order is placed" means knowing every consumer that exists, and debugging requires correlating events across services instead of following one call stack. Eventual consistency also becomes a fact of life: for a window of time, the order exists but the warehouse doesn't know yet.

## Peer-to-peer (P2P)

P2P removes the central server entirely: every node can act as both client and server, and nodes talk directly to each other (BitTorrent, blockchain networks, some chat protocols). There's no single machine whose failure takes the system down.

The benefit is resilience to any one node failing and the ability to scale capacity simply by adding more peers. The cost is that there's no central authority to enforce consistency, coordinate state, or arbitrate conflicts—whatever coordination a central server would have given you for free (a single source of truth, a simple place to check permissions) has to be rebuilt as a protocol that every peer agrees to follow, which is a genuinely hard problem (consensus algorithms like Raft and Paxos exist largely to solve pieces of it).

## Serverless (FaaS)

In serverless, you deploy individual functions, not services—the platform (AWS Lambda, Cloudflare Workers, Azure Functions) handles provisioning, scaling, and tearing down the runtime per request. "Serverless" doesn't mean no servers; it means you don't manage them.

The benefit is that you pay for execution, not for idle capacity, and scaling to zero and scaling to thousands of concurrent requests are both handled by the platform. The cost is cold starts (the first request to a function after idle time pays a startup penalty), a hard ceiling on how long a function can run, and a loss of control over the runtime environment—debugging a timeout in production looks different when you can't attach a profiler to a process that only existed for 200ms.

## How to actually choose

None of these are mutually exclusive in a real system—a single product commonly runs a monolith for its core domain, serverless functions for spiky background jobs, and an event bus connecting the two. The question worth asking before picking a shape isn't "which one is more scalable," it's: where are the real boundaries in this domain, and what does crossing one of those boundaries cost today versus what it will cost once the team or the traffic is 10x bigger? A shape chosen to look impressive in a design doc, rather than to answer that question, is the most common way a system ends up more complex than the problem it solves.
