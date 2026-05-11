---
title: "Unit Tests vs Integration Tests"
description: "A clear guide to distinguishing between isolated logic verification and full-system component interaction."
pubDate: 2026-10-11T08:48:00.000Z
translationKey: 113-unit-tests-vs-integration-tests
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a procurement system where a manager must approve a request before a buyer can place an order. You wrote the logic, but now you are unsure: do you test the approval method in isolation, or do you trigger the entire flow from the database to the API? This confusion often leads to slow test suites that fail for the wrong reasons.

## Understanding Unit Tests
Unit tests focus on the smallest piece of testable software, usually a single method. The goal is to validate business logic without any external dependencies. To achieve this, we use Mockito to simulate the behavior of other classes. For example, if the `ApprovalService` needs a `RequestRepository`, we mock the repository so the test doesn't actually touch a database.

## The Role of Integration Tests
Integration tests verify that different modules work together. Unlike unit tests, these often start a partial or full application context (like Spring Boot) and interact with a real H2 in-memory database. They ensure that your SQL queries are correct and that the ORM mappings actually work, which a mock cannot verify.

## Worked Example: Procurement Approval
Consider a service that approves a request. Here is how the two approaches differ:

**Unit Test (Isolated):**
```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock RequestRepository repository;
    @InjectMocks ApprovalService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        service.approve(1L);
        verify(repository).save(any());
    }
}
```
*Outcome:* Fast execution. Validates that the `approve` method calls the save function.

**Integration Test (Connected):**
```java
@SpringBootTest
class ApprovalIntegrationTest {
    @Autowired ApprovalService service;
    @Autowired RequestRepository repository;

    @Test
    void testFullApprovalFlow() {
        repository.save(new Request(1L, "Laptop"));
        service.approve(1L);
        assertEquals("APPROVED", repository.findById(1L).get().getStatus());
    }
}
```
*Outcome:* Slower execution. Validates that the data is actually persisted in the DB.

## Common Mistake: Mocking Everything
A frequent error is using `@InjectMocks` and thinking you have performed an integration test. Mocking the repository means you are not testing your SQL or database constraints. If your SQL syntax is wrong, the unit test will still pass because the mock just returns what you told it to.

## Practical Exercise
If you want to verify that a `BuyerService` correctly calculates the total tax of an order based on a complex formula, which test type should you use?

**Answer:** A Unit Test, because the tax calculation is pure logic and doesn't require a database or network connection.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
