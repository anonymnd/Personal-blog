---
title: "The Four Docker Concepts You Actually Need to Understand"
description: "A practical guide to mastering images, containers, networking, and volumes without getting lost in the Docker ecosystem."
pubDate: 2026-10-13T22:48:00.000Z
translationKey: 175-the-four-docker-concepts-you-actually-need-to-understand
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many beginners struggle with Docker because they treat it like a Virtual Machine. They spend hours trying to 'log in' to a server that doesn't exist or wonder why their database data vanishes after a simple restart. The confusion usually stems from mixing up the blueprint with the building.

## Images vs. Containers
An Image is a read-only template. Think of it as a frozen snapshot of your application and its dependencies. A Container is the living, running instance of that image. If you have one `postgres` image, you can start five separate containers from it; each will behave independently, but they all started from the same blueprint.

## The Host Kernel and Virtualization
Unlike a VM, which bundles a whole operating system, Docker containers share the host's Linux kernel. This makes them lightweight. If you are on Windows or Mac, Docker Desktop actually runs a small Linux VM in the background to provide this kernel, which is why you might see a Linux environment even on a MacBook.

## Networking and Port Mapping
Containers live in their own network namespace. When you see `-p 5332:5432`, you are mapping the host's port 5332 to the container's port 5432. 

Crucially, `localhost` inside a container refers to the container itself, not your computer. In a procurement app, the `requester-service` cannot reach the `db-service` via `localhost`. It must use the service name defined in Docker Compose.

```yaml
# Illustrative excerpt from docker-compose.yml
services:
  db-service:
    image: postgres
    ports:
      - "5332:5432"
  requester-service:
    build: .
    environment:
      - DB_URL=jdbc:postgresql://db-service:5432/procure
```

## Persistence with Named Volumes
Containers are ephemeral. If you delete a container, the data inside is gone. Named volumes solve this by mapping a folder on your host to a folder in the container. Note that volumes are for persistence, not backups; if you delete the volume using `docker compose down -v`, the data is permanently erased.

## Interactive Access
To debug a running container, use `docker exec -it <container_id> sh`. The `-i` keeps stdin open and `-t` allocates a pseudo-terminal, allowing you to run commands inside the environment as if you were logged in.

**Common Mistake:** Trying to connect to a database using `localhost:5432` from another container. 
**Correction:** Use the service name (e.g., `db-service:5432`) for inter-container communication.

**Exercise:** You have a container running on port 8080 inside, but you want to access it via port 9000 on your browser. What is the correct port mapping flag?
**Answer:** `-p 9000:8080`

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
