---
title: "كيفاش الـ Mocking كيعاونك تعزل الـ Bugs"
description: "تعلم كيفاش تستعمل Mockito باش تفرق بين الـ logic ديالك والـ dependencies باش تعرف بالضبط فين كاين المشكل."
pubDate: 2026-10-11T12:48:00.000Z
translationKey: 117-how-mocking-helps-you-isolate-bugs
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال الشراء (procurement) وكاين واحد الـ request كيتـreject. عندك `ProcurementService` اللي كيعيط لـ `BudgetRepository` باش يشوف واش كاين الفلوس، و `EmailService` باش يصيفط ميساج. ملي الـ test كيفشل، مكاتعرفش واش المشكل فالحساب، ولا فـ SQL، ولا فالسيرفر ديال الإيميل. هاد الروينة هي اللي كتصعب الـ debugging.

## كيفاش كيخدم الـ Isolation
الـ Mocking كيخليك تعوض أي dependency حقيقية بواحد الـ 'double' نتا اللي كتحكم فيه. بلاصة ما تكونيكطا مع base de données حقيقية، كتقول للـ mock شنو يرجع ليك (return). بهاد الطريقة، كتعزل الـ System Under Test (SUT). إلا فشل الـ test ونتا خدام بالـ mocks، كتعرف بلي الـ bug كاين فـ logic ديال الـ SUT ماشي فشي حاجة خارجية.

## تطبيق الـ Isolation بـ Mockito
باستعمال JUnit و Mockito، تقدر تسيميلي سيناريوهات بلا ما تحتاج تـinstalli بيئة معقدة. `@InjectMocks` هي اللي كتصاوب الـ service وكتدخل ليها الـ mocks.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private BudgetRepository budgetRepo;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testRequestApproval() {
        // Arrange: كنقولو ليه يرجع 1000 درهم
        when(budgetRepo.getBalance("DEPT_01")).thenReturn(1000.0);
        
        // Act
        boolean result = service.approveRequest("REQ_123", 500.0);
        
        // Assert
        assertTrue(result);
    }
}
```

## مثال تطبيقي: Bug ديال الصولد صفر
نفترضو أن الكود ديالك فيه bug كيخلي الـ approval دوز واخا الصولد يكون 0.0. إلا درتي mock لـ `budgetRepo.getBalance` باش يرجع `0.0` وشفتي `approveRequest` رجعات `true` (وهي خاصها ترجع `false`)، هنا عرفتي بلي الـ bug كاين غير فـ operator ديال المقارنة (مثلا درتي `>` بلاصة `>=`) فـ Java، بلا ما تحتاج تمشي تشوف الـ DB.

## غلط شائع: Mocking ديال الـ SUT
بزاف ديال الناس كيغلطو ويديرو mock للـ class اللي باغيين يـtestيو. إلا درتي mock لـ `ProcurementService` باش تـtestي `ProcurementService` راك كتـtestي الـ mock ماشي الكود ديالك. ديما دير mock غير للـ *dependencies*.

## تمرين تطبيقي
**سيناريو:** بغيتي تأكد بلي `EmailService` تعيط ليها غير ملي الـ request تـapprouva. شنو هي الـ method ديال Mockito اللي كتستعمل باش تعرف واش شي function تـexecuta؟

**الجواب:** كنستعملو `verify(emailService).sendNotification(any());` باش نتأكدو بلي الـ interaction وقعات.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
