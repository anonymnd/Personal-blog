---
title: "What Is a Unit Test?"
description: "A beginner's guide to understanding the smallest unit of software testing using JUnit and Mockito."
pubDate: 2026-10-10T22:48:00.000Z
translationKey: 103-what-is-a-unit-test
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have built a complex procurement system where a requester submits a purchase request. You want to ensure that the logic which calculates the total cost is correct, but you don't want to start the entire database, the security layer, or the web server just to check one addition operation. This is where unit testing becomes essential.

## The Core Concept
A unit test focuses on the smallest possible piece of testable software, usually a single method within a class. The goal is to isolate this "unit" from its dependencies. If your service depends on a database repository, you don't use a real database; instead, you use a "mock" to simulate the repository's behavior. This ensures that if the test fails, the bug is in your logic, not in the network or the database configuration.

## The Toolset: JUnit and Mockito
In the Java ecosystem, JUnit is the framework that runs the tests and asserts the results. Mockito is a library used to create mocks. While `@InjectMocks` helps instantiate your service and inject these mocks, it is important to remember that this is not Spring Dependency Injection; it does not start a Spring context, making the tests extremely fast.

## Worked Example: Procurement Approval
Consider a `RequestService` that approves a request only if the amount is under $1000.

```java
@ExtendWith(MockitoExtension.class)
class RequestServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private RequestService service;

    @Test
    void testApproveRequest_UnderLimit_ReturnsTrue() {
        Request req = new Request(100, "Laptop Mouse");
        // Configure simulated response
        when(repository.findById(1L)).thenReturn(Optional.of(req));

        boolean result = service.approve(1L);

        assertTrue(result);
        verify(repository).save(any());
    }
}
```
In this example, `when(...).thenReturn(...)` tells Mockito how to behave. The `verify` method checks if the repository's save method was called, confirming the interaction occurred without actually writing to a disk.

## Common Mistake: Testing Private Methods
Beginners often try to use reflection to test private helper methods. This is a mistake because it ties your tests to the internal implementation. Instead, test the public method that calls the private one. If the public behavior is correct, the private logic is implicitly validated.

## Practical Exercise
**Scenario:** Write a test case for a method `rejectRequest(Long id)` that should throw a `RequestNotFoundException` if the repository returns an empty Optional.

**Check:** You should use `when(repository.findById(id)).thenReturn(Optional.empty())` and wrap the service call in `assertThrows(RequestNotFoundException.class, () -> ...)`.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
