---
title: "Choose and Build the UML Diagram That Answers Your Question"
description: "A guide to selecting and building UML diagrams based on the specific engineering question you need to answer, using a ticket reservation scenario."
pubDate: 2026-10-06T20:48:00.000Z
translationKey: 023-business-flow-diagram-vs-uml-diagram
seriesOrder: 5
locale: en
tags: ["uml-modeling","learning-series"]
draft: false
---

## The Core Problem: Diagram Misuse

Many developers treat UML as a mandatory ritual rather than a communication tool. The most common mistake is using the wrong diagram to answer a specific question. For example, trying to explain a business decision branch using a Deployment diagram is impossible because deployment diagrams describe physical infrastructure, not logic.

To choose the right tool, you must first identify the question you are asking: "Who is involved?", "What is the flow?", "In what order do objects talk?", "What is the structure?", or "Where does the code live?"

## Mapping Questions to Diagrams

| The Question | The Correct Diagram | Primary Focus |
| :--- | :--- | :--- |
| Who interacts with the system to achieve a goal? | Use Case Diagram | Actors and Goals |
| What are the logical steps and decision branches? | Activity Diagram | Workflow and Control Flow |
| In what exact order do components exchange messages? | Sequence Diagram | Time-ordered Interactions |
| What are the conceptual entities and their relations? | Class Diagram | Static Structure and Logic |
| How is the system divided into modular parts? | Component Diagram | Physical/Logical Modules |
| Which server or device hosts which component? | Deployment Diagram | Hardware and Execution Environment |

## Worked Scenario: Event Ticket Reservation

Consider a system where a user reserves seats. The seats are held for 10 minutes. If payment succeeds, the reservation is confirmed; if the timer expires or payment fails, the seats are released.

### 1. The Workflow Question: Activity Diagram
An Activity Diagram is a useful choice for the reservation workflow because it foregrounds actions, branches and concurrency. A Sequence Diagram can also show branches and parallel interactions; choose it when the question concerns messages between particular participants.

**Logic Trace:**
- Start → Select Seats → [Hold Seats] → Decision: Payment Received?
- If Yes → Confirm Ticket → End.
- If No → Wait for Timeout → Decision: Time Expired?
- If Yes → Release Seats → End.

### 2. The Interaction Question: Sequence Diagram
Once the workflow is clear, we need to know *which* objects handle the logic. A Sequence Diagram maps the activity flow to specific lifelines (Actors and Objects).

**Illustrative Interaction Trace:**
- User → ReservationController: requestHold(seatId)
- ReservationController → SeatService: lockSeat(seatId)
- SeatService → Database: updateStatus('HELD')
- ReservationController → User: return holdConfirmation
- [Loop: Check Payment Status]
- PaymentGateway → ReservationController: notifyPaymentSuccess()
- ReservationController → SeatService: finalizeBooking()

**Key Notations used here:**
- **alt (Alternative):** Used for the payment success vs. failure paths.
- **loop:** Used for polling a payment status or checking a timeout.
- **par (Parallel):** Used if the system sends a confirmation email while simultaneously updating the database.
- **Lifelines:** The User is an actor lifeline; the SeatService is an object lifeline.

### 3. The Structural Question: Class Diagram
While the sequence shows the *talk*, the Class Diagram shows the *knowledge*.

**Crucial Distinction: Conceptual Class vs. SQL Table**
A UML Class represents a business concept with behavior (methods), not just a data row. A `Reservation` class might have a method `calculateExpiry()`, whereas a SQL table only has a `expiry_date` column.

**Model Artifact:**
- Class `Ticket`: attributes (id, price, seatNumber).
- Class `Reservation`: attributes (id, startTime), methods (confirm(), cancel()).
- Relationship: `Reservation` has a 1..* association with `Ticket`.

## Why Deployment Diagrams Fail at Logic

If you try to show the "Payment Timeout" logic in a Deployment Diagram, you will fail. A Deployment Diagram shows that the `PaymentService.jar` runs on `Server-A` and connects via HTTPS to `PaymentGateway-API`. It describes the *where*, not the *how*. Logic belongs in Activity or Sequence diagrams; infrastructure belongs in Deployment diagrams.

## Exercise

**Scenario:** A user uploads a profile picture. The system must resize the image, scan it for malware, and then save it to a cloud bucket. If the scan fails, the image is deleted immediately.

**Question:** Which two diagrams should you use to model the "Malware Scan → Delete" logic and the "App Server → Cloud Bucket" connection? Explain why.

**Answer:**
1. **Activity Diagram** (or Sequence Diagram) for the logic: It handles the decision branch (Scan Success vs. Failure) and the resulting action (Save vs. Delete).
2. **Deployment Diagram** for the connection: It maps the physical relationship between the Application Server and the Cloud Storage provider.

## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
