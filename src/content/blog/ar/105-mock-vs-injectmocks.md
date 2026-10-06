---
title: "الفرق بين @Mock و @InjectMocks"
description: "تعلم الفرق بين كيفاش تصاوب mock ديال dependencies وكيفاش تدخلهوم ف الكلاص لي بغيتي تستي باستعمال Mockito."
pubDate: 2026-10-11T00:48:00.000Z
translationKey: 105-mock-vs-injectmocks
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على `ProcurementService` لي كيحتاج `RequestRepository` و `ApprovalClient` باش يخدم. إلا بغيتي تصاوب instance ديال service بيدك ف التست، غادي تضطر تكتب بزاف ديال الكود غير باش تبدا. هنا فين كينفعونا annotations ديال Mockito باش ينقصو علينا تمارة.

## شنو هو @Mock
الـ `@Mock` كايصاوب لينا نسخة وهمية (simulated instance) من شي class أو interface. هاد النسخة ما كاتخدمش الميثودات الحقيقية، ولكن كاتكون بحال واحد القشور لي كيرجعو قيم افتراضية (بحال null أو 0)، إلا إذا قلتي ليه شنو يرجع باستعمال `when().thenReturn()`.

## شنو هو @InjectMocks
فالوقت لي `@Mock` كايصاوب dependencies، `@InjectMocks` كانديروها ف الكلاص لي بغينا نستيو (the class under test). Mockito كايحاول يصاوب instance من هاد الكلاص وكيدخل فيها أوتوماتيكيا كاع لي ماركينا بـ `@Mock`. خاصك تعرف بلي هادي ماشي هي Spring DI، هادي غير طريقة ديال Mockito كاتوقع فاش كيبدا التست، بلا ما يخدم Spring ApplicationContext.

## مثال تطبيقي: طلب شراء
شوف كيفاش كنخدمو بيهم بجوج ف حالة ديال procurement:

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository; // dependency وهمية

    @InjectMocks
    ProcurementService service; // الكلاص لي كنستيو

    @Test
    void testSubmitRequest() {
        Request req = new Request("Laptop");
        when(repository.save(any())).thenReturn(req);

        service.submitRequest(req);

        verify(repository).save(req);
    }
}
```
هنا `repository` هو mock. Mockito كيشوف بلي `ProcurementService` محتاج `RequestRepository` وكيدخلو ليه ف الـ `service`.

## غلط شائع: تقليب annotations
بزاف ديال الناس كيغلطو وكيديرو `@Mock` ف السيرفيس لي بغاو يستيو، و `@InjectMocks` ف الـ repository. إلا درتي هكا، السيرفيس ديالك كيولي mock، يعني الميثودات ديالو ما غادي يديرو والو، والتست يقدر يدوز وخا الكود ما خدامش، أو يعطيك NullPointerException حيت اللوجيك الحقيقية ما تخدماتش.

## تمرين تطبيقي
إلا كان عندك `BuyerService` كيعتمد على `VendorClient` ، شكون فيهم لي غانديرو ليه `@InjectMocks` وشكون لي غانديرو ليه `@Mock` ؟

**الجواب:** `@InjectMocks` لـ `BuyerService` (حيت هو لي كنستيو) و `@Mock` لـ `VendorClient` (حيت هو dependency).


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
