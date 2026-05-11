---
title: "How to Test an UPDATE Method"
description: "Learn how to verify that your service layer correctly handles data updates using JUnit and Mockito without needing a live database."
pubDate: 2026-10-11T05:48:00.000Z
translationKey: 110-how-to-test-an-update-method
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app. You have a method to update the status of a purchase request from 'PENDING' to 'APPROVED'. The challenge is that you don't want to connect to a real database every time you run a test, as it would be slow and unstable. Instead, you need to verify that your business logic correctly calls the repository and handles the result.

## The Logic of Update Testing
Testing an update method isn't about checking if a row changed in SQL, but about verifying the interaction between your service and your repository. You must ensure the service finds the existing entity, modifies the specific fields, and then saves it back. If the entity doesn't exist, the service should throw an exception.

## Setting Up the Mock Environment
Using JUnit and Mockito, we use `@InjectMocks` to create the service and `@Mock` for the repository. Remember that `@InjectMocks` is not Spring DI; it simply injects the mocks into the object manually.

## Worked Example: Approving a Request
Here is a concise example of testing a `PurchaseRequestService`:

```java
@ExtendWith(MockitoExtension.class)
class PurchaseRequestServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private PurchaseRequestService service;

    @Test
    void testApproveRequest_Success() {
        // Arrange
        Long id = 1L;
        PurchaseRequest request = new PurchaseRequest(id, "Laptop", "PENDING");
        when(repository.findById(id)).thenReturn(Optional.of(request));

        // Act
        service.approveRequest(id);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```
In this case, the `when` call simulates finding the request, and `verify` ensures the `save` method was actually called.

## Common Mistake: Testing the Mock
A frequent error is trying to use `verify` to check if the data was actually persisted in a database. Mockito only tracks if a method was called. To test actual SQL or ORM mappings, you would need an `@DataJpaTest` with an H2 database, not a Mockito unit test.

## Practical Exercise
**Scenario:** Write a test case for a method `updateQuantity(Long id, int newQty)` that should throw a `ResourceNotFoundException` if the ID is not found.

**Check:** Your test should use `when(repository.findById(id)).thenReturn(Optional.empty())` and wrap the service call in `assertThrows(ResourceNotFoundException.class, () -> ...)`.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
