---
title: "Why Your Database Data Survives Container Restarts"
description: "Understand the critical distinction between the ephemeral container layer and persistent Docker volumes."
pubDate: 2026-10-13T15:48:00.000Z
translationKey: 168-why-your-database-data-survives-container-restarts
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

You restart a PostgreSQL container and your purchase requests are still there. That is expected: restarting the same container does not erase its writable filesystem. The important distinction is between restarting it and removing it, then creating a replacement. Persistent storage controls what survives that replacement.
## Restarting is not deleting
The writable layer belongs to a particular container. Stop/start or restart preserves it; removal discards it. Data stored in a mounted named volume lives outside that layer. Replacing the container can therefore preserve database files when the replacement mounts the same volume at the correct data path. Persistence does not mean that the running database needs no crash recovery or that files can be moved between incompatible database versions.
## A named volume is managed storage
For the default local volume driver, Docker manages persistent storage on its engine host. On Docker Desktop that host may be a Linux VM, rather than an ordinary visible Windows folder. A new container reuses the data only if it mounts the intended volume and data-directory path. A different Compose project name can create a different volume, so naming and configuration matter as much as declaring volumes in YAML.
## Worked example: a PostgreSQL 15 demo
Supply POSTGRES_PASSWORD locally, for example through an ignored .env file. This example deliberately pins PostgreSQL 15, whose data-directory mount is shown below:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    ports:
      - "127.0.0.1:5332:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

A restart of db keeps its data. Ordinary compose down removes the containers but retains this named volume, so the same project can reattach it on the next up. Initialization variables create credentials only for an empty data directory; they do not reset an existing database. Check the official image documentation before changing major versions because data-directory layout and upgrade requirements can differ.
## Persistence is not a backup
A volume preserves storage across container replacement; it does not create an independent recoverable copy. Removing the project volume with down -v can delete those files. Host storage failure or accidental SQL changes can also affect them. Maintain separate database backups and test restoring them. Keeping one persistent volume and keeping a recoverable backup solve different problems.
## Practical exercise
Which operation threatens data stored only in the container layer: restarting the same container or removing it?

**Answer:** Removing it. A correctly mounted named volume can survive removal, but removing that volume is a separate operation. Inspect the actual volume configuration when a recreated database appears empty.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
