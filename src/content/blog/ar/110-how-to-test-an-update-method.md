---
title: "كيفاش تستي (Test) ميثود ديال UPDATE"
description: "تعلم كيفاش تأكد بلي الـ service ديالك كيحدث البيانات بشكل صحيح باستعمال JUnit و Mockito بلا ما تحتاج قاعدة بيانات حقيقية."
pubDate: 2026-10-11T05:48:00.000Z
translationKey: 110-how-to-test-an-update-method
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال المشتريات (procurement app). عندك واحد الميثود كتحول الحالة ديال الطلب من 'PENDING' لـ 'APPROVED'. المشكل هو أنك ما بغيتيش تبقى تكونيكطا مع قاعدة بيانات حقيقية كل مرة درتي test، حيت غيكون داكشي تقيل وماشي مستقر. خاصك غير تأكد بلي الـ business logic ديالك كيعيط على الـ repository بطريقة صحيحة.

## المنطق ديال تيست الـ Update
باش تستي ميثود ديال update، ما كنشوفوش واش السطر تبدل فـ SQL، ولكن كنشوفو التفاعل بين الـ service والـ repository. خاصنا نتأكدو بلي الـ service لقى الـ entity، بدل المعلومات اللي بغينا، ومن بعد عيط على save.

## كيفاش نقادو البيئة ديال Mock
كنستعملو JUnit و Mockito، وكنديرو `@InjectMocks` للـ service و `@Mock` للـ repository. رد بالك بلي `@InjectMocks` ماشي هي Spring DI، هي غير كتحط الـ mocks فالبلاصة ديالهم فـ l'objet.

## مثال تطبيقي: الموافقة على طلب
هاك مثال بسيط كيفاش تستي `PurchaseRequestService`:

```java
@ExtendWith(MockitoExtension.class)
class PurchaseRequestServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private PurchaseRequestService service;

    @Test
    void testApproveRequest_Success() {
        // Arrange
        Long id = 1L;
        PurchaseRequest request = new PurchaseRequest(id, "Laptop", "PENDING");
        when(repository.findById(id)).thenReturn(Optional.of(request));

        // Act
        service.approveRequest(id);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```
فهاد المثال، `when` كتخلينا نتخيلو بلي لقينا الطلب، و `verify` كتأكد بلي ميثود `save` تعيطات فعلاً.

## غلط شائع: تيست الـ Mock
بزاف ديال الناس كيغلطو وكيحساب ليهم `verify` كتقول لينا بلي الداتا تسجلات فـ database. Mockito كيعرف غير واش الميثود تعيطات ولا لا. إلا بغيتي تيستي SQL حقيقي، خاصك تخدم بـ `@DataJpaTest` مع H2 database.

## تمرين تطبيقي
**السيناريو:** كتب test case لميثود سميتها `updateQuantity(Long id, int newQty)` اللي خاصها تلوح `ResourceNotFoundException` إلا كان الـ ID ما كاينش.

**الجواب:** خاصك تستعمل `when(repository.findById(id)).thenReturn(Optional.empty())` وتستعمل `assertThrows(ResourceNotFoundException.class, () -> ...)` باش تأكد بلي l'exception تلوحات.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
