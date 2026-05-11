---
title: "What Does Port Mapping Mean?"
description: "A beginner's guide to understanding how Docker connects your computer's network ports to those inside a container."
pubDate: 2026-10-13T11:48:00.000Z
translationKey: 164-what-does-port-mapping-mean
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a database running inside a Docker container. You try to connect to it using `localhost:5432` on your machine, but the connection is refused. Even though the database is running perfectly inside the container, it is trapped in its own isolated network namespace. To the outside world, the container is like a locked room with no doors; port mapping is the act of creating a specific door between your host machine and that room.

## The Mechanism of Mapping
By default, containers have their own internal IP addresses and ports. However, your browser or API client communicates with your host OS. Port mapping (or port forwarding) tells Docker: "Any traffic hitting the host on port X should be forwarded to the container on port Y." This is expressed as `host_port:container_port`. It is important to remember that the container's `localhost` is different from your machine's `localhost`.

## A Worked Example: Procurement App
Suppose you are building a procurement app where a requester submits a request. The backend runs on port 8080 inside the container, but you want to access it via port 9000 on your laptop to avoid conflicts with other apps.

```bash
# Mapping host port 9000 to container port 8080
docker run -p 9000:8080 procurement-backend
```

**Outcome:** When you visit `http://localhost:9000`, Docker intercepts the request and routes it to port 8080 inside the container. The app processes the request and sends the response back through the same tunnel.

## Common Mistake: Reversing the Order
A frequent error for beginners is swapping the ports, such as writing `-p 8080:9000` when the app inside is actually listening on 8080. 

**Correction:** Always remember the pattern `External:Internal`. If your Java Spring Boot app uses `server.port=8080`, the second number in your mapping must be 8080.

## Inter-Container Communication
If you have a procurement manager service and a buyer service in the same Docker Compose network, they don't use port mapping to talk to each other. They use the service name and the internal port. For example, the manager service reaches the buyer service via `http://buyer:8080`, bypassing the host's network entirely.

## Practical Exercise
You have a PostgreSQL container that listens on port 5432 internally. You want to connect to it using port 5332 on your host machine. What is the correct docker run flag?

**Answer:** `-p 5332:5432`

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
