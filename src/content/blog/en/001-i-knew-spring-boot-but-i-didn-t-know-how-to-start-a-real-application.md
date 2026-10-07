---
title: "From a Blank Project to a First Working Feature"
description: "Build a one-page delivery plan around evidence, explicit assumptions and a demonstrable first feature."
pubDate: 2026-10-06T16:48:00.000Z
translationKey: 001-i-knew-spring-boot-but-i-didn-t-know-how-to-start-a-real-application
seriesOrder: 1
locale: en
tags: ["engineering-foundations","learning-series"]
draft: false
---

Knowing how to start Spring Boot answers a technical question: how do I run this framework? Starting an application answers a different question: what useful outcome should I demonstrate, and what do I need to learn before committing to a design? A blank project becomes manageable when you make those decisions explicit.

## Define an outcome small enough to demonstrate

A community repair shop wants appointment bookings. The initial description sounds like a calendar, customer accounts, reminders, payments and staff scheduling. That is a collection of possibilities, not a first delivery.

For a first demonstration, choose this outcome: a visitor submits a proposed repair appointment and receives a reference number; a volunteer can see that request. The reference acknowledges receipt, not a guaranteed time slot. Staff still confirm appointments manually. That distinction prevents a small prototype from promising a scheduling system it does not have.

Payments, automatic slot allocation and account recovery are outside this slice. Write that down. Excluding them is a delivery decision for this iteration, not a claim that they never matter.

## Separate facts, assumptions and unknowns

Before designing tables, make a short discovery note:

| Kind | Statement | Next action |
| --- | --- | --- |
| Confirmed | Volunteers need the item description and contact details | Include those in the demonstration |
| Assumption | Visitors accept manual confirmation | Ask the shop owner and a potential visitor |
| Unknown | Several volunteers might accept the same request | Observe the current handoff before designing allocation |
| Constraint | Real customer details must not appear in the public demo | Use fictional examples for the demonstration |

An assumption is not automatically a requirement. If the owner says visitors require immediate confirmed slots, the proposed slice must change. Discover that before spending a week on an unsuitable screen.

## Make success observable

Use acceptance examples that a person can check:

* A submission containing contact details, an item description and a future proposed date receives a reference and appears in the volunteer view.
* A missing item description is rejected with an understandable message, and no incomplete request is added.
* The acknowledgement says that confirmation is still required.
* After restarting the demonstration application, a previously acknowledged request remains available.

These examples define observable behavior. They do not dictate a framework, table layout or HTTP status. Those choices belong to later design work. Passing the examples also does not establish that the application is ready for public production use.

## Investigate the uncertainty that could change the plan

A spike is a small experiment with a question and a stopping condition. Here, the significant uncertainty is whether manual confirmation satisfies the shop's actual process. Show a paper acknowledgement and volunteer list before implementing either. If that interaction is acceptable, a separate short technical spike can verify the chosen hosting environment can persist a request across a restart.

Do not label several days of general framework experimentation a spike. Decide what evidence you need, collect it, and record the result. Discard prototype code when carrying it forward would make the real implementation harder to understand.

## Deliver an end-to-end slice and review it

The first slice crosses the whole path: visitor input, application decision, durable storage, acknowledgement and volunteer retrieval. A complete persistence layer with no usable visitor flow is not this outcome. Equally, a polished form with no durable result does not satisfy the restart example.

The one-page delivery plan is therefore: confirm the manual workflow, prove the risky persistence assumption, implement the minimal submission path, demonstrate the acceptance examples, then collect feedback. During the demonstration, ask whether the reference and volunteer list support the shop's work. Record changes rather than defending the first design.

Architecture decisions should be proportional to known risks. A single application can be enough initially; a required privacy boundary or unavailable hosting capability might demand an earlier structural decision. Neither exhaustive design nor immediate coding is a universal answer.

## Exercise: choose the next slice by evidence

The owner now reports that visitors repeatedly call to ask whether an appointment was confirmed. Should the next iteration add online payments, an automated scheduling engine or a way to check confirmation?

**Check:** Start by investigating the confirmation problem. A small status lookup might solve it, but confirm who can access it and what information it may reveal. Write an acceptance example for an acknowledged request becoming confirmed before deciding the implementation. The next feature follows an observed need, not the most attractive technology.
