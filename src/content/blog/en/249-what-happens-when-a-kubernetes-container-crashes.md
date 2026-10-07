---
title: "Diagnose Kubernetes Restarts and Traffic Readiness"
description: "A deep dive into the mechanics of kubelet restarts, probe interactions, and the critical distinction between traffic removal and container recycling."
pubDate: 2026-10-08T23:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
seriesOrder: 56
locale: en
tags: ["deployment-devops","learning-series"]
draft: false
---

## The Mechanics of Recovery: Kubelet vs. Controller

The kubelet is a node agent, not a control-plane controller. It restarts a container according to restartPolicy when the process exits or probes meet their failure thresholds; Always also covers successful process exits. A container restart normally keeps the existing Pod identity.

For Deployment workloads, ReplicaSet reconciliation creates replacement Pods after deletion or recognized node loss, and the scheduler chooses eligible placement. Node-loss detection and eviction take time. Replacement creates a new Pod UID and potentially another IP; StatefulSets may reuse a stable Pod name. Do not equate container restart, Pod replacement and recovery of lost application state.
## Probe Dynamics: Startup, Readiness, and Liveness

Probes are the primary mechanism for self-healing, but misconfiguring them can lead to "death spirals" where a Pod is killed just as it is about to become healthy.

1. **Startup Probe**: This disables liveness and readiness checks until the container has successfully started. It is essential for legacy applications or heavy media processors that perform cache warming or schema validation on boot.
2. **Readiness Probe**: This determines if the Pod should receive traffic from a Service. If it fails, the Pod is removed from the Endpoints list. The container continues to run, but no new requests are routed to it.
3. **Liveness Probe**: This determines if the container is in a broken state (e.g., a deadlock). If it fails, the kubelet kills the container and restarts it.

## Scenario: The Media Processor Failure

Consider a media-processing Pod that takes 60 seconds to load ML models into memory and occasionally loses connection to a remote storage bucket.

### The Harmful Configuration (The Restart Loop)
If we only use a liveness probe that checks the storage bucket connection, we create a dangerous loop:
- The Pod boots. 
- The liveness probe fails because the storage bucket is temporarily unreachable.
- Kubelet kills the container.
- The Pod restarts, spending another 60 seconds loading models, only to be killed again.

### The Correct Configuration (Traffic Isolation)
Instead, we separate the "boot" phase from the "dependency" phase.

**Worked Configuration Example (Illustrative):**
```yaml
# Snippet of a Pod spec for a media processor
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10 # Gives 300s to boot
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  periodSeconds: 20
```

**Analysis of the Outcome:**
- **During Boot**: The `startupProbe` runs. Liveness and Readiness are ignored. The Pod is not killed if it takes 2 minutes to load models.
- **Dependency Loss**: If the storage bucket goes down, the `/health/ready` endpoint returns a 500 error. The `readinessProbe` fails. Kubernetes removes the Pod from the Service. The Pod stays alive, allowing it to recover the connection without wasting time reloading models from disk.
- **Deadlock**: If the Java process freezes entirely, the `/health/live` endpoint stops responding. The `livenessProbe` fails, and the kubelet restarts the container to clear the hang.

## Failure Limits and Rollouts

Rollout settings limit planned unavailability; they do not prevent every outage caused by cluster failure, bad probes or shared dependencies. progressDeadlineSeconds can report a stalled Deployment but does not itself perform automatic rollback. Define alerts and a recovery action.

Place the probe fields beneath a container in spec.containers, not at the Pod-spec root. Readiness failure changes ready endpoints after the configured threshold and propagation; it does not guarantee immediate cancellation of existing connections or stop a background worker consuming a queue. A media worker needs its own pause/admission policy for dependency outages.
## Exercise

**Scenario**: You have a Pod that crashes every 10 minutes due to a memory leak. You implement a liveness probe that checks memory usage and restarts the Pod when it exceeds 80%. 

1. Is this a correct use of self-healing?
2. What happens to the traffic during the restart?
3. How does this differ from a Readiness probe failure?

**Answer**:
1. No. Liveness probes should detect unrecoverable states (deadlocks), not manage resource leaks. This is a "band-aid" for a bug, not true self-healing. The correct fix is adjusting memory limits or fixing the leak.
2. Traffic is cut off immediately as the container is killed, and the Pod becomes unavailable until the new container passes its readiness check.
3. A readiness failure would stop traffic but keep the process running, allowing you to exec into the Pod to debug the leak. A liveness failure destroys the evidence by restarting the process.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
