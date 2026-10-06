---
title: "Where Docker Fits Into CI/CD"
description: "Understand how Docker acts as the consistent packaging layer that bridges the gap between continuous integration and continuous deployment."
pubDate: 2026-10-16T20:48:00.000Z
translationKey: 245-where-docker-fits-into-ci-cd
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine a developer saying, "It works on my machine," but the application crashes immediately upon reaching the production server. This discrepancy usually happens because the server has a different version of Java or a missing system library. This is the exact problem Docker solves within a CI/CD pipeline.

## The Packaging Bridge
In a CI/CD workflow, Docker is not the automation tool itself (like Jenkins or GitHub Actions), but the artifact that those tools move. While CI focuses on building and testing code frequently, Docker ensures that the environment used for those tests is identical to the one used in production. Instead of deploying raw code, the pipeline builds a Docker image containing the OS, runtime, and application code.

## Mechanism in the Pipeline
1. **CI Phase**: The developer pushes code to Git. The CI server triggers a build, runs tests, and then creates a Docker image. This image is tagged with a version and pushed to a registry.
2. **CD Phase**: The deployment tool pulls that specific image and runs it as a container on the server. Because the image is immutable, there is no risk of "missing dependencies" during the rollout.

## Worked Example: Procurement App
Consider a procurement app where a requester submits a purchase request. 
- **Build**: The CI pipeline compiles the Java code and packages it into a Docker image: `procurement-app:v1.2`.
- **Test**: The pipeline starts a container from this image and runs integration tests against a database container.
- **Deploy**: Once passed, the image is deployed to production. The manager can now approve requests knowing the environment is stable.

## Common Mistake: The "Giant Image"
A frequent error is including build tools (like Maven or Gradle) inside the final production image, making it huge and insecure. 
**Correction**: Use multi-stage builds. Use one stage to compile the code and a second, slim stage to only copy the resulting JAR file into a lightweight JRE image.

## Practical Exercise
If a CI pipeline fails during the 'Test' stage, should the Docker image be pushed to the production registry?

**Answer**: No. The image should only be pushed to the registry after all tests pass to ensure only stable, verified versions reach the deployment phase.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
