---
title: "Why Developers Use Docker"
description: "An exploration of how Docker solves the 'it works on my machine' problem by isolating environments using containers."
pubDate: 2026-10-13T08:48:00.000Z
translationKey: 161-why-developers-use-docker
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you just finished building a procurement app where a requester submits a purchase request. It works perfectly on your laptop, but the moment you deploy it to the staging server, it crashes because the server has Java 11 while you used Java 17, or a specific system library is missing. This inconsistency is the primary reason developers turn to Docker.

## The Core Mechanism: Images vs. Containers
Docker allows you to package your application and all its dependencies into a read-only template called an **Image**. When you run this image, it becomes a **Container**. Unlike a Virtual Machine (VM) that bundles a full guest operating system, a Linux container shares the host's kernel. This makes containers lightweight and fast to start. On Windows or Mac, Docker Desktop runs a small Linux VM in the background to provide this kernel.

## Solving the Environment Gap
By defining everything in a `Dockerfile`, you ensure that every developer and every server uses the exact same environment. If your app needs a PostgreSQL database, you don't ask the new hire to install it manually; you provide a configuration that spins up the exact version required.

## Worked Example: Procurement App Setup
Consider a simple setup where a Java app connects to a database. In a `docker-compose.yml` file, you might see:

```yaml
services:
  db:
    image: postgres:15
    ports:
      - "5532:5432"
  app:
    build: .
    depends_on:
      - db
```
In this case, the host machine accesses the database via port `5532`, but inside the container network, the app reaches the database using the service name `db` on port `5432`. This abstraction prevents port conflicts on the developer's machine.

## Common Mistake: Localhost Confusion
A frequent error is trying to connect to `localhost:5432` from inside the `app` container to reach the `db` container. In Docker, `localhost` refers to the container's own network namespace, not the host or other containers. 

**Correction:** Use the service name defined in Compose (e.g., `jdbc:postgresql://db:5432/procurement`).

## Practical Exercise
If you want to enter a running container to check a log file manually, which command should you use?

**Answer:** `docker exec -it <container_id> sh` (or `bash`), where `-it` allocates an interactive terminal.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
