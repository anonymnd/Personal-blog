---
title: "@Mock vs @InjectMocks"
description: "Learn how to distinguish between creating mock dependencies and injecting them into the class under test using Mockito."
pubDate: 2026-10-11T00:48:00.000Z
translationKey: 105-mock-vs-injectmocks
locale: en
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are testing a `ProcurementService` that depends on a `RequestRepository` and an `ApprovalClient`. If you try to instantiate the service manually in your test, you end up with a messy constructor and a lot of boilerplate code just to get the test started. This is where Mockito's annotations simplify your setup.

## Understanding @Mock
The `@Mock` annotation creates a simulated instance of a class or interface. It doesn't call the real methods of the object; instead, it creates a 'shell' that returns default values (like null or 0) unless you explicitly tell it how to behave using `when().thenReturn()`. It is used for the dependencies that your service needs to function.

## Understanding @InjectMocks
While `@Mock` creates the dependencies, `@InjectMocks` is used on the actual class you want to test. Mockito will try to instantiate this class and automatically inject all the fields marked with `@Mock` into it. It is important to remember that this is not Spring Dependency Injection; it is a Mockito mechanism that happens during test initialization, without starting a Spring ApplicationContext.

## Worked Example: Procurement Request
Here is how these two work together in a procurement scenario:

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository; // The dependency

    @InjectMocks
    ProcurementService service; // The class under test

    @Test
    void testSubmitRequest() {
        Request req = new Request("Laptop");
        when(repository.save(any())).thenReturn(req);

        service.submitRequest(req);

        verify(repository).save(req);
    }
}
```
In this case, `repository` is a mock. Mockito sees that `ProcurementService` needs a `RequestRepository` and injects the mock into the `service` instance.

## Common Mistake: Swapping Annotations
A frequent error is marking the service under test with `@Mock` and the repository with `@InjectMocks`. If you do this, your service becomes a mock, and calling its methods will do nothing (returning null), leading to tests that pass for the wrong reasons or throw NullPointerExceptions because the real logic is never executed.

## Practical Exercise
If you have a `BuyerService` that depends on a `VendorClient`, which annotation goes on `BuyerService` and which goes on `VendorClient`?

**Answer:** `@InjectMocks` for `BuyerService` (the target) and `@Mock` for `VendorClient` (the dependency).


## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
