---
title: "Where Kubernetes Fits Into CI/CD"
description: "Understand the specific role of Kubernetes as the orchestration target within a Continuous Integration and Continuous Deployment pipeline."
pubDate: 2026-10-16T21:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers mistakenly believe that Kubernetes is a CI/CD tool. They imagine that installing a cluster automatically handles their code testing and deployment. In reality, Kubernetes is the destination, not the vehicle. The confusion usually stems from the fact that Kubernetes manages the lifecycle of an application, but it doesn't know how to compile your Java code or run your unit tests.

## The Pipeline Flow
In a standard workflow, the process starts with Git. When a developer pushes code, a CI tool (like Jenkins or GitHub Actions) triggers. This tool builds the application and packages it into a Docker image. Once the image is pushed to a registry, the CD part begins. This is where Kubernetes enters the picture. The CD tool tells Kubernetes: "Update the deployment to use version 2.0 of this image." Kubernetes then handles the rollout across the cluster.

## Orchestration vs. Automation
While CI/CD tools automate the movement of code, Kubernetes orchestrates the workload. For example, in a procurement app, the 'Requester' service might be scaled to three replicas. If one pod crashes, the kubelet restarts it based on the restart policy. This is self-healing, but it is not 'CI/CD'—it is operational stability.

## Worked Example: Procurement App Update
Imagine updating the 'Approval' service in a procurement system. 
1. **CI Phase**: Code is pushed → Tests pass → Docker image `procurement-approval:v2` is created.
2. **CD Phase**: The pipeline updates the Kubernetes manifest:
```yaml
spec:
  template:
    spec:
      containers:
      - name: approval-service
        image: procurement-approval:v2
```
3. **K8s Action**: Kubernetes performs a rolling update, replacing v1 pods with v2 pods one by one to ensure zero downtime.

## Common Mistake: Confusing Liveness with CI
A common error is thinking that a Liveness Probe fixes bugs. If your code has a null pointer exception, a Liveness Probe will restart the container, but the bug remains. CI is for catching the bug; Kubernetes is for keeping the app running despite the crash.

## Practical Exercise
If a CI pipeline successfully builds a Docker image but the application fails to start in Kubernetes due to a wrong environment variable, which part of the pipeline failed?

**Answer**: The CD/Deployment phase (or the configuration management), because the artifact was built correctly, but the orchestration target was misconfigured.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
