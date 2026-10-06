---
title: "What Does Mockito verify() Actually Test?"
description: "A deep dive into understanding the difference between state verification and interaction verification using Mockito."
pubDate: 2026-10-11T02:48:00.000Z
translationKey: 107-what-does-mockito-verify-actually-test
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have written a test for a procurement service. Your test passes, but you realize you aren't actually checking if the `PurchaseOrderRepository` was called to save the order; you are only checking if the service method returns a success boolean. This is the gap between checking *what* happened (state) and *how* it happened (interaction).

## State vs. Interaction Verification
Most beginners confuse `when().thenReturn()` with `verify()`. While `when()` sets up a precondition (stubbing), `verify()` is an assertion. It does not check the value of a variable or a database record. Instead, it asks Mockito: "Did this specific method on this specific mock object get called with these specific arguments?"

## The Mechanism of verify()
When you call `verify(mock).method()`, Mockito inspects its internal call history. It looks for a match between the method signature and the arguments passed during the execution of the code under test. If the method was never called, or called with different arguments, Mockito throws an `ArgumentsAreDifferent` or `WantedButNotInvoked` error.

## Worked Example: Procurement Approval
Consider a service where a manager approves a request. We need to ensure the `NotificationService` is triggered only after approval.

```java
// Illustrative excerpt
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock NotificationService notificationService;
    @InjectMocks ProcurementService service;

    @Test
    void testApproveRequest() {
        Request request = new Request("Laptop", 1200);
        service.approve(request);
        
        // We verify the interaction occurred
        verify(notificationService).sendEmail(eq("manager@company.com"), anyString());
    }
}
```
In this case, the test fails if `sendEmail` is not called, even if the `approve` method returns `true`.

## Common Mistake: Verifying Stubs
A frequent error is trying to `verify()` a method that was used for stubbing to "confirm" the stub worked. For example, calling `verify(repo).findById(1)` just because you used `when(repo.findById(1)).thenReturn(opt)` is redundant. Use `verify()` for side effects (like sending emails or saving data), not for data retrieval used to drive the test logic.

## Practical Exercise
If you have a method `processOrder()` that should call `repository.save()` exactly once, which Mockito line ensures it wasn't called twice?

**Answer:** `verify(repository, times(1)).save(any());`


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
