---
title: "Docker Compose Explained Simply"
description: "Learn how to orchestrate multiple containers using a single YAML file to simplify your development environment."
pubDate: 2026-10-13T19:48:00.000Z
translationKey: 172-docker-compose-explained-simply
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a Java backend for requests, a PostgreSQL database to store orders, and a Redis cache for performance. Running these manually requires three separate `docker run` commands with complex network flags and environment variables. If you forget one flag, the backend cannot find the database, leading to a connection error.

## What is Docker Compose?
Docker Compose is a tool for defining and running multi-container applications. Instead of typing long commands in the terminal, you use a `docker-compose.yml` file. This file acts as a blueprint, telling Docker which images to use, how to link them together, and which ports to open.

## The Mechanism of Orchestration
Compose creates a dedicated network for your services. Inside this network, containers don't use IP addresses; they use the service name defined in the YAML file. For example, if your database service is named `db`, the backend connects to `jdbc:postgresql://db:5432/orders`. Note that while the host sees the database on port 5432 via mapping, the containers talk to each other using the internal container port.

## Worked Example: Procurement App
Here is a simplified excerpt of a `docker-compose.yml` for our app:

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: pass
  backend:
    build: . 
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  db_data:
```

Running `docker compose up -d` starts both. The `db_data` named volume ensures that when you update the database image, your procurement requests aren't deleted. To enter the running backend to check logs, you use `docker compose exec backend sh`.

## Common Mistake: Readiness vs. Ordering
A common error is assuming `depends_on` ensures the database is fully ready to accept connections. `depends_on` only controls the startup order (starting the container), not the application readiness. If the backend starts faster than Postgres, it might crash. The correction is to implement a "wait-for-it" script or a retry logic in your Java code.

## Practical Exercise
If you have a service named `cache` running Redis on port 6379, and you want to access it from another container in the same Compose file, what hostname should you use?

**Answer:** Use `cache` as the hostname.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
