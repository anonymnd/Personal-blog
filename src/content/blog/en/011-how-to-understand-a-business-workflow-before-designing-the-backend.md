---
title: "Turn a Business Workflow into Explicit Use Cases"
description: "A guide to eliciting workflows, handling exceptions, and documenting logic via textual use cases and decision tables using a library lending scenario."
pubDate: 2026-10-06T17:48:00.000Z
translationKey: 011-how-to-understand-a-business-workflow-before-designing-the-backend
seriesOrder: 2
locale: en
tags: ["business-workflows","learning-series"]
draft: false
---

## From Workflow to Logic

Software failure often stems from translating a vague business process directly into code without exposing the 'hidden' rules. A workflow is the sequence of steps a business follows; a use case is the specific interaction between an actor and the system to achieve a goal. To bridge the gap, you must move from a narrative description to a structured set of rules and exceptions.

## Eliciting the Workflow: The Library Scenario

Consider a library system. A surface-level description says: "Users borrow books and can renew them if they aren't overdue." To turn this into a technical specification, you must interview stakeholders to find the 'blocked' paths.

**Interview Questions to Expose Logic:**
* "What happens if a user tries to renew a book that is already reserved by someone else?"
* "Can a user renew a book if they have an outstanding fine?"
* "What is the exact trigger that marks a loan as 'overdue'?"

Through these questions, we discover a critical business rule: A renewal is blocked if the item is reserved OR if the user has fines exceeding $10, regardless of the book's status.

## Structuring the Textual Use Case

A use case must focus on the interaction, not the UI. It identifies the Actor (the role), the Preconditions (what must be true), the Main Success Scenario (the happy path), and the Extensions (the unhappy paths).

**Use Case: Renew Library Item**
* **Actor:** Library Member
* **Precondition:** Member is authenticated and has an active loan for the item.
* **Main Success Scenario:**
    1. Member requests renewal of a specific item.
    2. System verifies the item is not reserved.
    3. System verifies the member's account is in good standing (fines ≤ $10).
    4. System extends the due date by 14 days.
    5. System notifies the member of the new date.
* **Extensions:**
    2a. Item is reserved → System informs member that renewal is blocked due to a pending reservation.
    3a. Fines exceed $10 → System informs member that renewal is blocked until fines are paid.
    3b. Item is a 'High Demand' reference book → System denies renewal (some items are non-renewable).

## Mapping Complex Logic with Decision Tables

When multiple conditions overlap, textual descriptions become ambiguous. A decision table makes combinations of conditions explicit. The table below shows representative cases; it must also be checked for simultaneous blocking conditions. Any reserved, excessive-fine or non-renewable condition blocks the renewal.

| Condition | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
| :--- | :---: | :---: | :---: | :---: |
| Item Reserved? | No | Yes | No | No |
| Fines > $10? | No | No | Yes | No |
| Non-renewable? | No | No | No | Yes |
| **Action: Allow Renewal** | **Yes** | **No** | **No** | **No** |
| **Action: Show Error** | None | "Reserved" | "Fines" | "Policy" |

## Analysis of the Artifact

This approach prevents the common mistake of coding the 'Happy Path' first and discovering the 'Reserved' or 'Fine' logic during QA. By defining the decision table, the developer knows exactly which `if/else` or `switch` logic is required in the service layer before a single line of Java is written. The failure cases (Extensions) are now first-class requirements, not afterthoughts.

## Focused Exercise

**Scenario:** The library introduces a 'Grace Period'. If a book is returned 1-3 days late, no fine is charged. If it is 4+ days late, a daily fine is applied. However, if the user is a 'Premium Member', the grace period is extended to 7 days.

**Task:** Create a decision table to determine if a fine should be applied based on: `Days Late`, `Member Type (Standard/Premium)`. 

**Answer:**

| Condition | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
| :--- | :---: | :---: | :---: | :---: |
| Days Late | 1-3 | 4-7 | 4-7 | 8+ |
| Member Type | Standard | Standard | Premium | Any |
| **Apply Fine?** | **No** | **Yes** | **No** | **Yes** |
