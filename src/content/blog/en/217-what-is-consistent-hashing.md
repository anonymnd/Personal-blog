---
title: "What Is Consistent Hashing?"
description: "A deep dive into how consistent hashing prevents massive cache misses when scaling distributed systems."
pubDate: 2026-10-15T16:48:00.000Z
translationKey: 217-what-is-consistent-hashing
locale: en
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imagine you have a procurement system where request data is cached across three servers. You use a simple modulo operation (`server = hash(key) % 3`) to distribute data. Everything works until you add a fourth server to handle more traffic. Suddenly, the formula becomes `hash(key) % 4`. Almost every single key now maps to a different server, causing a massive cache miss storm that crashes your backend database.

## The Mechanism of the Hash Ring
Consistent hashing solves this by mapping both servers and data keys onto a conceptual circle, or 'ring'. Instead of a fixed divisor, every server is assigned a position on this ring using a hash function. When a request comes in, the system hashes the key to find its position on the ring and then moves clockwise until it hits the first available server. That server is responsible for the data.

## Handling Scaling and Failures
When a new server is added, it is placed at a specific point on the ring. Only the keys that were previously mapping to the next server in the clockwise direction—and now fall behind the new server—need to be moved. Most of the data stays exactly where it is. Similarly, if a server crashes, its load shifts only to the immediate next neighbor on the ring, rather than reshuffling the entire cluster.

## Virtual Nodes for Balance
In a basic ring, servers might be unevenly spaced, leading to 'hotspots' where one server handles 70% of the traffic. To fix this, we use virtual nodes. Each physical server is hashed multiple times (e.g., `ServerA_1`, `ServerA_2`) to appear at various points around the ring. This ensures a more uniform distribution of data.

## Worked Example: Procurement Cache
Suppose we have two servers (S1, S2) and three requests: `Req_101`, `Req_102`, `Req_103`.
- **Standard Hashing**: `Req_101 % 2 = S1`, `Req_102 % 2 = S2`, `Req_103 % 2 = S1`. If we add S3, `Req_101 % 3 = S2`. Data must be moved.
- **Consistent Hashing**: `Req_101` maps to a point on the ring; the next server clockwise is S1. If S3 is added between the point of `Req_101` and S1, only `Req_101` moves to S3. `Req_102` and `Req_103` remain on their original servers.

## Common Mistake: Thinking it Eliminates Remapping
Developers often think consistent hashing means zero data movement. In reality, it *reduces* remapping from $O(n)$ to $O(k/n)$ where $k$ is the number of keys and $n$ is the number of servers. Some movement is inevitable; the goal is to minimize it.

## Practical Exercise
If you have 10 servers and add 1 more using consistent hashing, roughly what percentage of keys need to be remapped?

**Answer**: Approximately 1/11th (or ~9%) of the keys, rather than nearly 100%.
