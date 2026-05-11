---
title: "Why Should You Test the Service Layer?"
description: "Understand the critical role of service layer testing in isolating business logic from infrastructure dependencies."
pubDate: 2026-10-10T20:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are building a procurement app where a requester submits a purchase request. The logic is complex: the system must check the requester's budget, verify if the item is restricted, and then notify the manager. If you only test the Controller (API) or the Repository (Database), you end up with a 'testing gap' where the actual business rules—the heart of your app—remain unverified.

## The Role of the Service Layer
The service layer acts as the orchestrator. While the Controller handles HTTP requests and the Repository handles SQL, the Service layer decides *what* happens. Testing this layer allows you to verify business rules without needing a live database or a running web server, making tests significantly faster and more reliable.

## Isolating Logic with Mockito
To test the service in isolation, we use Mockito. Instead of connecting to a real database, we 'mock' the repository. This ensures that a failure in the test is caused by a bug in the business logic, not a connection timeout or a missing table in the DB.

## Worked Example: Request Approval
Here is how we test the logic that prevents a request if the budget is exceeded:

```java
@ExtendWith(MockitoExtension.class)
public class ProcurementServiceTest {
    @Mock
    private BudgetRepository budgetRepo;
    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldRejectRequestWhenBudgetExceeded() {
        // Arrange
        when(budgetRepo.getBalance(101)).thenReturn(50.0);
        
        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> {
            service.submitRequest(101, 100.0);
        });
    }
}
```
In this case, `when(...).thenReturn(...)` simulates the database response. The test confirms that the service correctly throws an exception when the cost (100) exceeds the balance (50).

## Common mistake: confusing an interaction with every outcome
Verification can be a valid behavior assertion when a required side effect is a collaborator call, such as sending a notification. But verifying that save was called does not prove the saved payload was correct or that a database committed it. Assert returned state or exceptions where appropriate, and capture arguments to inspect required side effects. Use a database integration test when the outcome being checked is actual persistence.
## Practical Exercise
**Scenario:** A service method `approveRequest(Long id)` should call `repo.findById(id)` and then `repo.save(request)`. If the request is already approved, it should throw an `IllegalStateException`.

**Task:** How would you test the 'already approved' scenario?

**Answer:** Mock the repository to return a request object where `isApproved()` is true, then use `assertThrows(IllegalStateException.class, ...)` when calling the service method.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
