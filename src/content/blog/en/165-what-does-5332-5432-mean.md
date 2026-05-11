---
title: "What Does 5332:5432 Mean?"
description: "A deep dive into Docker port mapping to understand how your host machine communicates with a containerized application."
pubDate: 2026-10-13T12:48:00.000Z
translationKey: 165-what-does-5332-5432-mean
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have just started a PostgreSQL container using Docker. You try to connect your database GUI to `localhost:5432`, but you get a 'Connection Refused' error, even though the logs say the database is running perfectly. The problem usually lies in a misunderstanding of the `-p 5332:5432` flag.

## The Host vs. Container Divide
Docker containers run in their own isolated network namespace. This means the container has its own internal IP address and its own set of ports. If a database inside a container is listening on port 5432, it is listening on the *container's* localhost, not your laptop's localhost. To reach that service from outside, you must create a bridge.

## Decoding the Syntax
The syntax `host_port:container_port` acts as a routing rule. In the example `5332:5432`:
- **5332 (Host Port):** This is the port you open on your physical machine. When you tell your app to connect to `localhost:5332`, Docker intercepts this traffic.
- **5432 (Container Port):** This is the port the application is actually listening on inside the container. Docker forwards the traffic from 5332 to this internal port.

## Worked Example: Procurement App
Imagine a procurement system where a `request-service` needs to save data to a PostgreSQL container. In your `docker-compose.yml`, you define:

```yaml
services:
  db:
    image: postgres
    ports:
      - "5332:5432"
```

**Outcome:** 
1. If you use a tool like pgAdmin on your desktop, you connect to `localhost:5332`.
2. If another container in the same network wants to talk to the DB, it uses the service name `db:5432` (ignoring the host port entirely).

## Common Mistake: Swapping the Order
A frequent error is writing `5432:5332`. This tells Docker to take traffic from your machine's port 5432 and send it to port 5332 inside the container. Since PostgreSQL is listening on 5432 internally, the connection will fail because nothing is listening on 5332 inside the container.

## Practical Exercise
If you want to run a web server that listens internally on port 80, but you already have another website running on your host's port 80, how would you map the ports so you can access the container via `localhost:8080`?

**Answer:** Use `-p 8080:80`.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
