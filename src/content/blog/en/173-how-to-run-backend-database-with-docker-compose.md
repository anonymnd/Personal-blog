---
title: "How to Run Backend + Database With Docker Compose"
description: "Learn how to orchestrate a multi-container application using Docker Compose to connect a backend service to a database."
pubDate: 2026-10-13T20:48:00.000Z
translationKey: 173-how-to-run-backend-database-with-docker-compose
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You have built a Java backend and a PostgreSQL database. Everything works locally, but when you try to run them in containers, the backend crashes because it cannot find the database at 'localhost'. This happens because each container has its own network namespace; 'localhost' inside the backend container refers to itself, not the database container.

## One project, a shared network
Compose describes services, networks and storage in one configuration. On its default project network, services resolve each other by service name. The backend therefore uses db and the database container port 5432. A host port mapping is for a client outside that network; it is not needed just for backend-to-database communication.
## A Spring Boot Compose example
Assume you already have a working backend Dockerfile that starts the app on port 8080. Supply POSTGRES_PASSWORD locally. These are Spring Boot datasource environment variables, not an arbitrary DB_URL that would require custom application binding:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d procurement"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: .
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/procurement
      SPRING_DATASOURCE_USERNAME: app
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    depends_on:
      db:
        condition: service_healthy

volumes:
  db_data:
```
## Connectivity and stored data
The backend connects to jdbc:postgresql://db:5432/procurement with the same app credentials used to initialize a fresh database. The host opens the backend at localhost:8080. PostgreSQL storage is mounted to db_data for this PostgreSQL 15 example. A normal compose down retains that volume. Reusing a nonempty volume also reuses its existing database credentials; changing initialization environment variables does not rewrite them.
## Startup order is not ongoing availability
The healthcheck and service_healthy condition wait for the database health signal before initially starting the backend. A plain list-form depends_on only orders startup. Readiness does not guarantee that the database will remain available forever or that every application migration is complete. The backend still needs appropriate connection retry and runtime failure handling. Build and start the prepared project with docker compose up --build.
## Practical exercise
You want database logs, then an interactive shell. Which commands match each need?

**Answer:** `docker compose logs -f db` follows service logs. `docker compose exec db sh` starts a shell in the running container. A shell and a log viewer are different tools; you do not need to enter the container merely to read its standard output.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
