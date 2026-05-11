---
title: "What Are Kubernetes Pods?"
description: "A beginner's guide to understanding the smallest deployable units in Kubernetes and how they manage containers."
pubDate: 2026-10-17T01:48:00.000Z
translationKey: 250-what-are-kubernetes-pods
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a containerized application, but it needs a helper process—like a log collector or a proxy—to function correctly. If you deploy them as separate entities, they might end up on different physical servers, making communication slow and complex. This is the exact problem Kubernetes Pods solve.

## The Pod Concept
A Pod is the smallest execution unit in Kubernetes. Instead of deploying a single container directly, you wrap one or more containers into a Pod. Containers within the same Pod share the same network namespace (IP address and ports) and can share storage volumes. They behave as if they are running on the same local machine, allowing them to communicate via `localhost`.

## How Pods Work Internally
Kubernetes doesn't manage containers directly; it manages Pods. The `kubelet` agent on each node ensures that the containers described in the Pod specification are running and healthy. If a container crashes, the kubelet can restart it based on the defined restart policy. However, Pods are ephemeral; if a Pod is deleted or the node fails, the Pod is not 'repaired' but replaced by a controller.

## Practical Example: Procurement App
Consider a procurement system where a 'Request-UI' container handles the frontend and a 'Log-Sidecar' container ships logs to a central server. They must stay together to share the same log files.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: procurement-pod
spec:
  containers:
  - name: request-ui
    image: procurement-ui:v1
  - name: log-sidecar
    image: fluentd:latest
```
Outcome: Both containers start together on one node, sharing one IP. The UI writes logs to a volume, and the sidecar reads them instantly.

## Common Mistake: Overstuffing Pods
A frequent error is putting unrelated services (like a database and a frontend) in one Pod. This breaks the microservices principle. If the database needs to scale independently of the UI, they must be in separate Pods.

## Quick Exercise
If a Pod has two containers and one crashes, does the entire Pod get a new IP address when the container restarts?

**Answer:** No. The Pod's IP remains the same; only the specific failed container is restarted by the kubelet.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
