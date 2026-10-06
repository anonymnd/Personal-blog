---
title: "What Is a Server?"
description: "A fundamental exploration of servers as hardware and software that provide resources to other computers on a network."
pubDate: 2026-10-16T06:48:00.000Z
translationKey: 231-what-is-a-server
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you are building a procurement app where a requester submits a purchase request. If that request is saved only on the requester's laptop, the manager cannot see it to approve it. This is the core problem a server solves: it provides a centralized location for data and services that multiple clients can access regardless of their location.

## Hardware vs. Software
A server is often described as a physical machine, but it is actually two things working together. The hardware is a powerful computer with high-capacity RAM and CPUs designed to run 24/7. The software is a program (like Apache, Nginx, or a Spring Boot application) that listens for incoming requests and sends back a response.

## The Client-Server Model
This relationship is like a restaurant. The client (the user's browser) is the customer who orders food. The server is the kitchen. The client sends a request via HTTP, and the server processes that request—perhaps checking a database to see if a procurement request is pending—and returns the result.

## A Worked Example: The Procurement Request
When a user clicks "Submit Request" in our app, the following happens:
1. **Request**: The browser sends a POST request to `http://procurement-server/api/requests`.
2. **Processing**: The server software receives the data, validates that the requester has the right permissions, and saves the request to a database.
3. **Response**: The server sends back a `201 Created` status code.

Outcome: The data is now stored centrally, allowing the manager to log in from a different device and see the request immediately.

## Common Mistake: Confusing a Server with a Host
Beginners often think any computer connected to the internet is a "server." In reality, your laptop is a host. It only becomes a server when it runs server software that listens for and serves requests from other machines. Simply having an IP address doesn't make a machine a server.

## Practical Exercise
If you run a simple Java application on your laptop and use a tool like Postman to send a request to `localhost:8080`, is your laptop acting as a client or a server in that specific moment?

**Answer**: It is acting as both. Postman is the client, and the Java application running on your laptop is the server.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
