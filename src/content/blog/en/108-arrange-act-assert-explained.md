---
title: "Arrange, Act, Assert Explained"
description: "A guide to structuring unit tests using the AAA pattern to improve readability and maintainability."
pubDate: 2026-10-11T03:48:00.000Z
translationKey: 108-arrange-act-assert-explained
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers start writing tests by mixing setup logic with assertions, resulting in 'spaghetti tests' where it is unclear what is actually being verified. When a test fails, you spend more time deciphering the test code than fixing the bug. The Arrange, Act, Assert (AAA) pattern solves this by creating a clear linear structure.

## The Three Pillars of AAA

**Arrange** is the first phase. Here, you set up the objects, mocks, and data needed for the test. This includes instantiating the class under test and configuring mock behaviors using Mockito's `when()` method. 

**Act** is the execution phase. You call the specific method you want to test. This section should ideally be a single line of code to keep the focus sharp.

**Assert** is the verification phase. You check if the actual outcome matches the expected result using JUnit assertions or Mockito's `verify()` to ensure a specific interaction occurred.

## Worked Example: Procurement Approval

Imagine a procurement app where a manager approves a request. We want to test that the status changes to 'APPROVED'.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        // Arrange
        Request request = new Request(1L, "Laptop", "PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(request));

        // Act
        service.approve(1L);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```

## Common Mistake: The Mixed-Loop

A frequent error is performing 'Act' and 'Assert' repeatedly in one test. For example, calling a method, asserting, then calling another method on the same object and asserting again. This makes it hard to isolate which step caused a failure. The correction is to split these into separate test methods, each following the AAA sequence.

## Practical Exercise

**Scenario:** Write a test for a `reject()` method that should change the status to 'REJECTED'.

**Check:** Did you put the `when()` call in Arrange, the `service.reject()` call in Act, and the `assertEquals` in Assert? If so, your structure is correct.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
