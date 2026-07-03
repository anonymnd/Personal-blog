---
title: "Use Messaging and Kafka When Work Must Survive the Request"
description: "Learn to decouple critical workflows using Kafka, focusing on the Outbox pattern, partition ordering, and idempotency to ensure reliable label printing and analytics."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 226-what-is-kafka
seriesOrder: 51
locale: en
tags: ["system-design","learning-series"]
draft: false
---

## Synchronous vs. Asynchronous Trade-offs

When a client sends a request to an API, the server has two choices: complete all side effects before responding (Synchronous) or acknowledge receipt and process the work later (Asynchronous).

In a synchronous flow, if the label printing service is down, the entire order request fails, even though the order was successfully saved to the database. This creates tight coupling where the availability of the system is the product of the availability of every single dependency.

Asynchronous communication via a message broker like Kafka breaks this chain. The API saves the order and produces a message. The API can then return a `202 Accepted` to the client. The label printer and analytics engine consume this message at their own pace. If the printer is offline for ten minutes, the messages simply queue up in Kafka; they are not lost, and the customer's order process is not blocked.

## Broker Roles: Kafka vs. Database vs. Cache

A relational database is useful for current state, transactions and queries; a database-backed work queue can also be a valid design at suitable scale. Polling costs and contention need measurement, not blanket dismissal. Redis pub/sub is transient; other Redis data structures have different persistence and delivery features.

Kafka provides partitioned logs with replay and consumer groups. It does not replace the order database or automatically make every event durable forever. Configure replication, acknowledgements, retention and consumer recovery. Separate label-printing and analytics consumer groups when each must see every event.
## Kafka Core Mechanisms

Each partition has ordered records with offsets. A committed consumer-group offset normally identifies the next record to consume, not proof that every external side effect completed. Within a conventional group, a partition is assigned to one consumer at a time, but retries, rebalances and crashes can still repeat processing.

A stable order_id key and partitioning strategy place one order’s events together; changing partition count or routing needs care. Log order is not automatically completion order if handlers process asynchronously. Keying alone also cannot fix business events emitted out of order by producers.
## Ensuring Reliability: The Outbox Pattern and Idempotency

Commit the order and an outbox row in the same SQL transaction. A relay publishes the row with a stable event_id and marks progress only after the configured broker acknowledgement. This makes publication recoverable, not guaranteed without a functioning relay, retained data and retry policy. A crash after publish can cause duplicate publication.

| Failure point | Recovery requirement |
| --- | --- |
| Before SQL commit | Neither order nor outbox row persists |
| After commit, before relay publish | Relay retries the retained outbox row |
| After publish, before relay acknowledgement | Duplicate event may be published |
| After external print, before local receipt | Outcome may be uncertain; printer-side idempotency is needed |

For an internal analytics update, insert an event_id into a uniquely constrained processed-events table and apply the counter update in the same database transaction. A separate check-then-act sequence is racy. Commit the Kafka offset only after that transaction succeeds.

Printing is an external physical effect. Checking processed_events, printing, then saving a marker is not safe: the process can crash after printing, and retry prints again. Marking before printing instead risks never printing. Send a stable idempotency key to a label service that durably deduplicates and exposes job status, or design a reconciliation/manual-review flow for uncertain outcomes. Without cooperation from the external system, do not promise exactly one physical print. The outbox solves SQL-to-event coordination; it does not solve every downstream side effect.
## Exercise

With three partitions and four consumers in one conventional group, at most three consumers receive partition assignments; actual busy consumers depend on available records. A and C in the same partition have a defined log order, but processing completes in that order only when the handler preserves it.

Kafka transactions can coordinate supported Kafka reads and writes under their documented semantics. They do not automatically include a printer or an arbitrary external database. Identify the transaction boundary and crash windows before claiming exactly-once business outcomes.
