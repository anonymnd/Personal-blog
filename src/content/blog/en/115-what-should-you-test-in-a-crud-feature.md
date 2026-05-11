---
title: "What Should You Test in a CRUD Feature?"
description: "A guide on identifying the critical test cases for Create, Read, Update, and Delete operations using JUnit and Mockito."
pubDate: 2026-10-11T10:48:00.000Z
translationKey: 115-what-should-you-test-in-a-crud-feature
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers start testing by simply checking if a record is saved to the database, but they often miss the 'invisible' failure points. For example, what happens if a user tries to update a procurement request that doesn't exist, or submits a request with a negative price? Testing only the 'happy path' leaves your application vulnerable to crashes in production.

## The Core CRUD Test Matrix
When testing a CRUD feature, you must validate both the successful outcome and the failure modes. For a procurement app, this means testing the requester's ability to submit a request and the manager's ability to approve it.

| Operation | Happy Path | Edge Case / Failure |
| :--- | :--- | :--- |
| Create | Valid data saved | Duplicate request or null fields |
| Read | Record found by ID | ID does not exist (404 scenario) |
| Update | Fields modified correctly | Updating a read-only status |
| Delete | Record removed | Deleting a record already gone |

## Implementing Service Tests with Mockito
Since we want to test business logic without starting a heavy database, we use Mockito. The `@InjectMocks` annotation creates the service instance and injects the mocked repository.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testCreateRequest_Success() {
        Request req = new Request("Laptop", 1200.0);
        when(repository.save(any())).thenReturn(req);
        
        Request result = service.createRequest(req);
        
        assertNotNull(result);
        verify(repository).save(req);
    }
}
```

## Handling the 'Not Found' Scenario
One of the most common mistakes is forgetting to test the exception path. If `repository.findById()` returns an empty Optional, your service should throw a custom exception, not a `NullPointerException`.

**Mistake:** Only testing `findById` with a valid ID.
**Correction:** Use `when(repository.findById(id)).thenReturn(Optional.empty())` and assert that the service throws a `ResourceNotFoundException`.

## Testing State Transitions
In a procurement flow, a request cannot go from 'Draft' to 'Ordered' without being 'Approved'. Your tests should verify that the service rejects invalid state transitions, ensuring the business rules are enforced before the data ever reaches the database.

## Practical Exercise
**Scenario:** Write a test case for the `deleteRequest` method. What should happen if the ID provided does not exist in the database?

**Answer:** You should mock the repository to return an empty Optional for that ID, then use `assertThrows` to verify that the service throws a specific exception (e.g., `RequestNotFoundException`) instead of completing silently.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
