---
title: "How to Test a CREATE Method"
description: "Learn how to isolate and verify the logic of a service-layer creation method using JUnit and Mockito."
pubDate: 2026-10-11T04:48:00.000Z
translationKey: 109-how-to-test-a-create-method
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Many developers struggle when testing a 'create' method because they try to connect to a real database, which makes tests slow and fragile. The goal is to verify that your service logic correctly processes the input and calls the repository, regardless of the actual database state.

## The Mocking Strategy
To test a create method in isolation, we use Mockito to simulate the repository layer. By using `@InjectMocks`, we tell Mockito to create an instance of the service and automatically plug in the mocked dependencies. This avoids starting a full Spring context, making the test execute in milliseconds.

## Implementing the Test
Consider a procurement app where a requester submits a `PurchaseRequest`. The service must validate the request before saving it.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldCreateRequestSuccessfully() {
        PurchaseRequest request = new PurchaseRequest("Laptop", 1200.0);
        // Define behavior: when save is called, return the saved object
        when(repository.save(any(PurchaseRequest.class))).thenReturn(request);

        PurchaseRequest result = service.createRequest(request);

        assertNotNull(result);
        assertEquals("Laptop", result.getItem());
        verify(repository, times(1)).save(request);
    }
}
```

## Verifying the Outcome
In the example above, `when(...).thenReturn(...)` simulates the database's response. The `verify` method is crucial; it ensures that the `save` method was actually called. Without it, your test might pass even if the service forgets to call the repository, as long as it returns a non-null object.

## Common Mistake: Testing the Mock
A frequent error is asserting that the repository saved the data to a database. Remember: Mockito does not interact with a real DB. If you assert that a record exists in a table, your test will fail or require a complex H2 setup. Focus on whether the service passed the correct arguments to the mock.

## Practical Exercise
How would you test a scenario where the `createRequest` method should throw an exception if the item name is null?

**Check:** Use `assertThrows(IllegalArgumentException.class, () -> service.createRequest(nullRequest))` and verify that `repository.save()` was never called using `verify(repository, never()).save(any())`.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
