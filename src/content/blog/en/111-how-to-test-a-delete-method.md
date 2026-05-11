---
title: "How to Test a DELETE Method"
description: "Learn how to verify the deletion logic of a REST endpoint using JUnit and Mockito without needing a live database."
pubDate: 2026-10-11T06:48:00.000Z
translationKey: 111-how-to-test-a-delete-method
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a feature where a manager can delete a pending request. The problem is that testing this often feels risky; you don't want to accidentally wipe your database, and you aren't sure if the service actually called the repository or just pretended to.

## The Testing Strategy
To test a DELETE method, we focus on the interaction between the Controller, the Service, and the Repository. Since we want a fast unit test, we use Mockito to simulate the Repository. We aren't checking if a row vanished from a physical disk, but rather if the `deleteById` method was triggered with the correct ID and if the API returned the expected status code.

## Implementation Example
Here is a focused excerpt of a test for a `ProcurementRequestService` using Jakarta EE and Mockito.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testDeleteRequest_Success() {
        Long requestId = 101L;
        // Simulate that the record exists
        when(repository.existsById(requestId)).thenReturn(true);

        service.deleteRequest(requestId);

        // Verify the repository's delete method was actually called
        verify(repository, times(1)).deleteById(requestId);
    }
}
```

## Handling the 'Not Found' Scenario
A common mistake is only testing the 'happy path'. In a real app, trying to delete a non-existent ID should throw an exception. If your test doesn't cover this, your API might return a 200 OK even when nothing happened, which misleads the frontend.

**Correction:** Use `when(...).thenReturn(false)` and wrap the service call in an `assertThrows` block to ensure your custom `ResourceNotFoundException` is triggered.

## Verification vs. Persistence
It is crucial to remember that `verify(repository).deleteById(id)` does not check the database. It only checks that the Java method was called. To test actual SQL deletion, you would need an integration test with an H2 database, but for unit testing, interaction verification is the standard.

## Practical Exercise
**Task:** How would you modify the test to ensure the `deleteById` method is NEVER called if the `existsById` check returns false?

**Answer:** Use `verify(repository, never()).deleteById(anyLong());` after calling the service with a non-existent ID.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
