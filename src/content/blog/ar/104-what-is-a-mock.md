---
title: "شنو هو الـ Mock؟"
description: "تعلم كيفاش تعزل الكود ديالك فاش تكون كتجرب (Testing) باستعمال Mockito باش تقلد dependencies معقدة."
pubDate: 2026-10-10T23:48:00.000Z
translationKey: 104-what-is-a-mock
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على service ديال الشراء (procurement) فين الموظف كيصيفط طلب. باش تيستي هاد الكود، خاصك تعيط لـ database و API ديال الإيميلات. إلا كان السيرفر ديال الإيميل طايح ولا الـ database خاوية، التيست غادي يفشل—ماشي حيت الكود ديالك غلط، ولكن حيت السيستيمات اللي برا ما خدامينش. هنا فين كينفعنا الـ Mock.

## الفكرة ديال الـ Mocking
الـ Mock هو واحد object كنصاوبوه باش يقلد شي dependency حقيقية. بلاصت ما تستعمل `OrderRepository` حقيقي كيتكونيكطا مع SQL، كتصاوب نسخة 'مزورة'. كتقول لهاد الـ object بالضبط شنو يرجع (return) فاش تعيط لشي method. هادشي كيخليك تيستي غير الـ logic ديالك بوحدو، بلا ما تبرزط راسك مع الريزو ولا الـ database.

## كيفاش نخدمو بـ Mockito
فـ Java، كنستعملو مكتبة Mockito. كنستعملو `@Mock` باش نصاوبو الـ dependency المزورة، و `@InjectMocks` باش نحطو هاد الـ mocks وسط الـ service اللي كنـتيستيو. خاصك تعرف بلي `@InjectMocks` ميزة ديال Mockito ماشي ديال Spring DI، يعني ما كطلعش الـ application context كامل، داكشي علاش التيستات كيكونوا خفاف بزاف.

## مثال تطبيقي: الموافقة على الطلب
ها كيفاش نديرو mock لـ repository باش نشوفو واش manager يقدر يوافق على طلب:

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockReq = new Request(1L, "Laptop");
        // كنحددو شنو يرجع الـ mock
        when(repository.findById(1L)).thenReturn(Optional.of(mockReq));

        service.approve(1L);

        // كنتأكدو بلي الـ service عيطات لـ save
        verify(repository).save(any(Request.class));
    }
}
```
هنا `when(...).thenReturn(...)` كتحدد التصرف ديال الـ mock، و `verify(...)` كتأكد بلي الـ service فعلا حاولت تسجل الطلب اللي توافق عليه.

## غلط شائع: تيستي الـ Mock
بزاف ديال الناس كيغلطو وكيوليو يتيستيو غير واش الـ mock خدام. مثلا، إلا تيستيتي بلي `repository.findById` كيرجع قيمة، راك كتتيستي Mockito ماشي الكود ديالك. ركز ديما على النتيجة النهائية ديال الـ service—مثلا واش الحالة تبدلات من 'PENDING' لـ 'APPROVED'.

## تمرين تطبيقي
إلا بغيتي تيستي method اللي خاصها تلوح (throw) `UserNotFoundException` فاش ما يكونش ID ديال الموظف موجود، كيفاش غادي تـconfiguri الـ mock repository؟

**الجواب:** خاصك تستعمل `when(repository.findById(id)).thenThrow(new UserNotFoundException());` باش تقلد هاد الحالة ديال الخطأ.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
