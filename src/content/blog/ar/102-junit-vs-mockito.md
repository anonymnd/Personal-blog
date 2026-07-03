---
title: "كيفاش تخدم بـ Mockito بلا ما تخلط بين Interactions و Outcomes"
description: "تعلم كيفاش تعزل الـ logic ديالك باستعمال Mockito وتفرق بين الـ stubbing ديال النتائج و الـ verification ديال التفاعلات فـ scenario ديال notification dispatcher."
pubDate: 2026-10-07T13:48:00.000Z
translationKey: 102-junit-vs-mockito
seriesOrder: 22
locale: ar
tags: ["backend-testing","learning-series"]
draft: false
---

## JUnit vs Mockito: الفرق بين الـ Framework و الـ Tool

بزاف ديال الناس كيغلطو وكيصحاب ليهم JUnit و Mockito حاجة وحدة. JUnit هو الـ test runner و الـ assertion framework؛ هو لي كيعطينا `@Test` و methods بحال `assertEquals` أو `assertThrows`. أما Mockito فهو library ديال الـ mocking، خدمتو يصاوب لينا objects « وهميين » (mocks) باش نعزلو الـ class لي كنـ testيو من الـ dependencies ديالها. يعني إلا كنتي كتخدم بـ JUnit باش تشوف واش القيمة صحيحة، كتخدم بـ Mockito باش تصاوب البيئة لي كتعطي ديك القيمة.

## Injection ديال الـ Mocks بلا Spring

ملي كتخدم بـ `@Mock` و `@InjectMocks` خاصك تعرف بلي هادي ماشي Spring Dependency Injection. ما كاين حتى `ApplicationContext` كيتحل و ما كاين حتى bean scan. Mockito كيخدم غير بـ reflection باش يصاوب الـ class لي فيها `@InjectMocks` و كيحاول يحط فيها كاع الـ mocks لي عندهم نفس الـ type. هادشي كيخلي الـ unit tests يكونو خفاف بزاف حيت ما محتاجينش يشعلو Spring كامل.

## Stubbing vs Verification

الخلط كيوقع بزاف بين `when(...).thenReturn(...)` و `verify(...)`.

1. **الـ Stubbing (النتائج):** `when()` كتحدد جواب وهمي. كتقول لـ mock: « ملي تعيط على هاد الـ method بهاد الـ arguments، رجع ليا هاد القيمة ». هادي خدمتها توفر الـ inputs باش الـ logic لي كنـ testيو يقدر يكمل.
2. **الـ Verification (التفاعلات):** `verify()` كتأكد واش الـ method تعيطات فعلاً. هادي ما كتقولش ليك بلي الداتا تسجلات فـ database أو شي fichier تكتب؛ كتقول ليك غير بلي الـ Java method تعيطات.

حاجة مهمة: ملي كدير `verify` لـ `repository.save(entity)`، هادشي ما كيعنيش بلي الـ entity تسجلات فـ DB حقيقية. كيعني غير بلي الكود حاول يعيط لـ method ديال save. الـ ORM mappings و SQL constraints ما كيتحققوش حتى كتمشي لـ integration tests.

## مثال تطبيقي: Notification Dispatcher

تخيل عندنا `NotificationDispatcher` كيصيفط message عن طريق `PrimaryProvider`. إلا وقع `TemporaryFailureException` فـ الـ primary، خاصو يجرب `FallbackProvider`. وفـ كاع الحالات، خاصو يسجل العملية فـ `AuditService`.

### الـ Implementation

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

### الـ Test Suite

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
        // Stubbing: كنحددو النتيجة ديال الـ primary provider
        doThrow(new TemporaryFailureException()).when(primary).send(msg);

        // Act
        dispatcher.dispatch(msg);

        // Assert/Verify
        // 1. Verify: واش جرب الـ primary؟
        verify(primary, times(1)).send(msg);
        // 2. Verify: واش داز لـ fallback؟
        verify(fallback, times(1)).send(msg);
        // 3. Verify: واش تسجل الـ audit؟
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
        // دابا كنـ checkيو القيمة لي تشدات فعلياً
        org.junit.jupiter.api.Assertions.assertEquals("target@domain.com", captor.getValue());
    }
}
```

### تحليل الـ Artifact
- **`doThrow().when()`**: خدمنا بيها حيت `send()` ما كترجع والو (void). هادي قاعدة مهمة فـ Mockito.
- **`verifyNoInteractions(fallback)`**: هادي كتثبت بلي الـ logic ما مشاش لـ fallback ملي الـ primary خدم مزيان. باش تـ testي بلي شي حاجة « ما وقعاتش » مهم بحال ملي تـ testي بلي « وقعات ».
- **`ArgumentCaptor`**: بلاصة ما نقولو غير بلي شي string داز، الـ captor كيخلينا نشوفو بالضبط شنو هو الـ recipient لي تصيفط لـ audit service.

## تمرين

**السيناريو:** بدل الـ `NotificationDispatcher` باش إلا حتى الـ `FallbackProvider` فشل، يلوح `CriticalNotificationException`.

**المطلوب:** كتب test case كيدير stub لـ `primary` و `fallback` بجوج باش يلوحو `TemporaryFailureException` وتأكد بلي `CriticalNotificationException` تلوحات، وفي نفس الوقت تأكد بلي `audit.recordRequest()` تعيطات.

**الجواب:**
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

## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
