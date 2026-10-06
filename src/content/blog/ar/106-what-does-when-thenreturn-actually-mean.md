---
title: "شنو كتعني بالضبط when(...).thenReturn(...) ؟"
description: "شرح مفصل كيفاش Mockito كايسيميلي (simulate) الخدمة ديال لي ميتود باش نعزلو الكود فاش كنكونو كنديرو التست."
pubDate: 2026-10-11T01:48:00.000Z
translationKey: 106-what-does-when-thenreturn-actually-mean
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على واحد السيرفيس ديال الشريان (procurement) فين الماناجير خاصو يوافق على طلب. باش تستي هاد اللوجيك ديال الموافقة، ماشي ضروري تكون كونيكطي مع لاباز دو دوني باش تشوف واش الطلب كاين؛ بغيتي غير تفترض بلي راه كاين. هنا فين كينفعنا `when(...).thenReturn(...)`.

## كيفاش خدامة هاد اللعيبة (Stubbing)
فـ Mockito، هاد الطريقة كنسميوها 'stubbing'. فاش كتصاوب mock object، راه كيكون بحال شي قشور خاوية. فالعادة، أي ميتود عيطتي ليها فـ mock كترجع ليك `null` أو `0` أو `false`. الميتود `when()` كتقول لـ Mockito: "رد البال لهاد لابل (call) بالضبط بهاد لي أرجيمون (arguments)". و `thenReturn()` هي اللي كتحدد الجواب اللي بغيتي يرجع. هي كتقطع الطريق على الميتود الحقيقية وكترجع القيمة اللي عطيتيها نتا ديريكت، بلا ما تمشي تنفذ اللوجيك اللي كاين وسط الكلاص.

## مثال تطبيقي: موافقة على طلب شراء
نشوفو `ProcurementService` اللي كيعتمد على `RequestRepository`. بغينا نتأكدو بلي السيرفيس كيرد الطلب 'APPROVED' إلا لقا الطلب فـ repository.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository;

    @InjectMocks
    ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockRequest = new Request(1L, "Laptop");
        // Stubbing: فاش تعيط على repository.findById(1L)، رجع لينا mockRequest
        when(repository.findById(1L)).thenReturn(Optional.of(mockRequest));

        service.approve(1L);
        
        assertEquals("APPROVED", mockRequest.getStatus());
    }
}
```
هنا `thenReturn` خلات السيرفيس يلقى أوبجي كاين باش يخدم عليه، وهكا قدرنا نستيو اللوجيك ديال `approve` بلا ما نحتاجو لاباز دو دوني حقيقية.

## غلط شائع: أرجيمون غالط
بزاف ديال الناس كيديرو stubbing بواحد القيمة، ولكن فاش كيعيطو للميتود فالسيرفيس كيستعملو قيمة خرى. مثلا، إلا درتي `when(repository.findById(1L)).thenReturn(...)` ولكن السيرفيس عيط لـ `repository.findById(2L)`، Mockito غادي يرجع `null` حيت الأرقام ماشي بحال بحال. باش تحل هاد المشكل، استعمل `anyLong()` أو `any()` إلا كان الرقم ما كيهمكش فداك التست.

## تمرين تطبيقي
كيفاش دير stubbing لميتود `checkBudget(Long id)` باش ترجع `false` باش تستي حالة رفض طلب الشراء؟

**الجواب:** `when(budgetService.checkBudget(anyLong())).thenReturn(false);`


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
