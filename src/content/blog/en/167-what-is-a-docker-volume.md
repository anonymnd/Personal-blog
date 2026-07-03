---
title: "Persist Container Data Safely with Volumes and Backups"
description: "A deep dive into the lifecycle of PostgreSQL data in Docker, distinguishing between container restarts, replacements, and volume destruction."
pubDate: 2026-10-08T05:48:00.000Z
translationKey: 167-what-is-a-docker-volume
seriesOrder: 38
locale: en
tags: ["docker","learning-series"]
draft: false
---

## The Writable Layer vs. Persistent Volumes

When a container runs, it creates a thin writable layer on top of the read-only image. Any data written here—such as PostgreSQL logs or temporary files—exists only as long as that specific container instance exists. If you stop and start a container, the writable layer remains. However, if you remove the container (`docker rm`) or recreate it via Compose, that layer is destroyed, and your database is wiped.

To prevent data loss, we use **Named Volumes**. A volume is a directory managed by Docker on the host filesystem that is mounted into the container. Unlike the writable layer, a named volume exists independently of the container lifecycle.

## Worked Scenario: PostgreSQL 15 Data Lifecycle

In PostgreSQL 15, the data resides at `/var/lib/postgresql/data`. We will examine three different state-change scenarios using a named volume called `pgdata`.

### The Setup (Illustrative)
```yaml
services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: securepassword

volumes:
  pgdata:
```

### Scenario 1: The Restart
**Action:** `docker compose stop` followed by `docker compose start`.
**Result:** The container process is stopped and restarted. The writable layer and the volume both persist. Data is safe.

### Scenario 2: The Replacement
**Action:** `docker compose up -d` after changing an environment variable or updating the image version.
**Result:** Docker destroys the old container and creates a new one. The writable layer is gone, but the new container mounts the existing `pgdata` volume. PostgreSQL finds its data files at `/var/lib/postgresql/data` and resumes exactly where it left off.

### Scenario 3: The Destruction
**Action:** `docker compose down -v`.
**Result:** The `-v` (or `--volumes`) flag explicitly tells Docker to remove named volumes defined in the Compose file. The `pgdata` volume is deleted from the host. Even if you run `up` again, the database starts empty because the source of truth was destroyed.

## Backups and Restore Verification

A named volume is live storage, not a second copy or a recovery history. Table deletion and corruption affect that stored data. Use a database-aware backup strategy and verify restoration. The following plain-text dump and restore examples use Compose service names, a POSIX shell, and an existing my_catalog database. Do not allocate a TTY for redirected dump output.

```bash
docker compose exec -T db pg_dump -U postgres my_catalog > catalog_backup.sql
# Against a separate, disposable restore Compose project:
docker compose -p restore -f compose.restore.yml exec -T db \
  psql -U postgres -d my_catalog -v ON_ERROR_STOP=1 < catalog_backup.sql
```

Configure the restore project with a different volume and create the empty target database first. Check command exit status, representative rows, constraints and application reads; matching one row count is insufficient. pg_dump covers one database, not all cluster roles or every operational recovery need.
## Exercise

**Question:** You have a production database using a named volume. You run `docker compose down` (without the `-v` flag), update the image to a newer minor version, and run `docker compose up -d`. Will your data be present? If you then run `docker compose down -v`, what happens to the data?

**Answer:** Yes, the data will be present because `docker compose down` preserves named volumes; the new container will simply re-mount the existing volume. However, running `docker compose down -v` will permanently delete the named volume from the host, resulting in total data loss.

Keep the same Compose project and volume identity when testing recreation. Stop/start terminates and starts the process; it is not pause/unpause. PostgreSQL major-version upgrades need a supported migration rather than simply mounting an old data directory in a newer major image. External volumes are not removed by Compose down -v.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
