---
title: "فهمت أخيراً Mockito"
description: "شرح مبسط كيفاش تعزل الكود ديالك وتخدم بـ doubles باش تيسر التيست."
pubDate: 2026-10-17T19:48:00.000Z
translationKey: 268-i-finally-understand-mockito
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال الوقت كنت كنلف بين object حقيقي و mock. كنت كنصحاب بلي mocking غير باش نهربو من الـ database، ولكن اللحظة لي فهمت فيها كلشي هي ملي عرفت بلي Mockito كايخليك تحكم فـ l'environnement باش تيستي غير طرف واحد ديال الـ logic بوحدو.

## كيفاش خدامة
Mockito كايصاوب واحد الـ 'proxy' ديال الـ class. بلاصت ما يخدم الـ logic لي كاين وسط الـ method، هاد الـ proxy كايحبس الـ call. ومن بعد نتا كتقول ليه بالضبط شنو يرجع باستعمال `when(...).thenReturn(...)`. هادشي كيهنيك من المشاكل ديال السيرفيسات لي يقدروا يطيحو ولا database لي خاصها config صعيبة.

## مثال ديال تطبيق ديال الشراء (Procurement)
تخيل عندنا `ProcurementService` فين الموظف كيدفع طلب شراء. السيرفيس خاصو يتأكد واش كاين budget كافي عن طريق `BudgetService` عاد يسجل الطلب.

```java
// طرف من الكود للتوضيح
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock BudgetService budgetService;
    @InjectMocks ProcurementService procurementService;

    @Test
    void testRequestApproval() {
        Request req = new Request("Laptop", 1200);
        // هنا كنفرضوا على الـ mock يرجع true بلا ما يشوف الـ budget الحقيقي
        when(budgetService.hasEnoughFunds(req)).thenReturn(true);

        boolean result = procurementService.submitRequest(req);
        assertTrue(result);
        verify(budgetService).hasEnoughFunds(req);
    }
}
```
فهاد المثال، حنا ماشي كنتيستيو واش `BudgetService` خدام، ولكن كنتيستيو واش `ProcurementService` كيتصرف صحيح ملي كيكون الـ budget كافي.

## غلط شائع: تـ-mock-ي الـ class لي كتيتيستي
واحد الغلط كيديروه بزاف هو ملي كيديرو `@Mock` للـ class لي بغاو يتيستيو. إلا درتي `@Mock` لـ `ProcurementService` نيت، راك كتعيط لـ proxy خاوي، والتيست غادي يدوز واخا الـ logic ديالك فيه غلط حيت ما تخدمش أصلاً. ديما خدم بـ `@InjectMocks` للـ class لي كتيتيستي و `@Mock` للحوايج لي تابع ليها.

## الفرق بين Verification و Stubbing
الـ Stubbing (`when`) هو فين كتحدد السلوك. الـ Verification (`verify`) هو فين كتأكد واش الـ method تعيطات فعلاً. خدم بـ verify ملي تكون الـ method كترجع `void` ولا ملي يكون الهدف هو تأكد بلي شي حاجة وقعات (مثلاً صيفطتي email).

## تمرين تطبيقي
كيفاش تقدر تيستي حالة فين `BudgetService` كايعطي error (Exception) سميتها `BudgetExceededException`؟

**الجواب:** خدم بـ `when(budgetService.hasEnoughFunds(req)).thenThrow(new BudgetExceededException());` ومن بعد خدم بـ `assertThrows` باش تأكد بلي `ProcurementService` تعامل مع هاد الـ error بطريقة صحيحة.
