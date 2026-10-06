---
title: "What Does docker exec -it Do?"
description: "A deep dive into accessing a running container's shell to debug and manage internal processes."
pubDate: 2026-10-13T18:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application running in a container. The requester has submitted a request, but the manager's approval isn't triggering. You check the logs, but they are too generic. You need to go 'inside' the running container to check if a specific configuration file exists or to test a database connection from the container's own perspective. This is where `docker exec -it` becomes essential.

## The Mechanism of exec
Unlike `docker run`, which creates a brand new container from an image, `docker exec` allows you to run a new command inside a container that is already active. It leverages the host's ability to enter the container's isolated namespaces (process, network, and mount).

## Breaking Down the -it Flags
The `-i` (interactive) flag keeps the standard input (STDIN) open even if not attached. The `-t` (tty) flag allocates a pseudo-terminal, which makes the session behave like a real terminal window, providing a command prompt and colorized output. Without these, you could run a command, but you couldn't interact with a shell like Bash or Sh.

## Worked Example: Debugging the Procurement App
Suppose your procurement container is named `procurement-app`. You want to check the internal logs of the application engine located at `/var/log/app.log`.

```bash
# Access the container with a bash shell
docker exec -it procurement-app /bin/bash

# Now inside the container:
root@a1b2c3d4e5f6:/# cat /var/log/app.log
# [LOG]: Connection to DB failed at 10.0.0.5
exit
```
Outcome: You successfully entered the environment, identified a network failure, and exited back to your host machine.

## Common Mistake: exec vs run
A frequent error is using `docker run -it image /bin/bash` when you actually want to debug a running service. `docker run` starts a *second* instance of the app, which won't have the current state or the specific logs of the failing container. Always use `exec` for existing containers.

## Practical Exercise
How would you run the `ls -la` command inside a container named `buyer-service` without entering an interactive shell session?

**Answer:** `docker exec buyer-service ls -la`. (The `-it` is not needed for a single non-interactive command).

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
