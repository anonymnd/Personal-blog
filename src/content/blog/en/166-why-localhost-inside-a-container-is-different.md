---
title: "Why localhost Inside a Container Is Different"
description: "Understand the network isolation between your host machine and Docker containers to fix connection errors."
pubDate: 2026-10-13T13:48:00.000Z
translationKey: 166-why-localhost-inside-a-container-is-different
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement app where the backend needs to connect to a PostgreSQL database. You start the database in a container and the backend on your host machine. You use `localhost:5432` in your config, but the app fails to connect. This happens because `localhost` is not a global address; it is a loopback interface specific to the network namespace of the process using it.

## The Network Namespace Concept
In Docker, each container runs in its own isolated network namespace. When a process inside a container calls `localhost` or `127.0.0.1`, it is talking to itself, not the host machine and not other containers. The container thinks it is the only thing running on that specific virtual network interface. This isolation is what allows you to run three different containers all listening on port 80 without them crashing into each other.

## Host vs. Container Mapping
To let the outside world (your host) talk to the container, you use port mapping. For example, `-p 5332:5432` tells Docker: "Take traffic coming to the host on port 5332 and send it to the container on port 5432." 

| Perspective | Address to use | Target |
| :--- | :--- | :--- |
| Host → Container | `localhost:5332` | The mapped host port |
| Container → Self | `localhost:5432` | Its own internal port |
| Container → Host | `host.docker.internal` | The host machine |

## Worked Example: Procurement Database
Consider a `docker-compose.yml` snippet for a procurement system:

```yaml
services:
  db:
    image: postgres
    ports:
      - "5332:5432"
  api:
    build: .
    depends_on:
      - db
```

If the `api` container tries to connect to `localhost:5432`, it will fail because the database is in a different container. Instead, Docker Compose creates a DNS entry. The `api` should use `db:5432` to reach the database.

## Common Mistake: The Localhost Trap
**Mistake:** Using `localhost` in a `.env` file that is shared by both the local development environment and the Dockerized environment.
**Correction:** Use environment variables for the DB host. Use `localhost` when running the app natively, and the service name (e.g., `db`) when running inside Docker.

## Practical Exercise
If you have a container mapping port 8080 on the host to 80 in the container, and you run `curl localhost:80` inside the container's shell, will it work? 

**Answer:** Yes, because inside the container, the service is actually listening on port 80.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
