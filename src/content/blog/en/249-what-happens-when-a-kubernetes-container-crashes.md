---
title: "What Happens When a Kubernetes Container Crashes?"
description: "An exploration of the Kubernetes self-healing mechanism and how the kubelet handles container failures."
pubDate: 2026-10-17T00:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a procurement application where the 'Request Service' is running. Suddenly, a memory leak causes the container to crash. You might worry that the entire system is down, but in Kubernetes, a crash isn't the end of the story; it is the start of a recovery workflow.

## The Role of the Kubelet
When a container crashes, the first responder is the kubelet, the agent running on each node. The kubelet monitors the container runtime. If a process exits with a non-zero status, the kubelet detects this failure immediately. It doesn't guess why it happened; it simply looks at the `restartPolicy` defined in the Pod specification.

## Understanding Restart Policies
Kubernetes uses three main policies to decide the next move:
- `Always`: The container is restarted regardless of the exit code.
- `OnFailure`: Restarted only if the container exited with an error.
- `Never`: The container stays in a terminated state.

## Liveness vs. Readiness
While a crash is a hard failure, sometimes a container is 'alive' but broken (e.g., a deadlock). This is where probes come in. A Liveness Probe tells Kubernetes if the container is healthy. If the probe fails, Kubernetes kills the container and restarts it. A Readiness Probe, however, only controls whether the container receives traffic from a Service; it doesn't trigger a restart.

## Worked Example: Procurement Request Pod
Consider a Pod with this excerpt:
```yaml
spec:
  containers:
  - name: request-app
    image: procurement-req:v1
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
    restartPolicy: Always
```
If the `request-app` crashes due to a segmentation fault, the kubelet sees the process exit and restarts it. If the app freezes but stays running, the `/healthz` probe fails, and Kubernetes forces a restart to restore service.

## Common Mistake: The CrashLoopBackOff
A common error is ignoring the `CrashLoopBackOff` status. This happens when a container crashes immediately after starting. Kubernetes doesn't restart it instantly in a tight loop; it adds a delay (10s, 20s, 40s...) to prevent overloading the node.
**Correction:** Do not just keep restarting the Pod. Check the logs using `kubectl logs <pod-name>` to find the root cause (e.g., a missing environment variable).

## Practical Exercise
If a Pod has `restartPolicy: OnFailure` and the application exits with code 0 (success), will Kubernetes restart the container?

**Answer:** No, because code 0 indicates a successful completion, not a failure.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
