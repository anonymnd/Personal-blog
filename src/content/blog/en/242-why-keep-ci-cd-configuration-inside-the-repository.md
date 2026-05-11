---
title: "Why Keep CI/CD Configuration Inside the Repository?"
description: "An exploration of the 'Pipeline as Code' approach and why storing deployment logic with your source code ensures consistency and reliability."
pubDate: 2026-10-16T17:48:00.000Z
translationKey: 242-why-keep-ci-cd-configuration-inside-the-repository
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement app where a requester submits a purchase request. Everything works on your machine, but when you push to production, the build fails because the server is using an outdated version of Java or a missing environment variable. You spend hours hunting for which hidden settings in a UI-based CI tool caused the crash. This is the 'black box' problem of external configuration.

## The Concept of Pipeline as Code
Storing your CI/CD configuration (like `.github/workflows/main.yml` or `.gitlab-ci.yml`) inside the repository transforms your deployment process into 'Pipeline as Code'. Instead of clicking buttons in a web interface to define build steps, you write a declarative file. This means the instructions on how to build, test, and deploy the procurement app live right next to the Java code that defines the business logic.

## Versioning and Synchronization
When configuration is in the repo, the pipeline evolves with the feature. If you upgrade your procurement app to use Jakarta EE 10, you can update the build script in the same commit. When a developer switches to an older git branch to fix a bug, the CI/CD configuration reverts automatically to the version that worked with that old code. This prevents the common disaster where a new pipeline configuration breaks the build for an older, stable release branch.

## Transparency and Peer Review
Since the pipeline is just another file, it undergoes the same Pull Request (PR) process as your application code. If a teammate changes the deployment target from a staging server to a production cluster, you will see it in the diff. This eliminates 'shadow changes' where a DevOps engineer modifies a setting in a UI, and no one knows why the deployment behavior suddenly changed.

## Worked Example: The Procurement Pipeline
Consider a simple YAML excerpt for a build trigger:

```yaml
# Illustrative excerpt of a CI config
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: mvn clean verify
```
Outcome: Every push triggers this exact sequence. If the `mvn verify` step fails, the pipeline stops, ensuring the procurement app's approval logic is tested before any deployment happens.

## Common Mistake: Hardcoding Secrets
A frequent error is putting API keys or database passwords directly into the repository's YAML file for convenience. 
**Correction:** Use the CI tool's 'Secrets' or 'Variables' store. Reference them in the code as `${{ secrets.DB_PASSWORD }}`. This keeps the logic in the repo but the sensitive data secure.

## Practical Exercise
If you move a project from one Git provider to another, why is having the configuration in the repo helpful?

**Answer:** It provides a documented blueprint of the build requirements (JDK version, test commands), making it significantly easier to recreate the pipeline in the new system.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
