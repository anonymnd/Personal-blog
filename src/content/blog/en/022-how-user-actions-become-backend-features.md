---
title: "How User Actions Become Backend Features"
description: "Learn how to translate a user's intent into a structured backend feature by mapping actors to domain logic."
pubDate: 2026-10-07T13:48:00.000Z
translationKey: 022-how-user-actions-become-backend-features
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers start coding the moment they hear a request like 'I want to request a new laptop.' This often leads to missing edge cases, such as what happens if the manager is on vacation or the budget is exceeded. The gap between a user action and a backend feature is where business logic lives.

## Identifying the Actor vs. the User
Before writing a line of code, you must distinguish the Actor from the User. An Actor is a role (e.g., Requester, Manager, Buyer) that interacts with the system. A User is the specific person logged into an account. A domain entity, like a 'PurchaseRequest', is the object being manipulated. Understanding this prevents authorization bugs where any user could potentially approve their own request.

## Mapping the Action Flow
To turn an action into a feature, map the 'Happy Path' and the 'Unhappy Paths'. For a procurement app, the action 'Submit Request' isn't just a database insert. It involves checking if the requester has a valid department and if the item is allowed. The unhappy path includes scenarios like 'Request denied due to budget' or 'Invalid item category'.

## Worked Example: The Approval Feature
Consider the action: 'Manager approves a request'.

**Logic Flow:**
1. System verifies the Actor is a 'Manager'.
2. System checks if the Manager is the assigned supervisor for that specific Request entity.
3. System updates status from `PENDING` to `APPROVED`.

```java
// Illustrative excerpt of the approval logic
public void approveRequest(Long requestId, User manager) {
    PurchaseRequest request = repository.findById(requestId);
    if (!manager.getRole().equals(Role.MANAGER)) {
        throw new UnauthorizedException("Only managers can approve");
    }
    if (!request.getSupervisor().equals(manager)) {
        throw new BusinessException("You are not the assigned supervisor");
    }
    request.setStatus(Status.APPROVED);
    repository.save(request);
}
```

## Common Mistake: Overlooking Constraints
A frequent error is focusing only on the 'what' (updating a status) and ignoring the 'how' (non-functional constraints). For example, requiring that an approval must happen within 48 hours or that the system must log who approved it for auditing. Correct this by adding a 'Constraints' section to your requirements before coding.

## Practical Exercise
**Scenario:** A Buyer marks a request as 'Ordered'. What is one 'unhappy path' for this action?

**Answer:** The request might have been cancelled by the manager after the buyer opened the page but before they clicked 'Order'.
