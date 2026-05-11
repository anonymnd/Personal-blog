---
title: "What Is a Mock?"
description: "Learn how to isolate your code during testing by simulating complex dependencies using Mockito."
pubDate: 2026-10-10T23:48:00.000Z
translationKey: 104-what-is-a-mock
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are testing a procurement service where a requester submits a purchase request. To verify the logic, your code needs to call a database repository and an external email API. If the email server is down or the database is empty, your test fails—not because your logic is wrong, but because the external systems are unreliable. This is where a mock comes in.

## The Concept of Mocking
A mock is a simulated object that mimics the behavior of a real dependency. Instead of using a real `OrderRepository` that connects to a SQL database, you create a 'fake' version. You tell this fake object exactly what to return when a specific method is called. This isolates the unit under test, ensuring you are testing your business logic and not the network or the database.

## Implementing Mocks with Mockito
In Java, Mockito is the standard library for this. You use `@Mock` to create the fake dependency and `@InjectMocks` to place those mocks into the service you are testing. Note that `@InjectMocks` is a Mockito feature, not Spring DI; it doesn't start a full application context, making the tests extremely fast.

## Worked Example: Procurement Approval
Here is how you would mock a repository to test if a manager can approve a request:

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockReq = new Request(1L, "Laptop");
        // Configure simulated response
        when(repository.findById(1L)).thenReturn(Optional.of(mockReq));

        service.approve(1L);

        // Verify the interaction occurred
        verify(repository).save(any(Request.class));
    }
}
```
In this case, `when(...).thenReturn(...)` defines the behavior, and `verify(...)` ensures the service actually tried to save the approved request.

## Common Mistake: Testing the Mock
A frequent error is writing tests that only verify the mock's configuration. For example, testing that `repository.findById` returns a value is just testing Mockito, not your code. Always focus on the observable behavior of your service—like whether a status changed from 'PENDING' to 'APPROVED'.

## Practical Exercise
If you want to test a method that throws a `UserNotFoundException` when a requester ID doesn't exist, how should you configure the mock repository?

**Answer:** Use `when(repository.findById(id)).thenThrow(new UserNotFoundException());` to simulate the error path.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
