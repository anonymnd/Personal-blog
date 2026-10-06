---
title: "A Simple Spring Boot CI/CD Pipeline"
description: "Learn how to automate the build, test, and deployment process for a Spring Boot application using a basic CI/CD workflow."
pubDate: 2026-10-16T19:48:00.000Z
translationKey: 244-a-simple-spring-boot-ci-cd-pipeline
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have finished a feature for a procurement app where a requester submits a purchase request. Now, you have to manually run `./mvnw clean package`, run tests, build a Docker image, and push it to a server. Doing this every time you change a single line of code is tedious and prone to human error.

## Understanding the CI/CD Flow
Continuous Integration (CI) is the practice of frequently merging code changes into a central repository, where automated builds and tests are run. Continuous Delivery (CD) ensures the code is always in a releasable state, while Continuous Deployment automates the actual release to production.

## The Pipeline Mechanism
When a developer pushes code to a Git repository, a webhook triggers the pipeline. The pipeline typically follows these stages:
1. **Build**: Compiling the Java code using Maven or Gradle.
2. **Test**: Running JUnit tests to ensure the procurement logic (e.g., manager approval flow) isn't broken.
3. **Package**: Creating a Docker image containing the JAR file.
4. **Deploy**: Pushing the image to a registry and updating the server or Kubernetes cluster.

## Worked Example: Procurement App Pipeline
Consider a simple `.github/workflows/main.yml` configuration excerpt:

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: ./mvnw test
      - run: ./mvnw package -DskipTests
```
Outcome: If the `test` step fails because a requester cannot submit a request, the pipeline stops immediately, preventing the broken code from reaching the server.

## Common Mistake: Hardcoding Secrets
A frequent error is putting database passwords or API keys directly in the pipeline script. This exposes credentials to anyone with repository access.

**Correction**: Use Secret Variables (e.g., GitHub Secrets). Reference them as `${{ secrets.DB_PASSWORD }}` in your YAML file to keep them encrypted.

## Practical Exercise
If your pipeline successfully builds the JAR but the application fails to start in the production container due to a missing environment variable, which part of the pipeline failed to catch this?

**Answer**: The pipeline caught the build/test phase, but the issue is a configuration gap. This highlights why adding a 'Smoke Test' or 'Integration Test' stage after deployment is essential.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
