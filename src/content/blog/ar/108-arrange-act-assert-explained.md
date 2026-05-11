---
title: "شرح ديال Arrange, Act, Assert"
description: "دليل باش تعلم كيفاش تنظم tests unitaires باستعمال طريقة AAA باش يكون الكود ديالك نقي وسهل فالفهم."
pubDate: 2026-10-11T03:48:00.000Z
translationKey: 108-arrange-act-assert-explained
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المبرمجين كيبداو يكتبو tests مخلطين، كيديرو setup و assertions فدقة وحدة، وهادشي كيخلي الـ test يولي بحال 'سباغيتي' وما كتعرفش بالضبط شنو اللي كيتستى. ملي كيوقع error، كتضيع الوقت باش تفهم الـ test شنو بغا يدير عوض ما تصلح المشكل. هنا فين كتنفع طريقة Arrange, Act, Assert (AAA) حيت كتعطي نظام واضح.

## الركائز ديال AAA

**Arrange** هي المرحلة الأولى. هنا كتوجد كاع داكشي اللي غتحتاج: objects، mocks، و data. مثلا كتحدد شنو خاص Mockito يرجع باستعمال `when()`.

**Act** هي المرحلة ديال التنفيذ. هنا كتعيط للميثود (method) اللي بغيتي تستي. من الأحسن تكون هاد المرحلة فيها غير سطر واحد باش يبقى التركيز على حاجة وحدة.

**Assert** هي المرحلة ديال التأكد. هنا كتشوف واش النتيجة اللي خرجت هي اللي كنتي كتسنى باستعمال JUnit assertions أو `verify()` ديال Mockito باش تأكد بلي واحد الـ interaction وقعات.

## مثال تطبيقي: Approval ديال طلب شراء

تخيل عندنا application ديال procurement، والمدير خاصو يوافق على طلب. بغينا نتأكدو بلي status كتولي 'APPROVED'.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        // Arrange
        Request request = new Request(1L, "Laptop", "PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(request));

        // Act
        service.approve(1L);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```

## غلط شائع: التخليط بين المراحل

واحد الغلط كيديروه بزاف هو كيبقاو يديرو Act و Assert بزاف دالمرات فـ test واحد. مثلا كيعيط لميثود، كيدير assert، ومن بعد كيعيط لميثود أخرى ويدير assert تانية. هادشي كيصعب معرفة فين كاين المشكل بالضبط. الحل هو تقسم هادشي لـ tests صغار، كل واحد متبع نظام AAA.

## تمرين تطبيقي

**السيناريو:** كتب test لميثود `reject()` اللي خاصها ترد الـ status هي 'REJECTED'.

**التأكد:** واش درتي `when()` فـ Arrange، و `service.reject()` فـ Act، و `assertEquals` فـ Assert؟ إذا كان الجواب نعم، راك طبقتي القاعدة صحيحة.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
