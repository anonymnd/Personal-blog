---
title: "كيفاش تيستي واش Exception تلاحت"
description: "تعلم كيفاش تأكد بلي التطبيق ديالك كيتعامل مع الأخطاء بشكل صحيح باستعمال assertThrows ديال JUnit 5."
pubDate: 2026-10-11T07:48:00.000Z
translationKey: 112-how-to-test-that-an-exception-is-thrown
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement system) فين الموظف كيصيفط طلب شراء. عندك قاعدة كتقول بلي الطلب ما يمكنش يتصيفط إلا كان المبلغ بالسالب. نتا كتبتي الكود باش يلوح `IllegalArgumentException` فاش يكون المبلغ سالب، ولكن كيفاش تأكد فـ Test بلي هاد الـ Exception فعلاً كتوقع؟ بزاف ديال المبتدئين كيستعملو try-catch وسط الـ tests، وهادشي كيخلي الكود طويل ومعقد بلا فايدة.

## كيفاش خدامة assertThrows
JUnit 5 عطاتنا واحد الـ method سميتها `assertThrows` لهاد الغرض بالضبط. بلاصة ما نخليو الـ test يطيح (crash)، `assertThrows` كتشد الـ exception. كنعطيوها جوج حاجات: النوع ديال الـ exception اللي كنتسناو، وواحد الـ lambda expression فيها الكود اللي خاصو يدير الخطأ. إلا تلاحت الـ exception اللي حددنا، الـ test كيدوز (pass)؛ وإلا ما وقع والو، الـ test كيفشل.

## مثال تطبيقي: Validation ديال الطلب
نشوفو `RequestService` اللي كيتأكد من المبلغ ديال الطلب قبل ما يعالجو.

```java
public class RequestService {
    public void submitRequest(double amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        // Logic for submission
    }
}
```

باش نتيستيو هادشي، كنستعملو `assertThrows` باش نتأكدو بلي المبلغ السالب كيطلع الخطأ:

```java
@Test
void shouldThrowExceptionWhenAmountIsNegative() {
    RequestService service = new RequestService();
    
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
        service.submitRequest(-100.0);
    });
    
    assertEquals("Amount cannot be negative", exception.getMessage());
}
```
هنا الـ test كيأكد بلي السيستيم كيمنع البيانات الغالطة وكيعطي ميساج واضح.

## غلط شائع: استعمال try-catch
بزاف كيغلطو وكيديرو try-catch وكيعيطو لـ `fail()` فالاخير. هاد الطريقة قديمة وكتصعب القراءة ديال الـ test.

**غلط:**
```java
try {
    service.submitRequest(-1);
    fail("Should have thrown exception");
} catch (IllegalArgumentException e) {
    // pass
}
```
**التصحيح:** استعمل `assertThrows`. هي قصيرة وكتبيّن بلي الـ exception هي اللي بغيناها توقع أصلاً.

## تمرين تطبيقي
صاوب method سميتها `approveRequest(Request req)` اللي كتلوح `NullPointerException` إلا كان الـ request هو null. كتب test بـ JUnit 5 باش تأكد من هادشي.

**الجواب:** الـ test ديالك خاص يكون فيه `assertThrows(NullPointerException.class, () -> service.approveRequest(null));`.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
