---
title: "Docker Image vs Container"
description: "Understand the fundamental difference between a static Docker image and a running container instance."
pubDate: 2026-10-13T09:48:00.000Z
translationKey: 162-docker-image-vs-container
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a recipe for a cake. The recipe tells you exactly what ingredients are needed and what steps to follow, but you cannot eat the recipe itself. To actually have a cake, you must follow those instructions to create a physical instance. In the world of Docker, the recipe is the Image, and the cake is the Container.

## The Static Image
An image is a read-only template. It contains everything your application needs to run: the code, the runtime, libraries, and environment variables. Images are built in layers; if you change one line of code and rebuild, Docker only updates the affected layer. Because images are immutable, they ensure that the exact same environment is deployed across development, testing, and production.

## The Living Container
A container is a runnable instance of an image. When you run `docker run`, Docker adds a thin read-write layer on top of the static image. This allows the application to write logs or create temporary files without altering the original image. While an image is stored on your disk, a container exists in memory and uses the host's Linux kernel to execute processes, making it much lighter than a Virtual Machine.

## Practical Example: Procurement App
Suppose we have a procurement app where a requester submits a purchase request. We create a `procurement-app:v1` image. 

```bash
# Build the static image
docker build -t procurement-app:v1 .

# Start two separate containers from the same image
docker run -d --name requester-instance procurement-app:v1
docker run -d --name manager-instance procurement-app:v1
```
In this scenario, both containers share the same base image, but they operate independently. If the `manager-instance` crashes, the `requester-instance` remains unaffected because they are separate running instances.

## Common Mistake: Confusing State
A frequent error is expecting data saved inside a container to persist after the container is deleted. Since the container's read-write layer is ephemeral, any file created during runtime is lost when the container is removed. To keep data, you must use volumes, as the image itself cannot be modified while running.

## Quick Exercise
If you update your application code and rebuild the image, do the currently running containers automatically update their code?

**Answer:** No. Containers are instances of the image version that existed when they were started. You must stop the old containers and start new ones using the updated image.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
