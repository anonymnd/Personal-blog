---
title: "Use Mockito Without Confusing Interactions with Outcomes"
description: "Learn to isolate logic using Mockito by distinguishing between stubbing outcomes and verifying interactions in a notification dispatcher scenario."
pubDate: 2026-10-07T13:48:00.000Z
translationKey: 102-junit-vs-mockito
seriesOrder: 22
locale: en
tags: ["backend-testing","learning-series"]
draft: false
---

## JUnit vs Mockito: The Framework and the Tool

A common misconception is treating JUnit and Mockito as the same thing. JUnit is the test runner and assertion framework; it provides the `@Test` annotation and the `assertEquals` or `assertThrows` methods. Mockito is a mocking library that creates 'fake' objects to isolate the class under test from its dependencies. If you use JUnit to check if a value is correct, you use Mockito to simulate the environment that produces that value.

## Mock Injection Without Spring

When using `@Mock` and `@InjectMocks`, it is vital to remember that this is not Spring Dependency Injection. No ApplicationContext is started, and no beans are scanned. Mockito simply uses reflection to instantiate the class marked with `@InjectMocks` and attempts to plug in any fields marked with `@Mock` that match the required types. This allows for lightning-fast unit tests that don't require a heavy framework boot-up.

## Stubbing vs. Verification

Confusion often arises between `when(...).thenReturn(...)` and `verify(...)`. 

1. **Stubbing (Outcomes):** `when()` configures a simulated response. It tells the mock: "When this method is called with these arguments, return this specific value." This is about providing the inputs necessary for the logic under test to proceed.
2. **Verification (Interactions):** `verify()` checks if a method was actually called. It does not check if the data was saved to a database or if a file was written; it only proves that the Java method was invoked. 

Crucially, verifying a call to `repository.save(entity)` does not prove the entity is persisted in a real DB. It only proves the code attempted to call the save method. ORM mappings, SQL constraints, and transaction boundaries remain untested until you move to integration tests.

## Worked Example: Notification Dispatcher

Consider a `NotificationDispatcher` that sends a message via a `PrimaryProvider`. If the primary provider throws a `TemporaryFailureException`, it must try a `FallbackProvider`. Regardless of the outcome, it must record an audit log via an `AuditService`.

### The Implementation

```java
public record Message(String recipient, String content) {}

public class NotificationDispatcher {
    private final PrimaryProvider primary;
    private final FallbackProvider fallback;
    private final AuditService audit;

    public NotificationDispatcher(PrimaryProvider primary, FallbackProvider fallback, AuditService audit) {
        this.primary = primary;
        this.fallback = fallback;
        this.audit = audit;
    }

    public void dispatch(Message msg) {
        try {
            try {
                primary.send(msg);
            } catch (TemporaryFailureException e) {
                fallback.send(msg);
            }
        } catch (TemporaryFailureException e) {
            throw new CriticalNotificationException("Both providers failed", e);
        } finally {
            audit.recordRequest(msg.recipient());
        }
    }
}
```

### The Test Suite

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationDispatcherTest {

    @Mock PrimaryProvider primary;
    @Mock FallbackProvider fallback;
    @Mock AuditService audit;

    @InjectMocks NotificationDispatcher dispatcher;

    @Test
    void shouldUseFallbackOnTemporaryFailureAndAudit() {
        // Arrange
        Message msg = new Message("user@test.com", "Hello");
        // Stubbing: Define the outcome of the primary provider
        doThrow(new TemporaryFailureException()).when(primary).send(msg);

        // Act
        dispatcher.dispatch(msg);

        // Assert/Verify
        // 1. Verify interaction: Did it try the primary?
        verify(primary, times(1)).send(msg);
        // 2. Verify interaction: Did it switch to fallback?
        verify(fallback, times(1)).send(msg);
        // 3. Verify interaction: Was the audit recorded?
        verify(audit, times(1)).recordRequest("user@test.com");
    }

    @Test
    void shouldNotUseFallbackOnSuccess() {
        Message msg = new Message("user@test.com", "Hello");
        
        dispatcher.dispatch(msg);

        verify(primary).send(msg);
        verifyNoInteractions(fallback);
        verify(audit).recordRequest(anyString());
    }

    @Test
    void shouldCaptureAuditRecipient() {
        Message msg = new Message("target@domain.com", "Alert");
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);

        dispatcher.dispatch(msg);

        verify(audit).recordRequest(captor.capture());
        // Now we check the actual value captured during the interaction
        org.junit.jupiter.api.Assertions.assertEquals("target@domain.com", captor.getValue());
    }
}
```

### Analysis of the Artifact
- **`doThrow().when()`**: Used instead of `when().thenThrow()` because `send()` returns void. This is a critical Mockito syntax distinction.
- **`verifyNoInteractions(fallback)`**: This proves the logic correctly bypassed the fallback when the primary succeeded. Testing the *absence* of a call is as important as testing the presence of one.
- **`ArgumentCaptor`**: Instead of just verifying that *some* string was passed, the captor allows us to inspect the exact argument passed to the audit service, ensuring the correct recipient was logged.

## Exercise

**Scenario:** Modify the `NotificationDispatcher` so that if the `FallbackProvider` also fails, a `CriticalNotificationException` is thrown. 

**Task:** Write a test case that stubs both `primary` and `fallback` to throw `TemporaryFailureException` and asserts that the `CriticalNotificationException` is thrown, while still verifying that the `audit.recordRequest()` was called.

**Answer:**
```java
@Test
void shouldThrowCriticalExceptionWhenBothFailButStillAudit() {
    Message msg = new Message("user@test.com", "Hello");
    doThrow(new TemporaryFailureException()).when(primary).send(msg);
    doThrow(new TemporaryFailureException()).when(fallback).send(msg);

    org.junit.jupiter.api.Assertions.assertThrows(CriticalNotificationException.class, () -> {
        dispatcher.dispatch(msg);
    });

    verify(audit).recordRequest("user@test.com");
}
```

## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
