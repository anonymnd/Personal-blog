---
title: "What Happens After You Push Code?"
description: "A deep dive into the automated journey from a local git push to a running container in production."
pubDate: 2026-10-16T18:48:00.000Z
translationKey: 243-what-happens-after-you-push-code
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you just finished a feature for a procurement app where a manager approves a request. You run `git push origin main`, and suddenly your code is live. For a beginner, this feels like magic, but it is actually a coordinated sequence of triggers called a CI/CD pipeline.

## The Trigger and Continuous Integration (CI)
When you push code to a remote repository like GitHub, the server sends a webhook notification to a CI tool. The CI server pulls your code and starts a 'Build' phase. It compiles the source code and runs unit tests to ensure the new approval logic doesn't break the requester's submission form. If a test fails, the pipeline stops immediately, preventing broken code from reaching the server.

## Continuous Delivery vs. Deployment
Once the build passes, the code enters the delivery phase. In Continuous Delivery, the artifact (like a JAR file) is stored in a registry, and a human manually clicks 'Deploy' to push it to production. In Continuous Deployment, this process is fully automated. If the tests pass, the code moves straight to the live environment without manual intervention.

## Packaging with Docker and Kubernetes
To ensure the app runs the same way on every machine, the pipeline packages the app into a Docker image. This image is then deployed to a Kubernetes cluster. Kubernetes doesn't build the code; it orchestrates the containers. It tells the cluster to replace the old version of the procurement app with the new image across multiple servers.

## Self-Healing and Health Checks
Once live, Kubernetes monitors the app. It uses a 'Liveness Probe' to check if the app has crashed; if it has, Kubernetes restarts the container. A 'Readiness Probe' ensures the app is fully started before sending user traffic to it. This prevents users from seeing 500 errors while the app is still booting up.

## Common Mistake: Confusing CI with Orchestration
A common error is thinking Kubernetes is the tool that runs your tests. In reality, a CI tool (like Jenkins or GitHub Actions) runs the tests and builds the image, while Kubernetes only manages the running container.

## Practical Exercise
If a Liveness Probe fails repeatedly for a pod in your procurement app, what does Kubernetes do?

**Answer:** It will restart the container based on the defined restart policy to attempt to recover the service.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
