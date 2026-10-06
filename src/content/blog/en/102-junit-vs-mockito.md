---
title: "JUnit vs Mockito"
description: "Understand the fundamental difference between a testing framework and a mocking library to build isolated unit tests."
pubDate: 2026-10-10T21:48:00.000Z
translationKey: 102-junit-vs-mockito
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are testing a procurement service where a requester submits a purchase request. To verify the logic, your service needs a `RequestRepository` to save data and an `EmailService` to notify the manager. If you use a real database and a real email server, your test becomes slow, flaky, and dependent on external systems. This is where the confusion between JUnit and Mockito usually begins.

## Framework vs Library
JUnit is the foundation; it is a testing framework that provides the runner, the assertions (like `assertEquals`), and the lifecycle annotations (`@BeforeEach`, `@Test`). It decides if a test passed or failed. Mockito, however, is a mocking library. It doesn't run tests; it creates "fake" versions of complex objects so you can isolate the specific class you are testing.

## The Mechanism of Isolation
Mockito allows you to simulate the behavior of dependencies. Using `@Mock`, you create a dummy object. With `@InjectMocks`, Mockito attempts to inject these mocks into your service. It is important to note that `@InjectMocks` is not Spring Dependency Injection; it does not start a Spring context or scan for components. It simply uses reflection to plug mocks into the target instance.

## Worked Example: Procurement Approval
Consider a `ProcurementService` that approves a request if the amount is under $1000.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(100, "Laptop");
        // Configure simulated response
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        // Verify the interaction occurred
        verify(repository).save(any(Request.class));
    }
}
```
In this case, `when()` defines the behavior, and `verify()` ensures the repository's save method was called. We aren't checking if the data is actually in a database, but that the service *tried* to save it.

## Common Mistake: Testing the Mock
A frequent error is using `verify()` to check if a value was changed inside a mock. Mocks are shells; they don't have internal state like a real database. If you want to check if a field was updated, capture the argument passed to the mock or check the return value of the service method.

## Practical Exercise
If you want to test how your service handles a `UserNotFoundException` when a repository returns an empty `Optional`, which Mockito method should you use to simulate this?

**Answer:** Use `when(repository.findById(id)).thenReturn(Optional.empty());` and then use JUnit's `assertThrows()` to verify the exception.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
