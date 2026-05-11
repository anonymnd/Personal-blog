---
title: "What Should You Do Before Writing the First Line of Code?"
description: "Learn how to transition from jumping straight into coding to a structured planning process that ensures your software actually solves the intended problem."
pubDate: 2026-10-06T17:48:00.000Z
translationKey: 002-what-should-you-do-before-writing-the-first-line-of-code
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Many developers face the 'blank screen panic' or, worse, spend three days coding a feature only to realize they misunderstood the core business requirement. This happens because they treat coding as the starting point rather than the final step of a design process.

## Define the Desired User Outcome
Before opening your IDE, ask: 'What is the user actually trying to achieve?' Instead of thinking about a 'Request Form,' think about the outcome: 'A requester needs to notify the company that they need a specific piece of equipment.' When you focus on the outcome, you avoid building unnecessary fields or complex workflows that don't add value.

## Establish Clear Business Rules
Business rules are the constraints that govern the logic. For a procurement app, a rule might be: 'A request over $500 requires manager approval, while requests under $500 are automatically approved.' Writing these down in plain language prevents logic gaps that lead to expensive refactoring later.

## Identify a Small Vertical Slice
Avoid the temptation to design the entire system architecture upfront. Instead, identify a 'vertical slice'—the smallest possible path that delivers value. For example, instead of building the entire user management and notification system, focus on: Requester submits → Manager approves → Buyer sees request. This proves the core concept works before you scale.

## Set Acceptance Criteria
Acceptance criteria are the 'definition of done.' They are specific conditions that must be met for the feature to be accepted. 

**Example:**
- Given a request is submitted,
- When the manager clicks 'Approve',
- Then the status must change to 'Approved' and the buyer must be notified.

## Common Mistake: Over-Engineering the Architecture
A frequent error is spending weeks on a perfect database schema or choosing the 'perfect' microservices framework before knowing the business rules. 

**Correction:** Start with a simple model. If your procurement app only has three roles, a simple table structure is enough. Let the architecture evolve as the requirements become more complex.

## Practical Exercise
**Scenario:** You are building a simple 'Leave Request' feature. Write one business rule and one acceptance criterion for it.

**Check:** 
- Rule: 'Employees cannot request more than 20 days of leave per year.'
- Criterion: 'When the user submits a request, the system must verify the remaining balance before saving.'
