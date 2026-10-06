---
title: "The Difference Between Coding and Software Engineering"
description: "Understand why writing functional code is only one part of the broader discipline of building sustainable software systems."
pubDate: 2026-10-07T01:48:00.000Z
translationKey: 010-the-difference-between-coding-and-software-engineering
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have a request for a procurement app where a requester submits a purchase request and a manager approves it. A coder focuses on making the 'Submit' button work and saving the data. A software engineer asks: 'What happens if the manager is on leave?' or 'How do we handle a change in approval limits next year?'

## Coding: The Act of Implementation
Coding is the process of translating a specific logic into a language a computer understands. It is about syntax, algorithms, and immediate functionality. If you can write a function that calculates the total price of an order, you are coding. It is a critical skill, but it is a tool, not the entire process.

## Software Engineering: The Holistic Approach
Software engineering applies engineering principles to software development. It focuses on the entire lifecycle: requirements, scalability, maintainability, and reliability. While coding is about *how* to implement a feature, engineering is about *what* to build, *why* it should be built that way, and how it will evolve over time.

## A Worked Example: The Procurement Slice
Consider a vertical slice of a procurement system. 

**Business Rule:** A request over $1,000 requires Senior Manager approval.
**Acceptance Criteria:** The system must block the 'Order' status until the specific approval role is granted.

*Coding approach:* A simple `if (amount > 1000) { requireApproval(); }` block.
*Engineering approach:* Creating an `ApprovalStrategy` interface. This allows the business to change rules (e.g., adding a 'Director' level) without rewriting the core logic.

```java
// Illustrative excerpt: Engineering for flexibility
public interface ApprovalStrategy {
    boolean isApproved(Request request);
}

public class SeniorManagerStrategy implements ApprovalStrategy {
    public boolean isApproved(Request request) {
        return request.getAmount() > 1000 && request.hasRole("SENIOR_MGR");
    }
}
```

## Common Mistake: Over-Engineering Early
A common error is trying to design every possible future scenario before writing a single line of code. This leads to 'Analysis Paralysis.' The correction is iterative architecture: build the simplest version that meets the current acceptance criteria, but keep the code clean enough to refactor when new requirements arrive.

## Practical Exercise
Scenario: You need to add a 'Notification' feature to the procurement app. 
Question: What is the 'coding' way to do this versus the 'engineering' way?

**Check:** The coding way is hardcoding an email send function inside the approval method. The engineering way is creating a Notification Service that can be swapped from Email to SMS or Slack without touching the approval logic.
