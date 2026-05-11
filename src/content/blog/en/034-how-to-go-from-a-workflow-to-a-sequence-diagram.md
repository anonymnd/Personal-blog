---
title: "How to Go From a Workflow to a Sequence Diagram"
description: "Learn how to translate a high-level business process into a technical sequence diagram to map object interactions."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 034-how-to-go-from-a-workflow-to-a-sequence-diagram
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imagine you have a business workflow describing a procurement process: a requester submits a request, a manager approves it, and a buyer places the order. While this flow is clear for stakeholders, developers often struggle to identify which specific software components must talk to each other and in what exact order. A workflow shows *what* happens, but a sequence diagram shows *how* the system objects collaborate to make it happen.

## Identifying the Participants
To start the transition, you must first identify the 'Lifelines'. In a workflow, you have roles (Requester, Manager). In a sequence diagram, you translate these into actors and system objects. For a procurement app, your lifelines would be the `User` (Actor), `RequestController`, `ApprovalService`, and `OrderRepository`.

## Mapping the Chronology
Workflows often use swimlanes or flowcharts. To convert this to a sequence diagram, read the workflow from top to bottom and map each step to a synchronous or asynchronous message. If the workflow says 'Manager approves request', the sequence diagram should show a call from the `Manager` actor to the `ApprovalService.approve(requestId)` method, which then triggers a state change in the database.

## Worked Example: Procurement Approval
Consider the step: "Manager approves the request".
1. **Actor**: Manager $ightarrow$ **Object**: `ApprovalController` (Message: `postApproval(id)`)
2. **Object**: `ApprovalController` $ightarrow$ **Object**: `ApprovalService` (Message: `validateAndApprove(id)`)
3. **Object**: `ApprovalService` $ightarrow$ **Object**: `RequestEntity` (Message: `setStatus('APPROVED')`)

Outcome: The request status is updated, and a confirmation is returned back up the chain to the Manager's UI.

## Common Mistake: Mixing Logic Levels
A frequent error is putting business decisions (like "If amount > $1000") directly as a message. Sequence diagrams should show the *call* to a method that handles the logic, not the logic itself. Instead of a message called `CheckIfAmountIsHigh`, use `ApprovalService.verifyLimit(request)`. The internal logic stays inside the object.

## Practical Exercise
**Scenario**: A requester submits a new procurement request. Map this to three lifelines: `Requester`, `RequestController`, and `RequestDatabase`.

**Check**: The `Requester` sends `submit(data)` to `RequestController`, which then calls `save(request)` on the `RequestDatabase`.


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
