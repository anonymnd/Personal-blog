---
title: "Liveness Probe vs Readiness Probe"
description: "Learn how to distinguish between health checks that restart containers and those that manage traffic flow in Kubernetes."
pubDate: 2026-10-17T02:48:00.000Z
translationKey: 251-liveness-probe-vs-readiness-probe
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application where the 'Approval Service' suddenly freezes due to a deadlock. The process is still running, so Kubernetes thinks the Pod is healthy, but no manager can approve any requests. This is where probes come in to prevent 'silent failures'.

## Understanding the Liveness Probe
A Liveness Probe tells the kubelet if the container is still alive. If the probe fails, Kubernetes kills the container and starts a new one based on the restart policy. It is designed to recover from states where the application is stuck or crashed internally but the process hasn't exited.

## Understanding the Readiness Probe
A Readiness Probe determines if a container is ready to accept network traffic. If it fails, the Pod is not removed from the cluster, but it is removed from the Service's endpoints. This is crucial when an app is loading a large cache or waiting for a database connection during startup.

## Practical Example: Procurement App
Consider a service that handles purchase orders. We define both probes in the YAML:

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 15
```

**Outcome:** If the app is still loading its procurement rules from the DB, `/health/ready` returns 503. The Service stops sending requests to this Pod, preventing users from seeing errors. Once loaded, it returns 200 and traffic flows. If the app later deadlocks, `/health/live` fails, and Kubernetes restarts the Pod.

## Common Mistake: The Same Endpoint
A frequent error is using the same `/health` endpoint for both probes. If your database goes down temporarily, the Readiness probe should fail (stop traffic), but the Liveness probe should stay healthy. If Liveness also fails, Kubernetes will restart the container in a loop, which won't fix the database and adds unnecessary load to the cluster.

## Quick Exercise
Scenario: Your app takes 30 seconds to start. You set a Liveness probe with `initialDelaySeconds: 5`. What happens?

**Answer:** The Liveness probe will fail before the app is ready, causing Kubernetes to restart the container repeatedly in a crash loop.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
