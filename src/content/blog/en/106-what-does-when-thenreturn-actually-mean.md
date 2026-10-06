---
title: "What Does when(...).thenReturn(...) Actually Mean?"
description: "A deep dive into how Mockito simulates method behavior to isolate units of code during testing."
pubDate: 2026-10-11T01:48:00.000Z
translationKey: 106-what-does-when-thenreturn-actually-mean
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are testing a procurement service where a manager approves a request. To test the approval logic, you don't want to actually connect to a database to check if the request exists; you just want to assume it does. This is where `when(...).thenReturn(...)` comes in.

## The Mechanism of Stubbing
In Mockito, this syntax is called 'stubbing'. When you create a mock object, it is essentially an empty shell. By default, any method called on a mock returns `null`, `0`, or `false`. The `when()` method tells Mockito: "Listen for this specific call with these specific arguments." The `thenReturn()` part defines the pre-programmed response. It intercepts the actual method call and returns your specified value immediately, bypassing the real logic of the class.

## Worked Example: Procurement Approval
Consider a `ProcurementService` that depends on a `RequestRepository`. We want to test if the service correctly marks a request as 'APPROVED' when the repository finds it.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository;

    @InjectMocks
    ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockRequest = new Request(1L, "Laptop");
        // Stubbing: When repository.findById(1L) is called, return our mockRequest
        when(repository.findById(1L)).thenReturn(Optional.of(mockRequest));

        service.approve(1L);
        
        assertEquals("APPROVED", mockRequest.getStatus());
    }
}
```
In this case, `thenReturn` ensures the service receives a valid object to work with, allowing us to test the `approve` logic without a real database.

## Common Mistake: Stubbing the Wrong Argument
A frequent error is stubbing a method with one value but calling it with another. For example, if you write `when(repository.findById(1L)).thenReturn(...)` but the service calls `repository.findById(2L)`, Mockito will return `null` because the arguments don't match. To fix this, use `anyLong()` or `any()` if the specific ID doesn't matter for the test case.

## Practical Exercise
How would you stub a method `checkBudget(Long id)` to return `false` to test a rejected procurement request?

**Answer:** `when(budgetService.checkBudget(anyLong())).thenReturn(false);`


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
