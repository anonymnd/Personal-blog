---
title: "Stop Thinking in Pages: Start Thinking in User Actions"
description: "Learn how to shift your software design from a visual page-based approach to a functional action-based model to build more robust business logic."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 021-stop-thinking-in-pages-start-thinking-in-user-actions
locale: en
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many beginner developers start designing their apps by sketching screens. They think, "I need a Login Page, a Dashboard Page, and a Request Page." This is a trap. When you design by pages, you often miss the complex business rules that happen *between* those screens, leading to fragmented logic and bugs when the UI changes.

## The Actor vs. The Page
Instead of a page, focus on the **Actor**. An actor is a role (like a Requester or a Manager) who interacts with the system to achieve a goal. A single action might span multiple pages or happen entirely in the background. By focusing on the action (e.g., "Submit Procurement Request"), you define what the system *does* regardless of whether it's a mobile app, a website, or an API call.

## Mapping the Action Flow
Consider a procurement app. Instead of a "Request Form Page," define the action: **Submit Request**. 
- **Actor**: Requester
- **Domain Entity**: ProcurementRequest
- **Happy Path**: Requester fills details → System validates budget → Status becomes 'Pending'.
- **Unhappy Path**: Requester submits an empty amount → System returns a validation error.
- **Authorization**: Only users with the 'Employee' role can trigger this action.

## Worked Example: The Approval Process
If we think in pages, we just make an "Approval Page" with a button. If we think in actions, we model **Approve Request**:

```java
// Illustrative excerpt of a Service layer action
public class ProcurementService {
    public void approveRequest(Long requestId, User manager) {
        // 1. Authorization check
        if (!manager.hasRole("MANAGER")) throw new UnauthorizedException();
        
        // 2. Domain logic
        ProcurementRequest request = repository.findById(requestId);
        if (request.getStatus() != Status.PENDING) throw new IllegalStateException("Request not pending");
        
        request.setStatus(Status.APPROVED);
        repository.save(request);
    }
}
```
Outcome: The logic is decoupled from the UI. If you later add an "Auto-approve" feature, you reuse this action without needing a "page."

## Common Mistake: The "UI-Driven" Logic
A common error is putting business rules inside the button click handler in the frontend. 
**Wrong**: `if (amount > 1000) { showManagerAlert(); }` 
**Correction**: Move this to the backend action. The UI should only trigger the action; the system decides the outcome based on domain rules.

## Practical Exercise
Define the **Order Item** action for a Buyer in the procurement app. List one happy path and one authorization constraint.

**Check**: Happy path: Buyer selects approved request → creates Purchase Order. Constraint: Only users with 'Buyer' role can execute this action.
