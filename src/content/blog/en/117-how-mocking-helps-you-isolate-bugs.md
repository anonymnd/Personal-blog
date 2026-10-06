---
title: "How Mocking Helps You Isolate Bugs"
description: "Learn how to use Mockito to separate your business logic from external dependencies to find exactly where a bug lives."
pubDate: 2026-10-11T12:48:00.000Z
translationKey: 117-how-mocking-helps-you-isolate-bugs
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are debugging a procurement app where a request is being rejected. You have a `ProcurementService` that calls a `BudgetRepository` to check funds and an `EmailService` to notify the requester. When the test fails, you don't know if the bug is in the calculation logic, the database query, or the email server connection. This 'dependency noise' makes debugging a nightmare.

## The Mechanism of Isolation
Mocking allows you to replace a real dependency with a controlled double. Instead of connecting to a real database or API, you tell a mock exactly what to return. By doing this, you isolate the 'System Under Test' (SUT). If the test fails while using mocks, the bug is guaranteed to be in the SUT's logic, not in the external system.

## Implementing Isolation with Mockito
Using JUnit and Mockito, you can simulate specific scenarios without setting up a complex environment. The `@InjectMocks` annotation creates the service and injects the mocked dependencies into it.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private BudgetRepository budgetRepo;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testRequestApproval() {
        // Arrange: Simulate budget availability
        when(budgetRepo.getBalance("DEPT_01")).thenReturn(1000.0);
        
        // Act
        boolean result = service.approveRequest("REQ_123", 500.0);
        
        // Assert
        assertTrue(result);
    }
}
```

## Worked Example: The Negative Balance Bug
Suppose your code has a bug where it allows approvals even if the balance is exactly zero. By mocking `budgetRepo.getBalance` to return `0.0`, you can verify if `approveRequest` returns `false`. If it returns `true`, you've isolated the bug to a comparison operator (e.g., using `>` instead of `>=`) in your Java code, without ever needing a real database.

## Common Mistake: Mocking the SUT
A frequent error is mocking the class you are actually trying to test. If you mock `ProcurementService` while testing `ProcurementService`, you are testing the mock's behavior, not your code. Always mock the *dependencies* and keep the SUT real.

## Practical Exercise
**Scenario:** You need to test that the `EmailService` is called only when a request is approved. Which Mockito method do you use to check if a method was executed?

**Answer:** Use `verify(emailService).sendNotification(any());` to ensure the interaction happened.


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
