---
title: "Docker vs Kubernetes"
description: "A clear comparison between containerization and orchestration to understand how they work together in a deployment pipeline."
pubDate: 2026-10-16T23:48:00.000Z
translationKey: 248-docker-vs-kubernetes
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you have built a procurement application where a requester submits a request and a manager approves it. It works perfectly on your laptop, but when you move it to a server, it crashes because the server has a different version of Java or a missing library. This 'it works on my machine' problem is exactly why we use containers.

## The Role of Docker
Docker is a tool used to create, deploy, and run applications by using containers. Think of a container as a lightweight package that includes everything your app needs: the code, the runtime, and the system tools. In our procurement app, Docker packages the Spring Boot JAR and the JRE into a single image. This ensures that the environment is identical whether it is on a developer's laptop or a production server.

## The Role of Kubernetes
While Docker handles the individual container, Kubernetes (K8s) handles the fleet. If your procurement app becomes popular and you need ten copies of the 'Approval Service' to handle the load, managing ten separate Docker containers manually becomes a nightmare. Kubernetes is an orchestrator; it automates the deployment, scaling, and management of these containers across a cluster of servers.

## How They Work Together
It is not a matter of 'one or the other,' but rather how they complement each other. Docker builds the image and runs the container; Kubernetes decides where that container should live and ensures it stays healthy.

| Feature | Docker | Kubernetes |
| :--- | :--- | :--- |
| Primary Goal | Packaging & Isolation | Orchestration & Scaling |
| Scope | Single Container | Cluster of Containers |
| Self-healing | Basic restart policies | Advanced Pod replacement |

## A Worked Example
Suppose the 'Buyer Service' container crashes due to a memory leak. 
- **Docker alone:** The container stops. Unless you manually restart it or have a simple restart policy, the service stays down.
- **With Kubernetes:** The Kubelet detects the failure via a liveness probe. Kubernetes automatically kills the failed pod and starts a new one on a healthy node to maintain the desired state.

## Common Mistake: Confusing K8s with CI/CD
A frequent error is thinking Kubernetes is a CI/CD tool. Kubernetes does not build your code or run your tests; it only manages the resulting containers. You still need a pipeline (like GitHub Actions or Jenkins) to trigger the Docker build and then tell Kubernetes to update the image.

## Practical Exercise
**Question:** If you only have one small application and one single server, do you absolutely need Kubernetes?
**Answer:** No. Docker (or Docker Compose) is sufficient for simple, single-server setups. Kubernetes adds significant complexity that is only justified when you need high availability and multi-server scaling.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
