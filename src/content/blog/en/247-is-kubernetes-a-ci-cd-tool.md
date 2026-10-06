---
title: "Is Kubernetes a CI/CD Tool?"
description: "Clarifying the fundamental difference between container orchestration and the automation pipelines used for continuous integration and delivery."
pubDate: 2026-10-16T22:48:00.000Z
translationKey: 247-is-kubernetes-a-ci-cd-tool
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a procurement application where a requester submits a purchase request and a manager approves it. You have successfully packaged this app into a Docker image. Now, you face a dilemma: you hear people talking about Kubernetes and CI/CD in the same breath, leading you to wonder if installing Kubernetes is enough to automate your entire release process.

## The Core Distinction
Kubernetes is not a CI/CD tool; it is a container orchestrator. While CI/CD tools focus on the *journey* of the code from a developer's laptop to the server, Kubernetes focuses on the *destination*. It manages where the containers run, how they scale, and how they restart if they crash. It does not know how to run your unit tests, compile your Java code, or trigger a build when you push to GitHub.

## How the Workflow Actually Fits
In a real-world procurement app pipeline, the roles are split. A CI tool (like Jenkins or GitHub Actions) handles the build and test phase. A CD tool then tells Kubernetes to update the deployment to a new image version. 

| Feature | CI/CD Tool | Kubernetes |
| :--- | :--- | :--- |
| Primary Goal | Automation of pipeline | Management of workloads |
| Action | Builds, Tests, Deploys | Schedules, Scales, Heals |
| Trigger | Git Push / Merge | API Request / Controller |

## A Worked Example: The Deployment Trigger
Suppose your procurement app is running in a Pod. To update it, you don't use Kubernetes to 'build' the app. Instead, your pipeline executes a command like this:

```bash
# The CI tool builds the image and pushes it to a registry
docker build -t procurement-app:v2 .
docker push procurement-app:v2

# The CD part tells Kubernetes to update the image
kubectl set image deployment/procurement-deploy app=procurement-app:v2
```
Outcome: Kubernetes performs a rolling update, replacing old pods with new ones without downtime.

## Common Mistake: Confusing Self-Healing with CI
A common misconception is that because Kubernetes can restart a crashed container (via Liveness Probes), it is 'fixing' the code. This is incorrect. Kubernetes provides infrastructure resilience, not bug fixing. If your procurement app has a NullPointerException, Kubernetes will restart the pod, but it will crash again. You still need a CI/CD pipeline to push a corrected version of the code.

## Practical Exercise
Scenario: You pushed a change to your GitHub repo, and the app is now running on your cluster. Which part of the process was handled by the CI/CD tool and which by Kubernetes?

**Answer:** The CI/CD tool handled the trigger, the build of the Docker image, and the command to update the cluster. Kubernetes handled the actual scheduling of the pods and ensuring the new version stayed running.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
