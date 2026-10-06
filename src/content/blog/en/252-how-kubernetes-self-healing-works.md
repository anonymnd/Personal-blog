---
title: "How Kubernetes Self-Healing Works"
description: "An exploration of how Kubernetes automatically detects and recovers from container failures to maintain application availability."
pubDate: 2026-10-17T03:48:00.000Z
translationKey: 252-how-kubernetes-self-healing-works
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application where the 'Request Submission' service suddenly crashes at 3 AM due to a memory leak. Without orchestration, your system stays down until an engineer manually restarts the server. This is where Kubernetes self-healing transforms operational stability by automating the recovery process.

## The Control Loop Mechanism
Kubernetes operates on a 'Desired State' model. You tell the cluster, "I want three replicas of the procurement-api," and the Control Plane continuously monitors the 'Actual State.' If a node fails or a process crashes, the reconciliation loop detects the mismatch and triggers a corrective action to bring the actual state back to the desired state.

## Liveness and Readiness Probes
Self-healing relies on health checks to know when to act. A Liveness Probe tells Kubernetes if a container is still running; if it fails, Kubernetes kills the container and restarts it. A Readiness Probe determines if the container is ready to accept traffic. If a pod is starting up or overloaded, the readiness probe fails, and Kubernetes removes it from the Service load balancer so users don't see 500 errors.

## Worked Example: The Procurement App
Consider a deployment for the `approval-service`:

```yaml
# Illustrative excerpt of a Pod spec
spec:
  containers:
  - name: approval-service
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```
If the `approval-service` enters a deadlock, the `/healthz` endpoint stops responding. After the 20-second period, the kubelet detects the failure and restarts the container automatically. The outcome is a brief flicker in availability rather than a total outage.

## Common Mistake: Confusing Liveness with Readiness
A frequent error is using the same endpoint for both probes. If your database is temporarily down, a Liveness probe failure will cause Kubernetes to restart the app repeatedly (CrashLoopBackOff), which doesn't fix the DB. Instead, use a Readiness probe for external dependencies; this keeps the app running but stops traffic until the DB returns.

## Practical Exercise
Scenario: Your pod is crashing because it takes 60 seconds to load a large cache, but the liveness probe starts checking at 5 seconds and kills it immediately. Which probe configuration should you add or modify?

Answer: You should implement a Startup Probe or increase the `initialDelaySeconds` of the Liveness probe to allow the cache to load before health checks begin.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
