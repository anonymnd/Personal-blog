---
title: "علاش خاصك تتيستي الـ Service Layer؟"
description: "فهم علاش التيست ديال الـ service layer مهم باش تعزل الـ business logic على المشاكل ديال الـ infrastructure."
pubDate: 2026-10-10T20:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على app ديال الشرا (procurement) فين الموظف كيصيفط طلب شراء. هاد العملية فيها بزاف ديال الشروط: خاص السيستيم يشوف واش كاين الميزانية، واش هاد السلعة مسموح بها، وعاد يعلم المدير. إلا تيستيتي غير الـ Controller (API) ولا الـ Repository (Database)، غادي تبقى واحد الفجوة فين الـ business rules—لي هي القلب ديال app—ماتكونش مأكدة واش خدامة مزيان.

## الدور ديال الـ Service Layer
الـ service layer هي اللي كتنظم كلشي. الـ Controller كيتكلف بـ HTTP والـ Repository كيتكلف بـ SQL، ولكن الـ Service هي اللي كتقرر *شنو* غادي يوقع. ملي كنتيستي هاد الطبقة، كتقدر تأكد من القواعد ديال الخدمة بلا ما تحتاج قاعدة بيانات حقيقية ولا سيرفر خدام، وهادشي كيخلي التيستات سريعة بزاف.

## عزل الـ Logic باستعمال Mockito
باش نتيستيو الـ service بوحدها، كنستعملو Mockito. بلاصت ما نتصلو بـ DB حقيقية، كنديرو 'mock' للـ repository. هكذا، إلا طاح التيست، كنعرفو بلي المشكل كاين في الـ business logic ماشي حيت الـ DB طافية ولا كاين مشكل في الكونيكسيون.

## مثال تطبيقي: الموافقة على الطلب
ها كيفاش نتيستيو الـ logic اللي كتمنع الطلب إلا كانت الميزانية ماكافياش:

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
هنا `when(...).thenReturn(...)` كتمثل لينا الجواب اللي غادي يجي من الـ DB. التيست كيتأكد بلي الـ service كتلوح exception ملي كيكون الثمن (100) كبر من الصولد (50).

## غلط شائع: العيطة ما كتعنيش كل النتيجة
Verify تقدر تكون اختبار صحيح ديال السلوك إلا كانت النتيجة المطلوبة هي عيطة لـ collaborator، بحال تصيفط notification. ولكن غير تتأكد بلي save تعيطات ما كيثبتش بلي المعطيات صحيحة ولا بلي database دارت commit. تحقق من الحالة اللي رجعات ولا من exception إلا كان هادشي مناسب، وشد arguments باش تشوف النتائج الجانبية المطلوبة. إلا كنتي باغي تثبت التخزين الحقيقي، دير integration test مع database.
## تمرين تطبيقي
**السيناريو:** ميثود `approveRequest(Long id)` خاصها تعيط لـ `repo.findById(id)` ومن بعد `repo.save(request)`. إلا كان الطلب ديجا مقبول، خاصها تلوح `IllegalStateException`.

**السؤال:** كيفاش تتيستي الحالة ديال 'ديجا مقبول'؟

**الجواب:** دير mock للـ repository باش يرجع request object فيه `isApproved()` هي true، ومن بعد استعمل `assertThrows(IllegalStateException.class, ...)` ملي تعيط للميثود ديال الـ service.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
