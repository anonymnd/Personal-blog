---
title: "كيفاش تستي ميثود CREATE"
description: "تعلم كيفاش تعزل وتأكد من الخدمة ديال ميثود create باستعمال JUnit و Mockito."
pubDate: 2026-10-11T04:48:00.000Z
translationKey: 109-how-to-test-a-create-method
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيجيهم صعيب يستييو ميثود 'create' حيت كيحاولوا يتكونيكتاو مع قاعدة بيانات حقيقية، وهذا كيخلي التيست يكون ثقيل ومكيبقاش مستقر. الهدف هو نتأكدوا بلي الـ service logic كيتعامل مع الداتا اللي داخلة بشكل صحيح وكيصيفطها للـ repository، بلا ما نحتاجو نشوفو واش تسجلات فعلاً فالداتابيز.

## استراتيجية الـ Mocking
باش نستييو ميثود create بوحدها، كنستعملو Mockito باش نديرو محاكاة (simulation) للـ repository. باستعمال `@InjectMocks` كنعلمو Mockito يصاوب instance ديال الـ service ويدخل فيها الـ mocks اللي صاوبنا. هاد الطريقة كتخلي التيست يخدم بسرعة حيت مكنحتاجوش نطلعو Spring context كامل.

## تطبيق التيست
نتخيلو تطبيق ديال المشتريات (procurement app) فين الموظف كيصيفط طلب `PurchaseRequest`. الـ service خاصو يتأكد من الطلب قبل ما يسجلو.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldCreateRequestSuccessfully() {
        PurchaseRequest request = new PurchaseRequest("Laptop", 1200.0);
        // كنقولو ليه: ملي تعيط على save، رجع ليا هاد الـ request
        when(repository.save(any(PurchaseRequest.class))).thenReturn(request);

        PurchaseRequest result = service.createRequest(request);

        assertNotNull(result);
        assertEquals("Laptop", result.getItem());
        verify(repository, times(1)).save(request);
    }
}
```

## كيفاش نتأكدوا من النتيجة
فالمثال اللي فوق، `when(...).thenReturn(...)` كيدير دور الداتابيز. الـ `verify` مهمة بزاف حيت هي اللي كتقول لينا واش ميثود `save` تعيطات فعلاً. بلا بيها، التيست يقدر ينجح وخا الـ service نسا ما يعيطش للـ repository، مادام رجع شي حاجة ماشي null.

## غلط شائع: تستي الـ Mock
واحد الغلط كيديروه بزاف هو ملي كيحاولوا يتأكدوا واش الداتا تسجلات فالداتابيز. خاصك تعرف بلي Mockito مكيقيسش الداتابيز الحقيقية. إلا جربتي تشوف واش كاين record فـ table، التيست غادي يفشل. ركز فقط على واش الـ service صيفط الداتا الصحيحة للـ mock.

## تمرين تطبيقي
كيفاش تقدر تستي حالة فين ميثود `createRequest` خاصها تلوح exception إلا كان السمية ديال المنتج null؟

**الجواب:** استعمل `assertThrows(IllegalArgumentException.class, () -> service.createRequest(nullRequest))` وتأكد بلي `repository.save()` ماتعيطاتش كاع باستعمال `verify(repository, never()).save(any())`.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
