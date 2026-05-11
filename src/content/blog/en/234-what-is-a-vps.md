---
title: "What Is a VPS?"
description: "A beginner-friendly guide to understanding Virtual Private Servers and how they differ from shared and dedicated hosting."
pubDate: 2026-10-16T09:48:00.000Z
translationKey: 234-what-is-a-vps
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are launching a procurement app where employees submit requests and managers approve them. At first, you use shared hosting, but as more users join, your app slows down because other websites on the same server are consuming all the RAM. You need more power, but a full dedicated server is too expensive. This is where a VPS comes in.

## The Concept of Virtualization
A Virtual Private Server (VPS) is a middle ground between shared hosting and a dedicated server. It uses a technology called a hypervisor to split one powerful physical server into multiple smaller 'virtual' servers. Although you share the physical hardware, your slice is isolated. You get your own dedicated resources (CPU, RAM) and your own operating system.

## How it Works in Practice
In a VPS, the hypervisor ensures that if another user on the same machine has a traffic spike, it doesn't crash your procurement app. You have 'root' or 'administrator' access, meaning you can install specific software, like a specific version of Java or a custom database, which is usually forbidden in shared hosting.

## Worked Example: Deploying the App
Suppose you rent a VPS with 2GB RAM and 2 vCPUs. You connect via SSH and run the following commands to set up a basic environment:

```bash
# Update the system
sudo apt update && sudo apt upgrade -y
# Install a web server
sudo apt install nginx -y
# Start the service
sudo systemctl start nginx
```
Outcome: Your procurement app is now live on a dedicated IP address. Unlike shared hosting, you can now configure the Nginx config file to optimize how requests are handled by your manager's approval dashboard.

## Common Mistake: Confusing VPS with a VM
A common error is thinking a VPS is exactly the same as any Virtual Machine (VM). While a VPS is a type of VM, in the hosting industry, 'VPS' specifically refers to a virtualized server provided as a service by a host. The mistake is assuming you manage the hypervisor; in a VPS, the provider manages the physical hardware and the hypervisor, while you manage the OS inside.

## Practical Exercise
Question: If your procurement app needs a specific Linux kernel module to handle secure file uploads, can you install it on a Shared Hosting plan or a VPS?

Answer: A VPS, because it provides root access and an isolated OS, whereas shared hosting restricts system-level changes.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
