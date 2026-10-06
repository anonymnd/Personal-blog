---
title: "Functional vs Non-Functional Requirements"
description: "Learn how to distinguish between what a system does and how it performs to avoid costly architectural mistakes."
pubDate: 2026-10-07T10:48:00.000Z
translationKey: 019-functional-vs-non-functional-requirements
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imagine you are building a procurement app. You start coding the 'Submit Request' button immediately, but halfway through, you realize the system crashes when ten managers approve requests simultaneously, or that the buyer cannot see requests from other departments. This happens because you focused only on the 'what' and ignored the 'how'.

## Defining Functional Requirements
Functional requirements describe the specific behavior of the system. They define the interactions between an actor (an external role like a 'Requester') and the system. A functional requirement must cover the 'happy path' (success) and the 'unhappy path' (errors). For example, a requester should be able to submit a purchase request, but the system must reject the request if the budget field is empty.

## Defining Non-Functional Requirements
Non-functional requirements (NFRs) act as constraints on the system. They don't describe a specific feature but rather the quality of the service. These must be measurable. Instead of saying 'the app should be fast', an NFR states 'the approval screen must load within 2 seconds for up to 100 concurrent users'. Common NFRs include scalability, availability, and reliability.

## Worked Example: Procurement Workflow

| Requirement Type | Requirement Detail |
| :--- | :--- |
| Functional | A Manager can approve or reject a request submitted by a Requester. |
| Functional | The system must notify the Buyer via email once a request is approved. |
| Functional | The system must ensure only users with the 'Manager' role can access the approval dashboard (Authorization). |
| Non-Functional | The system must maintain 99.9% uptime during business hours. |

## Common Mistake: The Vague Requirement
A common error is writing a non-functional requirement as a functional one. For example: "The system should be secure." This is useless for a developer. 

**Correction:** "All request data must be encrypted using AES-256 during transit and at rest." This provides a measurable technical constraint.

## Practical Exercise
Scenario: You are adding a 'Search' feature to the procurement app.
1. Write one Functional Requirement for this feature.
2. Write one Non-Functional Requirement for this feature.

**Check:**
1. FR: The user can search for requests by Order ID.
2. NFR: Search results must return in under 500ms.
