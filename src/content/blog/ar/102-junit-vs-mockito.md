---
title: "الفرق بين JUnit و Mockito"
description: "فهم الفرق الأساسي بين framework ديال التيست و library ديال simulation باش تصاوب unit tests معزولين."
pubDate: 2026-10-10T21:48:00.000Z
translationKey: 102-junit-vs-mockito
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على service ديال الشراء (procurement) فين الموظف كيصيفط طلب. باش تيستي هاد الـ logic، خاصك `RequestRepository` باش تسجل البيانات و `EmailService` باش تعلم manager. إلا خدمتي بـ database حقيقية و server ديال email، التيست غادي يولي ثقيل وكيوقع فيه مشاكل بزاف. هنا فين كيوقع خلط بين JUnit و Mockito.

## Framework مقابل Library
JUnit هو الساس؛ هو framework ديال التيست اللي كيعطيك الـ runner، و assertions (بحال `assertEquals`) و annotations ديال lifecycle (بحال `@BeforeEach`). هو اللي كيقول لينا واش التيست داز (pass) ولا سقط (fail). أما Mockito، فهو library ديال simulation. ما كيشغلش التيست، ولكن كيصاوب نسخ "مزورة" (mocks) ديال objects معقدين باش تعزل غير الـ class اللي بغيتي تيستي.

## كيفاش كيخدم العزل (Isolation)
Mockito كيخليك تحكم في التصرف ديال dependencies. باستعمال `@Mock` كتصاوب object وهمي. و بـ `@InjectMocks` كيحاول Mockito يدخل هاد الـ mocks وسط الـ service ديالك. خاصك تعرف بلي `@InjectMocks` ماشي هي Spring DI؛ ما كتشعلش Spring context، ولكن غير كتستعمل reflection باش تحط الـ mocks في بلاصتهم.

## مثال تطبيقي: الموافقة على الطلب
نشوفو `ProcurementService` اللي كيوافق على الطلب إلا كان الثمن قل من 1000$.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(100, "Laptop");
        // كنحددو شنو يرجع الـ mock
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        // كنتأكدو بلي الـ service عيطات على save
        verify(repository).save(any(Request.class));
    }
}
```
هنا `when()` كتحدد السلوك، و `verify()` كتأكد بلي الـ repository تعيطات ليه باش يسجل. حنا ما كنقلبووش واش الداتا تسجلات بصح في DB، ولكن واش الـ service حاول يسجلها.

## غلط شائع: تيستي الـ Mock
بزاف ديال الناس كيستعملو `verify()` باش يشوفو واش شي قيمة تبدلات وسط الـ mock. الـ mocks غير قشور؛ ما عندهمش state بحال database حقيقية. إلا بغيتي تعرف واش شي field تبدل، شوف الـ argument اللي تصيفط للـ mock.

## تمرين تطبيقي
إلا بغيتي تيستي كيفاش الـ service كيتعامل مع `UserNotFoundException` ملي الـ repository كيرجع `Optional` خاوي، شنو هي méthode ديال Mockito اللي خاصك تستعمل باش تسيمولي هاد الحالة؟

**الجواب:** استعمل `when(repository.findById(id)).thenReturn(Optional.empty());` ومن بعد استعمل `assertThrows()` ديال JUnit باش تأكد من الـ exception.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
