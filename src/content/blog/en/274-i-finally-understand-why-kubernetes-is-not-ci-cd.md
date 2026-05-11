---
title: "I Finally Understand Why Kubernetes Is Not CI/CD"
description: "A conceptual deep dive into the fundamental difference between container orchestration and the automation pipelines that deliver code."
pubDate: 2026-10-18T01:48:00.000Z
translationKey: 274-i-finally-understand-why-kubernetes-is-not-ci-cd
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

For a long time, I felt confused when people mentioned 'Kubernetes' and 'CI/CD' in the same breath. It seemed like they were doing the same thing: automating the movement of code from a developer's laptop to a server. I used to think that if I had a K8s cluster, I had a deployment system. But the realization is simple: Kubernetes is the destination, while CI/CD is the journey.

## The Orchestration vs. Automation Gap
Kubernetes is a container orchestrator. Its job is to manage the state of your application—ensuring that three replicas of a pod are running, handling load balancing, and restarting crashed containers. It doesn't know how to compile Java code, run JUnit tests, or trigger a build when you push to GitHub. That is where CI/CD comes in. Continuous Integration (CI) builds and tests the code; Continuous Deployment (CD) tells Kubernetes to update the image version.

## A Hypothetical Procurement Workflow
Imagine a procurement app where a requester submits a purchase request. In a CI/CD world, the process looks like this:
1. **CI Phase**: A developer pushes a fix for the 'Approval' logic. Jenkins or GitHub Actions runs tests and builds a Docker image: `procurement-app:v2`.
2. **CD Phase**: The pipeline updates the Kubernetes manifest to use `v2` instead of `v1`.
3. **Kubernetes Phase**: K8s sees the change, performs a rolling update, and ensures the 'Buyer' and 'Manager' services remain available during the transition.

## The Common Misconception
Many beginners try to use Kubernetes 'Jobs' or internal scripts to handle their builds. This is a mistake because K8s is designed for long-running services or specific tasks, not for the complex lifecycle of a build pipeline (source → build → test → scan → deploy).

**Wrong Approach**: Running a shell script inside a Pod to `git pull` and `mvn package` every hour.
**Correct Approach**: Using a dedicated CI tool to build the image and then using `kubectl set image` or Helm to update the cluster.

## Practical Exercise
If you have a pipeline that fails during the 'Unit Test' stage, is this a Kubernetes failure or a CI failure?

**Answer**: It is a CI failure. Kubernetes never even receives the new image because the pipeline stopped before the deployment phase.
