---
title: "Deployment Diagrams: Where Does Your Application Actually Run?"
description: "Learn how to visualize the physical hardware and software distribution of your system using UML Deployment Diagrams."
pubDate: 2026-10-07T21:48:00.000Z
translationKey: 030-deployment-diagrams-where-does-your-application-actually-run
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

You have finished your class diagrams and sequence diagrams, but there is a gap: you know how the code works, but you don't know where it lives. When a developer asks, 'Does the PDF generator run on the web server or a separate worker node?', a Deployment Diagram provides the definitive answer.

## The Core Concept of Deployment
Unlike other UML diagrams that focus on logic, the Deployment Diagram focuses on the physical architecture. It maps software artifacts (like JAR files or Docker images) to nodes. A node represents a computational resource, such as a physical server, a virtual machine, or a cloud instance. The connection between nodes represents the communication path, often labeled with the protocol used, such as HTTPS or TCP/IP.

## Nodes and Artifacts
In UML, a node is typically a 3D cube. Inside these cubes, we place artifacts. An artifact is the physical manifestation of your software. For example, if you are building a procurement app, your `procurement-api.war` file is the artifact, and the `Application Server` is the node. This distinction is crucial because one physical server might host multiple virtual nodes or containers.

## Worked Example: Procurement System
Imagine a procurement application where a requester submits a request and a manager approves it. The deployment would look like this:
1. **Client Node (Browser):** Runs the `Procurement-UI` (JavaScript/HTML).
2. **Web Server Node:** Hosts the `Procurement-Backend` (Jakarta EE application).
3. **Database Node:** A dedicated server running `PostgreSQL`.

Communication flows from the Browser to the Web Server via HTTPS, and from the Web Server to the Database via JDBC. This tells the operations team exactly which ports to open in the firewall.

## Common Mistake: Confusing Logic with Physicality
A frequent error is placing a 'User' or 'Manager' inside a deployment diagram. Users are actors (from Use Case diagrams), not hardware. You should instead model the 'Laptop' or 'Mobile Device' the user is holding. If you draw a line from a 'Manager' to a 'Server', you are drawing a business flow, not a deployment path.

## Practical Exercise
**Scenario:** Your app needs a separate 'Email Service' node to send notifications when a buyer orders a product. Where does the `Email-Service.jar` go, and how does it connect to the `Web Server`?

**Check:** The `Email-Service.jar` is placed inside a new 'Mail Server' node. The connection is a line from the 'Web Server' node to the 'Mail Server' node, labeled with a protocol like SMTP.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
