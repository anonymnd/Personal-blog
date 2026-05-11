---
title: "Business Rules vs Technical Rules"
description: "Learn how to separate high-level organizational policies from the low-level implementation constraints of your software."
pubDate: 2026-10-07T09:48:00.000Z
translationKey: 018-business-rules-vs-technical-rules
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. Your manager says, "Only a Department Head can approve requests over $5,000." You immediately start writing an `if` statement in your Java controller. But wait—what happens if the company changes the limit to $7,000 next month? Or if the approval process moves to a different system? If you mix the 'why' (business policy) with the 'how' (technical constraint), your code becomes a rigid mess.

## Defining Business Rules
Business rules are policies that define how a business operates, regardless of whether a computer is involved. They describe the logic of the domain. In our procurement app, a rule like "A requester cannot approve their own request" is a business rule. It is a policy about fraud prevention and authorization. These rules are usually defined by stakeholders and actors (the roles interacting with the system) and must be measurable.

## Defining Technical Rules
Technical rules are constraints imposed by the technology stack or the system architecture. They don't care about the business goal; they care about system stability and correctness. For example, "The request description must be a UTF-8 string under 2000 characters" or "The API must respond within 200ms." These are non-functional constraints that ensure the app doesn't crash or lag.

## Worked Example: The Approval Flow
Consider a request entity. 

**Business Rule:** A request must be approved by a Manager if the total is > $1,000.
**Technical Rule:** The `approvalDate` field must be stored in ISO-8601 format in the database.

```java
// Illustrative excerpt: Separating the logic
public class ProcurementService {
    public void processRequest(Request req, User user) {
        // Business Rule: Authorization check
        if (req.getAmount() > 1000 && !user.hasRole("MANAGER")) {
            throw new UnauthorizedException("Manager approval required");
        }
        // Technical Rule: Validation
        if (req.getDescription() == null) {
            throw new ValidationException("Description is mandatory");
        }
    }
}
```

## Common Mistake: Hardcoding Policy
A common error is burying business rules inside database triggers or UI validation logic. If you put the "$1,000 limit" inside a JavaScript frontend check only, a savvy user could bypass it via API. Correction: Business rules should live in the Domain layer, while technical rules live in the Infrastructure or Validation layers.

## Practical Exercise
Identify which of these is a Business Rule and which is a Technical Rule:
1. "The system must support 500 concurrent users."
2. "A buyer cannot order items from a blacklisted vendor."

**Answer:** 1 is Technical (Performance/Scalability); 2 is Business (Procurement Policy).
