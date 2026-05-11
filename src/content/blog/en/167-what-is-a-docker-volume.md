---
title: "What Is a Docker Volume?"
description: "Learn how Docker volumes solve the problem of data loss when containers are deleted or updated."
pubDate: 2026-10-13T14:48:00.000Z
translationKey: 167-what-is-a-docker-volume
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are running a procurement application where requesters submit purchase requests. Your database container stores all these requests. One day, you need to update the database version, so you delete the old container and start a new one. Suddenly, all your procurement data is gone. This happens because containers are ephemeral; their internal writable layer is destroyed when the container is removed.

## The Mechanism of Persistence
Docker volumes are specialized directories stored on the host machine's filesystem but managed by Docker. Unlike the container's own writable layer, a volume exists independently of the container's lifecycle. When you mount a volume, Docker maps a path inside the container to a location on the host. This ensures that when a container is replaced, the new instance can simply re-attach to the same volume and find the data exactly where it was left.

## Practical Implementation
Consider a procurement app using PostgreSQL. To ensure the requests are saved, we use a named volume. Here is an illustrative excerpt of a `docker-compose.yml` file:

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - procurement_data:/var/lib/postgresql/data

volumes:
  procurement_data:
```

In this setup, any data written to `/var/lib/postgresql/data` inside the container is actually stored in the `procurement_data` volume on the host. If you run `docker compose down` and then `docker compose up`, the data persists.

## Common Mistake: Volume vs. Backup
A frequent error is believing that volumes are a substitute for backups. While volumes persist across container restarts and replacements, they are still just files on a disk. If the host disk fails or someone accidentally runs `docker compose down -v` (the `-v` flag explicitly deletes volumes), the data is lost forever. Always implement a separate database dump strategy.

## Quick Exercise
If you have a volume named `app_logs` mounted to `/app/logs` and you delete the container using `docker rm -f my_container`, what happens to the logs?

**Answer:** The logs remain safe in the `app_logs` volume on the host and can be accessed by any new container that mounts that same volume.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
