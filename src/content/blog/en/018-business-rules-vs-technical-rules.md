---
title: "Business Rules, Technical Constraints and Quality Requirements"
description: "Learn to distinguish between domain behavior and technical constraints using a clinic appointment portal scenario."
pubDate: 2026-10-06T19:48:00.000Z
translationKey: 018-business-rules-vs-technical-rules
seriesOrder: 4
locale: en
tags: ["business-workflows","learning-series"]
draft: false
---

## The Classification Trap

A common failure in software engineering is labeling every 'rule' as a Non-Functional Requirement (NFR). If a rule defines how the business operates—such as 'a patient cannot book two appointments at the same time'—it is a Business Rule, not a technical constraint. Business rules dictate the *what* (behavior), while technical constraints and quality requirements dictate the *how* (performance, durability, and environment).

## Business Rules vs. Technical Constraints

**Business Rules** are observable behaviors. They are often expressed as logic that must be true for a transaction to be valid. They are tested via functional test cases (Given/When/Then).

**Technical Constraints** are non-negotiable boundaries. These include the required tech stack, regulatory compliance (GDPR), or hardware limitations. They are verified via audits or environment checks.

**Quality Requirements (NFRs)** are measurable attributes of the system's operation. Vague terms like "fast" or "secure" are useless; they must be translated into observable metrics.

## Worked Example: Clinic Appointment Portal

Consider a portal where patients book slots with doctors. We must translate vague stakeholder requests into a testable requirement matrix.

### Requirement Translation Matrix

| Stakeholder Request | Classification | Refined Testable Requirement | Acceptance Measure |
| :--- | :--- | :--- | :--- |
| "No double booking" | Business Rule | The system must reject a booking if the Doctor entity has an existing appointment for that slot. | Test case: Attempt to book 10:00 AM for Dr. X twice → Second attempt fails. |
| "Must be fast" | Quality (Perf) | The appointment search result must load within 2 seconds for 50 concurrent users. | Load test: 50 virtual users → 95th percentile response time ≤ 2s. |
| "Secure access" | Business Rule (Auth) | Only users with the 'Patient' role can book; only 'Admin' can cancel others' bookings. | Auth test: Patient tries to cancel Admin's slot → 403 Forbidden. |
| "Data must be safe" | Quality (Durability) | In the event of a database crash, no more than 5 minutes of booking data may be lost. | Recovery test: Simulate crash → Verify RPO (Recovery Point Objective) ≤ 5 min. |
| "Must run on tablets" | Technical Constraint | The frontend must be compatible with Chrome v110+ on Android and iOS. | Compatibility test: Manual verification on target OS/Browser versions. |

## Handling the Unhappy Path

Requirements must cover failures as observable outcomes, not prescribe a mechanism without justification. If two patients request the same doctor slot concurrently, at most one booking should succeed and the other should receive an understandable conflict result. A suitable database constraint or concurrency strategy must establish that guarantee; merely adding a version field to unrelated new appointment rows does not do so.

If the clinic has eligibility rules involving insurance or specialty, elicit and confirm them explicitly. A client-supplied doctorId must not bypass the applicable authorization or eligibility checks. Do not invent an insurance policy while translating a vague requirement.
## Exercise

**Scenario**: The clinic wants to add a "Cancellation Policy": *Appointments cancelled less than 24 hours before the start time incur a fee, unless the patient provides a medical excuse.*

**Task**: Classify this requirement and write the observable acceptance measure.

**Answer**: 
- **Classification**: Business Rule (Domain Logic).
- **Acceptance Measure**: Create a test case where an appointment is scheduled for tomorrow 10:00 AM. Attempt to cancel it today at 11:00 AM (less than 24h). Verify that the `Fee` entity is created and linked to the `Patient` account. Then, repeat the test but upload a `MedicalExcuse` document; verify that no fee is generated.
