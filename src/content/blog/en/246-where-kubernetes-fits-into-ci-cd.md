---
title: "Place Kubernetes in the Deployment Architecture"
description: "Distinguishing container packaging from orchestration and implementing a stateless map-tile API deployment with Services."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
seriesOrder: 55
locale: en
tags: ["deployment-devops","learning-series"]
draft: false
---

## Orchestration vs. Packaging

A common point of confusion in modern pipelines is the distinction between Docker and Kubernetes. Docker is a packaging tool; it creates an immutable image containing the application code, runtime, and dependencies. Kubernetes, however, is an orchestrator. It does not build your code or run your tests—that is the role of the CI pipeline. Instead, Kubernetes takes the image produced by the pipeline and manages its lifecycle across a cluster of machines.

The hand-off occurs when the CI/CD pipeline pushes a declarative configuration (usually YAML) to the Kubernetes API. The pipeline tells Kubernetes: "Ensure this specific version of the image is running with these resource limits." Kubernetes then works to reconcile the current state of the cluster with that desired state.

## The Stateless Map-Tile API Scenario

The map-tile API aims for three replicas. A Deployment manages rollout through ReplicaSets; the ReplicaSet controller creates replacement Pods, the scheduler places them on eligible nodes, and kubelets run their containers. Desired replicas are a target, not a guarantee of three available instances during failures or insufficient capacity.

A normal ClusterIP Service offers stable discovery and routes through ready endpoints matching its selector. Pods can receive different addresses when replaced; clients should not depend on individual Pod IPs. The Service is internal by default and does not alone expose the application to the public internet. Readiness and rollout settings need separate configuration. Identical baked-in read-only tiles can be local to every image; mutable or nonreplicated local state requires an explicit storage design.
## Worked Artifact: Declarative Configuration

Below is the configuration for the map-tile API. This YAML is what the pipeline would apply to the cluster.

```yaml
# illustrative-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: map-tile-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: map-tiles
  template:
    metadata:
      labels:
        app: map-tiles
    spec:
      containers:
      - name: tile-server
        image: registry.example.com/map-tile-api:v1.2.0
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: map-tile-service
spec:
  selector:
    app: map-tiles
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

### Analysis of the Outcome
1. **Desired state:** replicas: 3 requests three replicas; availability depends on successful scheduling, startup and readiness.
2. **Decoupling**: The Service `map-tile-service` targets any Pod with the label `app: map-tiles`. If the Deployment replaces a Pod during an update, the Service automatically updates its list of endpoints without the client ever knowing the backend IP changed.
3. **Traffic Flow**: Client → `map-tile-service` (Port 80) → Random Pod (Port 8080).

## Failure Cases and Constraints

- **Image Pull Failure**: If the pipeline pushes a config referencing an image tag that doesn't exist in the registry, the Pods will enter an `ImagePullBackOff` state. The orchestrator cannot fix a missing artifact; it can only restart the attempt.
- **Resource Exhaustion**: If the cluster lacks sufficient CPU/RAM to host three replicas, some Pods will remain in `Pending` state. The Deployment controller knows it *should* have three, but the scheduler cannot find a place to put them.
- **State design:** local mutable state is not shared automatically. Identical read-only tiles packaged in every image can be served locally; mutable tiles need explicit synchronization or shared storage.

## Exercise

Change spec.replicas to 5 and the container image reference to the reviewed new version, preferably its digest. Deployment then reconciles the new replica target and rollout. The default RollingUpdate settings do not universally mean replacing exactly one Pod at a time or retaining exactly three ready replicas. Availability depends on maxUnavailable, maxSurge, readiness, capacity and concurrent failures.

Add an application readiness probe and suitable resource requests before relying on traffic handover. Observe rollout status, ready endpoints and error rates. A failed rollout may stall rather than automatically roll back, so keep a deliberate recovery procedure. The YAML is a minimal structural example, not a complete production manifest.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
