---
title: "How Your Code Goes From Laptop to Server"
description: "A beginner's guide to the journey of source code from a local development environment to a live production server."
pubDate: 2026-10-16T10:48:00.000Z
translationKey: 235-how-your-code-goes-from-laptop-to-server
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you have finished a new feature for a procurement app where a manager can approve a purchase request. It works perfectly on your laptop, but how does it actually reach the thousands of users online? This transition is not a simple copy-paste; it is a structured pipeline called CI/CD.

## The Version Control Starting Point
Everything begins with Git. You don't send files via email; you commit changes to a local repository. When you push these changes to a remote service like GitHub, you aren't just storing code—you are triggering a signal. This push is the catalyst that tells the automation server that new code is ready for evaluation.

## CI: Continuous Integration
Once the code is pushed, the CI pipeline takes over. It automatically pulls the code, compiles it, and runs a suite of tests. For our procurement app, the CI server checks if the 'approve' button logic still works and doesn't break the 'request' flow. If a test fails, the pipeline stops immediately, preventing broken code from moving forward.

## CD: Delivery vs. Deployment
Continuous Delivery ensures the code is always in a 'releasable' state, meaning it's packaged and ready, but a human usually clicks a button to push it to production. Continuous Deployment goes a step further: if the tests pass, the code is automatically deployed to the server without manual intervention.

## Packaging and Orchestration
To ensure the code runs the same on the server as it did on your laptop, we use Docker to package the app into a container. Kubernetes then orchestrates these containers. If a container crashes, the kubelet on the node notices and restarts it based on the restart policy. This 'self-healing' ensures the procurement app stays online even if a specific process fails.

## Common Mistake: Confusing CI with Deployment
Many beginners think the CI tool (like Jenkins or GitHub Actions) is the one that 'runs' the app. In reality, the CI tool only manages the flow. The actual execution happens inside a container managed by an orchestrator like Kubernetes.

## Practical Exercise
**Scenario:** You pushed code, the build passed, but the app is not appearing on the server. Which part of the pipeline should you check first?

**Answer:** Check the Deployment stage or the Kubernetes pod status to see if the new container failed to start or if the manual release trigger was missed.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
