---
title: "Use Consistent Hashing to Reduce Partition Movement"
description: "A deep dive into hash rings and virtual nodes to minimize cache misses during cluster scaling."
pubDate: 2026-10-08T14:48:00.000Z
translationKey: 217-what-is-consistent-hashing
seriesOrder: 47
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## The Problem with Modulo Hashing

For modulo routing hash(key) % N, changing three nodes to four changes many assignments. With uniform hashes and the same node ordering, about three quarters of keys move, not literally all of them. Losing those warm cache placements can increase backend work; the size of that surge depends on traffic, TTLs and miss handling. Consistent hashing aims to limit reassignment when membership changes.
## The Consistent Hashing Mechanism

Consistent hashing solves this by decoupling the number of nodes from the mapping logic. Instead of a linear array, we treat the hash space as a circular ring (the Hash Ring). 

1. **The Ring**: Imagine a range of integers from 0 to 2³² − 1. The end wraps around to the beginning.
2. **Node Placement**: Each cache node is hashed based on its identifier (e.g., IP address) and placed at a specific point on this ring.
3. **Key Mapping**: To find which node owns a key, you hash the key to a position on the ring and move clockwise until you encounter the first node. That node is the owner.

## Addressing Hotspots with Virtual Nodes

If you only place one point per physical node, the segments of the ring (the intervals) will be uneven. One node might end up responsible for 60% of the keys, while another handles 10%. 

To fix this, we use **Virtual Nodes (vnodes)**. Instead of placing `Node A` once, we place it 100 times using different seeds (e.g., `hash("NodeA-1")`, `hash("NodeA-2")`). This interleaves the nodes across the ring, ensuring that if a node is added or removed, the load is redistributed evenly across all remaining nodes rather than just shifting one large block to a single neighbor.

## Worked Example: Scaling a Thumbnail Cache

Consider a simplified ring with a range of 0-1000. We have 3 nodes placed at the following positions:
- Node 1: 100
- Node 2: 400
- Node 3: 700

**Initial State Mapping:**
- Key A (Hash 50) $ightarrow$ Node 1 (Clockwise from 50 is 100)
- Key B (Hash 200) $ightarrow$ Node 2 (Clockwise from 200 is 400)
- Key C (Hash 500) $ightarrow$ Node 3 (Clockwise from 500 is 700)
- Key D (Hash 800) $ightarrow$ Node 1 (Clockwise from 800 wraps to 100)

**Adding Node 4 at Position 450:**
Now we introduce Node 4. Let's see what happens to our keys:
- Key A (50) $ightarrow$ Still Node 1
- Key B (200) $ightarrow$ Still Node 2
- Key C (500) $ightarrow$ Still Node 3
- Key D (800) $ightarrow$ Still Node 1

Wait, nothing moved? Let's look at a key that *would* move. 
- Key E (Hash 410): Previously, it mapped to Node 3 (700). Now, moving clockwise from 410, it hits Node 4 (450) first.

**The Moved Interval:**
Only keys in the range (400, 450] are affected. They move from Node 3 to Node 4. All other keys remain on their original nodes. In a modulo system, almost all keys would have moved; here, only 1/(N + 1) of the keys are remapped on average.

## Limitations and Trade-offs

Consistent hashing reduces movement, but it does not eliminate it. When a node fails, its entire load shifts to the next node in the ring. If you don't have enough virtual nodes, this can cause a cascading failure where the neighbor becomes overloaded and crashes, shifting the load again.

Furthermore, the client or the load balancer must be aware of the ring topology. If different clients have slightly different views of the ring (e.g., during a deployment), they will route requests to different nodes, causing cache misses.

## Exercise

**Scenario**: You have a ring (0-100) with nodes at 20, 50, and 80. You add a new node at position 60. 
1. Which node previously owned keys in the range 51-60?
2. Which node owns those keys now?
3. If a node at 50 is removed, which node inherits its keys?

**Answer**: 
1. Node 80 (it was the first node clockwise from 51-60).
2. Node 60.
3. Node 60 (or Node 80 if 60 didn't exist).


For N existing equal-capacity nodes, adding one well-distributed node moves roughly 1/(N+1) of uniformly distributed keys on average; our hand-placed toy ring moves only its particular interval. Virtual nodes improve balance probabilistically, not perfectly, and do not cure one extremely hot key. Multiple virtual positions can spread a failed physical node’s assignments across several successors. Replication and coordinated membership are separate design decisions.
