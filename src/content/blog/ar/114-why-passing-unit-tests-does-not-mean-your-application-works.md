---
title: "علاش ملي كيكونوا Unit Tests خدامين ماشي بالضرورة التطبيق ديالك خدام"
description: "شرح علاش النجاح ديال التستات المعزولة ماشي هو الدليل بلي السيستيم كامل خدام بلا مشاكل."
pubDate: 2026-10-11T09:48:00.000Z
translationKey: 114-why-passing-unit-tests-does-not-mean-your-application-works
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك صاوبتي تطبيق ديال الشريات (procurement) فين الماناجير كيوافق على الطلب. درتي Unit Test لـ `ApprovalService` وخرج ليك بالخضر (Pass). ولكن ملي طلقتي التطبيق، لقتي كلشي حبس حيت السمية ديال الكولون فـ Database ماشي هي اللي كاين فـ Entity. هادي هي «خدعة التست الأخضر»: الكود ديالك منطقياً صحيح بوحدو، ولكن ملي كيتجمع مع لخرين كيوقع مشكل.

## الوهم ديال الـ Mock
فـ Unit Tests، كنستعملو مكتبات بحال Mockito باش نقلدو (simulate) لي ديبوندونس. ملي كتستعمل `@InjectMocks` كيدير ليك نسخة وهمية من الـ repository. وكتحدد ليه شنو يرجع باستعمال `when(...).thenReturn(...)`. هادشي كيبين بلي الجافا ديالك كتعامل مع النتيجة مزيان، ولكن مكيضمنش بلي SQL query غادي تخدم فـ Database حقيقية. راك كتستي غير داكشي اللي كتوقع، ماشي الواقع.

## الفرق بين السلوك (Behavior) والتفاعل (Interaction)
بزاف ديال المطورين كيغلطو وكيستيو غير واش الميثود تعيطات. مثلاً `verify(repository).save(request)` كتقول ليك غير بلي `save` تعيطات، ولكن مكاتقولش ليك واش الداتا تسجلات بصح فـ DB أو واش الـ ORM mapping صحيح. التست يقدر ينجح ولكن الداتا مكاتسجلش حيت نسيتي `@Transactional`.

## مثال تطبيقي: عملية الموافقة
شوف هاد الكود كيفاش كيستي الموافقة على طلب:

```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ApprovalService service;

    @Test
    void testApproveRequest() {
        PurchaseRequest req = new PurchaseRequest(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        verify(repository).save(any());
    }
}
```
النتيجة: التست غادي ينجح. ولكن يلا كانت `PurchaseRequest` فيها غلط فـ `@Column` mapping، التطبيق فـ Production غادي يعطي `PersistenceException` اللي هاد التست مكيشوفهاش.

## غلط شائع: تستي الميثودات الـ Private
كاين اللي كيبغي يوصل لـ 100% coverage وكيحاول يستي الميثودات الـ private. هادشي غلط حيت كيخلي التستات ديالك هشاش؛ غير تبدل سمية ميثود داخلية، التست كيخسر وخا الخاصية باقة خدامة. ديما تستي غير الـ Public API.

## تمرين تطبيقي
سيناريو: عندك تست كيدير Mock لـ `BuyerService` باش يرجع `Success`. التست نجح، ولكن فـ Production السيرفيس رجع `null` ووقع `NullPointerException`.

سؤال: شنو اللي ناقص فـ التستات ديالك؟
جواب: خاصك تزيد Test case على الحالات الاستثنائية (exceptional paths) بحال ملي كيكون الـ return هو null، وتزيد Integration test بسيرفيس حقيقي.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
