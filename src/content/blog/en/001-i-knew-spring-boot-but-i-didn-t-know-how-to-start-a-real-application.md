---
title: "I Knew Spring Boot, But I Didn’t Know How to Start a Real Application"
description: "Learn how to move from writing isolated controllers to structuring a real-world application using a vertical slice approach."
pubDate: 2026-10-06T16:48:00.000Z
translationKey: 001-i-knew-spring-boot-but-i-didn-t-know-how-to-start-a-real-application
locale: en
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers fall into the 'tutorial trap': they can create a REST controller and connect a database, but they freeze when faced with a blank IDE and a business requirement. The mistake is trying to design the entire architecture—every table and service—before writing a single line of code. In professional software engineering, we start with a vertical slice.

## Focus on the User Outcome
Instead of thinking about 'The Database Layer,' think about the user's goal. For a procurement app, the first goal isn't 'User Management'; it's 'A requester must be able to submit a purchase request.' This outcome defines your starting point. You don't need a full system design; you need a path from the HTTP request to the saved record.

## Defining Business Rules and Acceptance Criteria
Before coding, list the rules. For our request submission: 
1. The request must have a description and an estimated cost.
2. The cost cannot be negative.
3. The status must default to 'PENDING'.

Acceptance criteria are the 'tests' for success: 'Given a valid request, the system returns a 201 Created and the record exists in the DB.'

## Implementing the Vertical Slice
Start with a minimal implementation. Create a `PurchaseRequest` entity, a `PurchaseRequestRepository`, and a `PurchaseRequestService`. Keep it simple.

```java
@Service
public class PurchaseRequestService {
    @Autowired
    private PurchaseRequestRepository repository;

    public PurchaseRequest createRequest(RequestDTO dto) {
        if (dto.getAmount() < 0) throw new IllegalArgumentException("Amount must be positive");
        PurchaseRequest request = new PurchaseRequest(dto.getDescription(), dto.getAmount(), "PENDING");
        return repository.save(request);
    }
}
```

## Iterative Architecture
Once the requester can submit, you add the next slice: the Manager's approval. You don't build the approval logic until the submission logic works. Architecture evolves as you add these slices, rather than being a rigid blueprint you follow from day one.

## Common Mistake: Over-Engineering
Beginners often create generic `BaseService` or `AbstractEntity` classes before they even have one working feature. This adds complexity without value. Correct this by following the 'Rule of Three': don't abstract until you've repeated the same pattern three times.

## Practical Exercise
Define the vertical slice for the 'Buyer orders the item' feature. What is the user outcome and one business rule?

**Check:** Outcome: Buyer marks request as 'ORDERED'. Rule: Only requests with status 'APPROVED' can be ordered.
