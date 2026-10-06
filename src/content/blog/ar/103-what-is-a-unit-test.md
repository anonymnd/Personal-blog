---
title: "شنو هو الـ Unit Test؟"
description: "دليل للمبتدئين باش يفهمو أصغر وحدة ديال التيست فالسوفتوير باستعمال JUnit و Mockito."
pubDate: 2026-10-10T22:48:00.000Z
translationKey: 103-what-is-a-unit-test
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك صاوبتي سيستيم ديال الشراء (procurement) فين الموظف كيصيفط طلب شراء. بغيتي تأكد بلي الحساب ديال الثمن الإجمالي صحيح، ولكن ما بغيتيش تخدم لاباز دو دوني (database) كاملة، والـ security، والسيرفور غير باش تشيك عملية جمع بسيطة. هنا فين كيجي الدور ديال الـ Unit Test.

## الفكرة الأساسية
الـ Unit Test كيركز على أصغر طرف ممكن يتستى فالسوفتوير، غالباً كتكون ميثود (method) وحدة فشي كلاص. الهدف هو نعزلو هاد "الوحدة" على أي حاجة أخرى مرتبطة بيها. مثلاً، إلا كان السيرفيس ديالك كيحتاج لاباز دو دوني، ما كنخدموش بواحدة حقيقية، ولكن كنخدمو بـ "mock" باش نقلدو السلوك ديالها. هكا، إلا طاح التيست، كنعرفو بلي المشكل كاين فـ logic ديالنا ماشي فـ réseau ولا فـ configuration ديال لاباز.

## الأدوات: JUnit و Mockito
فـ Java، كنخدمو بـ JUnit باش نلونصيو التيستات ونشوفو واش النتيجة صحيحة. و Mockito هي مكتبة كنصاوبو بيها الـ mocks. وخا كنستعملو `@InjectMocks` باش نجمعو السيرفيس مع الـ mocks، خاصك تعرف بلي هادي ماشي هي Spring DI، حيت ما كتلونصيش الـ Spring context، داكشي علاش التيستات كيكونوا خفاف بزاف.

## مثال تطبيقي: الموافقة على الطلب
تخيل عندنا `RequestService` اللي كيوافق على الطلب غير إلا كان الثمن قل من 1000 دولار.

```java
@ExtendWith(MockitoExtension.class)
class RequestServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private RequestService service;

    @Test
    void testApproveRequest_UnderLimit_ReturnsTrue() {
        Request req = new Request(100, "Laptop Mouse");
        // كنحددوا شنو يرجع الـ mock
        when(repository.findById(1L)).thenReturn(Optional.of(req));

        boolean result = service.approve(1L);

        assertTrue(result);
        verify(repository).save(any());
    }
}
```
فهاد المثال، `when(...).thenReturn(...)` كتقول لـ Mockito كيفاش يتصرف. و `verify` كتأكد بلي الميثود `save` تعيطات ليها، بلا ما نحتاجو نكتبو شي حاجة فعلياً فـ disque.

## غلط شائع: تيست ديال الـ Private Methods
بزاف ديال المبتدئين كيحاولوا يتستاو الـ private methods. هادشي غلط حيت كيخلي التيست مرتبط بزاف بالتفاصيل الداخلية ديال الكود. من الأحسن تستى الـ public method اللي كتعيط لهاديك الـ private. إلا كان السلوك الخارجي صحيح، راه الـ logic الداخلي حتى هو صحيح.

## تمرين تطبيقي
**السيناريو:** صاوب تيست للميثود `rejectRequest(Long id)` اللي خاصها تلوح `RequestNotFoundException` إلا كان الـ repository رجع Optional خاوي.

**الحل:** خاصك تستعمل `when(repository.findById(id)).thenReturn(Optional.empty())` وتدير السيرفيس وسط `assertThrows(RequestNotFoundException.class, () -> ...)`.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
