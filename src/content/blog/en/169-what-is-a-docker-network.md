---
title: "What Is a Docker Network?"
description: "An introduction to how Docker containers communicate with each other and the outside world through virtual networks."
pubDate: 2026-10-13T16:48:00.000Z
translationKey: 169-what-is-a-docker-network
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application where the frontend needs to send a request to a backend API, and that API needs to talk to a PostgreSQL database. If these are in separate containers, they are isolated by default. You cannot simply use 'localhost' because each container has its own network namespace; 'localhost' inside a container refers only to itself, not the host or other containers.

## The Concept of Container Isolation
Docker uses network namespaces to ensure that containers don't interfere with each other. By default, a container is placed on a bridge network. This is a software-defined bridge that allows containers on the same host to communicate while remaining isolated from the host's physical network unless specific ports are mapped.

## Bridge vs. Host Networks
Most users use the `bridge` driver. It creates a private internal network. If you need a container to share the host's network stack directly (no isolation), you use the `host` network. However, bridge is preferred for security and organization.

## Inter-Container Communication with Compose
When using Docker Compose, Docker automatically creates a network for your services. Instead of tracking IP addresses, which change every time a container restarts, you use the service name as the hostname.

```yaml
services:
  db:
    image: postgres
  api:
    image: procurement-api
    depends_on:
      - db
```
In this setup, the `api` container reaches the database using the hostname `db` and port `5432`.

## Port Mapping: Host vs. Container
To access a container from your browser, you map a host port to a container port. For example, `-p 5332:5432` means traffic hitting your computer at port 5332 is forwarded to the container's port 5432.

## Common Mistake: The Localhost Trap
A frequent error is trying to connect to a database using `localhost:5432` inside the API code. Since the API is in its own container, it looks for the DB inside its own environment and fails. 
**Correction:** Use the service name (e.g., `db:5432`) for internal communication.

## Practical Exercise
If you have two containers on the same bridge network named `web` and `app`, and `app` listens on port 8080, how does `web` call the `app` API?

**Answer:** By sending a request to `http://app:8080`.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
