---
title: "Why Passing Unit Tests Does Not Mean Your Application Works"
description: "An exploration of the gap between isolated unit test success and real-world application reliability."
pubDate: 2026-10-11T09:48:00.000Z
translationKey: 114-why-passing-unit-tests-does-not-mean-your-application-works
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a procurement system where a manager approves a request. You wrote a unit test for the `ApprovalService`, and it passes with a green checkmark. However, the moment you deploy it, the application crashes because the database column name doesn't match the entity. This is the 'Green Test Paradox': your logic is correct in isolation, but the system fails in integration.

## The Illusion of the Mock
Unit tests often rely on libraries like Mockito to simulate dependencies. When you use `@InjectMocks`, Mockito creates a fake version of your repository. You tell the mock exactly what to return using `when(...).thenReturn(...)`. While this proves your Java logic handles a specific return value correctly, it doesn't prove that the real SQL query will actually work against a real database. You are testing your assumptions, not the actual infrastructure.

## Behavior vs. Interaction
Many developers fall into the trap of testing interactions instead of outcomes. Using `verify(repository).save(request)` only confirms that the `save` method was called. It does not confirm that the data was actually persisted, that the transaction committed, or that the ORM mapping is correct. A test can pass while the data silently vanishes due to a missing `@Transactional` annotation.

## A Worked Example: The Approval Flow
Consider this snippet where we test a request approval:

```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ApprovalService service;

    @Test
    void testApproveRequest() {
        PurchaseRequest req = new PurchaseRequest(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        verify(repository).save(any());
    }
}
```
Outcome: The test passes. But if the `PurchaseRequest` entity has a `@Column` mapping error, the real app will throw a `PersistenceException` that this unit test will never catch.

## Common Mistake: Testing Private Methods
Developers often try to force unit tests into private methods to achieve 100% coverage. This is a mistake. Testing private methods makes your tests brittle; if you rename a helper method, your tests break even if the feature still works. Instead, test the observable behavior of the public API.

## Practical Exercise
Scenario: You have a test that mocks a `BuyerService` to return a `Success` object. The test passes, but in production, the service returns `null`, causing a `NullPointerException`.

Question: What is missing from the test suite?
Answer: An exceptional path test case (testing how the system handles null or error responses) and an integration test with a real service instance.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
