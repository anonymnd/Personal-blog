---
title: "How Two Containers Communicate"
description: "A beginner's guide to understanding internal networking and service discovery between Docker containers."
pubDate: 2026-10-13T17:48:00.000Z
translationKey: 170-how-two-containers-communicate
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application where a Java backend handles requests and a PostgreSQL database stores the data. You start both containers, but when the backend tries to connect to `localhost:5432`, it fails. This happens because each container has its own isolated network namespace; `localhost` inside the backend container refers to itself, not the database container or the host machine.

## The Role of Docker Networks
To allow containers to talk to each other, they must be on the same virtual network. By default, Docker Compose creates a single network for all services defined in the `docker-compose.yml` file. This network provides a built-in DNS server that allows containers to find each other using their service names instead of unstable IP addresses.

## Service Discovery in Action
When the backend container sends a request to `db:5432`, Docker's internal DNS resolves `db` to the private IP address of the database container. It is important to distinguish between the internal port (used for container-to-container talk) and the published port (used for host-to-container talk).

## Worked Example: Procurement App
Consider this `docker-compose.yml` excerpt:

```yaml
services:
  db:
    image: postgres
    ports:
      - "5432:5432"
  backend:
    image: procurement-api
    environment:
      - DB_URL=jdbc:postgresql://db:5432/orders
```

In this setup, the `backend` connects to the database using `db:5432`. If you tried to use `localhost:5432` in the `DB_URL`, the connection would be refused because the backend would look for PostgreSQL inside its own container.

## Common Mistake: Port Confusion
A frequent error is thinking that the host port mapping (e.g., `8080:80`) is required for internal communication. If the backend needs to reach the database, it uses the internal port `5432`, regardless of whether you mapped it to the host or not. The mapping `5432:5432` is only for your database management tool (like pgAdmin) running on your desktop to reach the container.

## Practical Exercise
If you have two services named `web` and `cache` in one Compose file, and `cache` listens on port 6379, what URL should the `web` service use to connect to the cache?

**Answer:** `cache:6379`

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
