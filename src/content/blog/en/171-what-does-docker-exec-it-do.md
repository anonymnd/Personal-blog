---
title: "Run and Diagnose an Application Stack with Docker Compose"
description: "Mastering service orchestration for a Recipe API and PostgreSQL, focusing on health-based readiness and diagnostic tools."
pubDate: 2026-10-08T06:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
seriesOrder: 39
locale: en
tags: ["docker","learning-series"]
draft: false
---

## Orchestrating the Recipe API Stack

When deploying a backend application alongside a database, the primary challenge is not just starting the containers, but ensuring the application does not crash because the database is still initializing. While `depends_on` controls the order of container startup, it does not guarantee that the software inside the container is ready to accept connections.

## The Worked Configuration

In this scenario, we deploy a Recipe API and a PostgreSQL instance. We use an external `.env` file to supply credentials, ensuring secrets are not hardcoded in the YAML.

**.env file (illustrative)**
```env
DB_USER=recipe_admin
DB_PASSWORD=secure_password_123
DB_NAME=recipe_db
```

**docker-compose.yml**
```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
```

## Mechanism: Readiness vs. Startup

If we used a simple `depends_on: [db]`, Docker would start the PostgreSQL container and immediately start the API. However, PostgreSQL takes several seconds to initialize its internal data directory and start the listener. The API would attempt to connect, fail, and likely terminate with a `ConnectionRefused` exception.

By adding the `healthcheck` to the `db` service, we use the `pg_isready` utility—a tool specifically designed to check the connection status of a PostgreSQL server without requiring a full authentication handshake. The `api` service now uses `condition: service_healthy`, meaning it remains in a waiting state until the `db` healthcheck returns a successful exit code (0).

## Diagnosing the Stack

Even with healthchecks, failures occur (e.g., wrong credentials or schema migration errors). Diagnostics require moving from the host perspective into the container's namespace.

#### 1. Log Analysis
To see why the API is failing to boot, we stream the logs:
`docker compose logs -f api`

If the logs show `FATAL: password authentication failed for user "recipe_admin"`, we know the environment variables passed to the API do not match those passed to the DB.

#### 2. Interactive Inspection
When logs are insufficient, we use `docker exec -it`. This command allocates a pseudo-TTY and keeps STDIN open, allowing us to run commands inside the running container.

To verify if the database is actually reachable from the API's network perspective:
`docker compose exec api ping db`

To test the database connection manually from the DB container itself:
`docker compose exec db pg_isready -U recipe_admin -d recipe_db`

If `pg_isready` returns `accepting connections` inside the DB container but the API still fails, the issue is likely the connection string (URL) or the network bridge, not the database process.

## Failure Cases and Consequences

*   **Incorrect `start_period`**: If the `start_period` is too short and the DB is slow to boot, the healthcheck might exhaust its `retries` before the DB is ready, causing the API to never start.
*   **Wrong Port in URL**: Using `localhost:5432` in the `SPRING_DATASOURCE_URL` will fail. Inside the container network, `localhost` refers to the API container itself. You must use the service name `db:5432`.
*   **Zombie Containers**: If the API crashes repeatedly, `docker compose up` might keep restarting it. Use `docker compose stop` to freeze the state for diagnosis.

## Exercise

To test the specified local TCP port without assuming netstat or ss is installed, run docker compose exec db pg_isready -h 127.0.0.1 -p 5432 -U recipe_admin -d recipe_db. A successful check reports that 127.0.0.1:5432 accepts connections and returns exit code 0. This proves readiness on that local interface, not that the API authenticates or can connect over the container network. Test the actual datasource connection separately, using tools present in the image or an approved diagnostic container on the same network.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
