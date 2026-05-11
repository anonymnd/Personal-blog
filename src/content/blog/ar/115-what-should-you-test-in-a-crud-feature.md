---
title: "شنو خاصك تيستي فـ CRUD Feature؟"
description: "دليل باش تعرف أهم الحالات لي خاصك تيستيها فـ Create, Read, Update, و Delete باستعمال JUnit و Mockito."
pubDate: 2026-10-11T10:48:00.000Z
translationKey: 115-what-should-you-test-in-a-crud-feature
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال لي ديفلوبور كيبداو التيست غير باش يشوفو واش الداتا تسيفات فـ base de données، ولكن كيساو الحالات لي كيطراو فيها مشاكل. مثلا، شنو يوقع يلا شي واحد بغا يبدل طلب شراء (procurement request) ما كاينش أصلا، ولا صيفط طلب فيه ثمن بالسالب؟ يلا تيستيتي غير 'الطريق السهلة' (happy path)، التطبيق ديالك يقدر يطيح فـ production.

## جدول التيستات ديال CRUD
فاش تكون كتيتيست CRUD، خاصك تشوف الحالة لي خدامة والحالة لي فيها غلط. فـ تطبيق ديال الشراء، خاصك تيستي واش الموظف قدر يصيفط الطلب، واش المانجر قدر يوافق عليه.

| العملية | الحالة الناجحة | حالة الخطأ |
| :--- | :--- | :--- |
| Create | داتا صحيحة تسيفات | داتا مكررة ولا خانات خاوية |
| Read | لقا الطلب بـ ID | ID ما كاينش (404) |
| Update | تبدلو المعلومات صح | تبديل حالة (status) ما مسموحش فيها التغيير |
| Delete | تمسح الطلب | مسح شي حاجة ديجا ممسوحة |

## كيفاش تخدم Mockito فـ Service Tests
باش تيستي logic بلا ما تخدم base de données حقيقية (حيت تقيلة)، كنخدمو Mockito. `@InjectMocks` كتدير instance للـ service وكتدخل ليها الـ repository لي درنا ليه mock.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testCreateRequest_Success() {
        Request req = new Request("Laptop", 1200.0);
        when(repository.save(any())).thenReturn(req);
        
        Request result = service.createRequest(req);
        
        assertNotNull(result);
        verify(repository).save(req);
    }
}
```

## التعامل مع حالة 'ما لقيت والو'
واحد الغلط شائع هو أننا كنساو نتيستيو الـ exception. يلا `repository.findById()` رجعات Optional خاوي، الـ service خاصو يلوح exception خاصة، ماشي `NullPointerException` لي كتطيح السيستيم.

**الغلط:** تيستي `findById` غير بـ ID صحيح.
**التصحيح:** خدم `when(repository.findById(id)).thenReturn(Optional.empty())` وتأكد بـ `assertThrows` أن الـ service كيخرج `ResourceNotFoundException`.

## تيست ديال تبدال الحالة (State Transitions)
فـ procurement، الطلب ما يمكنش يدوز من 'Draft' لـ 'Ordered' بلا ما يدوز من 'Approved'. التيستات ديالك خاصهم يتأكدو أن الـ service كيرفض أي انتقال غلط فـ الحالة، باش تضمن أن القواعد ديال البيزنس محترمة قبل ما توصل الداتا لـ DB.

## تمرين تطبيقي
**السيناريو:** كتب تيست لـ method سميتها `deleteRequest`. شنو خاص يوقع يلا كان الـ ID لي عطيتي ما كاينش فـ base de données؟

**الجواب:** خاصك تدير mock للـ repository باش يرجع Optional خاوي، ومن بعد تخدم `assertThrows` باش تأكد أن الـ service كيخرج exception بحال `RequestNotFoundException` عوض ما يسالي عادي بلا ما يدير والو.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
