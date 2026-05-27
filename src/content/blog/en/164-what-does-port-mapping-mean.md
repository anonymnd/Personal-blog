---
title: "Docker Ports, localhost and Service Discovery in One Network Model"
description: "A deep dive into the distinction between host-published ports, container namespaces, and Compose DNS for inter-service communication."
pubDate: 2026-10-08T04:48:00.000Z
translationKey: 164-what-does-port-mapping-mean
seriesOrder: 37
locale: en
tags: ["docker","learning-series"]
draft: false
---

## The Mental Model of Docker Networking

One of the most common points of confusion when starting with Docker is the distinction between where a service is listening and how it is reached. To understand this, we must distinguish between the Host Network and the Container Network Namespace.

Every container runs in its own isolated network namespace. This means it has its own virtual network interface and its own loopback address (`127.0.0.1`). When a process inside a container binds to `localhost:8080`, it is binding to the container's internal loopback, not the host's. If you try to access `localhost:8080` from your browser on the host machine, the request will fail because the host's loopback is entirely separate from the container's.

## Port Mapping: The Bridge

For normal Compose bridge networking, 5332:5432 publishes host port 5332 to the container’s port 5432. The process must actually listen on that container port and an appropriate interface such as 0.0.0.0. EXPOSE only documents a port; it does not start a listener or publish one. Binding only to container loopback can make port publishing ineffective.

Use 127.0.0.1:5332:5432 for a host-local development database; an unqualified mapping may publish on all host interfaces. Containers sharing the Compose network reach db:5432 directly through service discovery and do not need a published DB port. This description assumes the ordinary bridge configuration, not host networking or shared network namespaces.
## Service Discovery and Internal Communication

While port mapping is essential for the developer or the end-user, it is irrelevant for communication between containers on the same Docker network.

When using Docker Compose, Docker creates a default bridge network. Every service defined in the `docker-compose.yml` is assigned a DNS entry corresponding to its service name. Containers communicate using these names and their **internal** ports, bypassing the host's network stack entirely.

## Worked Example: Search API and Database

Let's apply this to a scenario where a Search API (Java/Spring) needs to connect to a PostgreSQL database.

### The Configuration (`docker-compose.yml` illustrative snippet)
```yaml
services:
  db:
    image: postgres:15
    ports:
      - "127.0.0.1:5332:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}

  search-api:
    image: search-api:latest
    ports:
      - "8088:8080"
    environment:
      # Note: We use the service name 'db' and the internal port 5432
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/postgres
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}
    depends_on:
      - db
```

### Traffic Flow Analysis

1. **External User → API:** The user visits `http://localhost:8088`. The host forwards this to the `search-api` container on port `8080`.
2. **API → Database:** The `search-api` container needs data. It looks up the hostname `db` via Docker's internal DNS, resolves it to the container's internal IP, and connects to port `5432`. It does **not** use `localhost:5332` because `localhost` inside the API container refers to itself, not the host.
3. **Developer → Database:** The developer uses a GUI tool (like pgAdmin) on the host to check the data. They connect to `localhost:5332`. Docker forwards this to the `db` container on port `5432`.

### Failure Cases
- **Using `localhost:5432` in the API config:** The API will try to find PostgreSQL inside its own container. Since Postgres isn't running in the API container, the connection will be refused.
- **Using `localhost:5332` in the API config:** The API will try to find a service on its own port 5332. Again, this will fail.
- **Omitting the `ports` section for `db`:** The API can still connect to the DB because they are on the same network. However, the developer cannot connect via a GUI tool from the host because no bridge exists from the host to the container.

## Focused Exercise

**Scenario:** You have a service `cache` running on port `6379` and a service `app` running on port `80`. You want the `app` to reach the `cache`, and you want to be able to run `redis-cli` from your host machine to inspect the cache.

**Question:**
1. What should the `ports` mapping for the `cache` service be in `docker-compose.yml`?
2. What connection string should the `app` use to reach the `cache`?
3. If you change the mapping to `7000:6379`, does the `app` connection string change?

**Answer:**
1. `6379:6379` (or any host port like `6379:6379`).
2. `cache:6379`.
3. No. The `app` uses the internal network; it doesn't care about the host-published port `7000`.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
