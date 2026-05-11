---
title: "الفرق بين Unit Tests و Integration Tests"
description: "دليل باش تفرق بين التيست ديال المنطق المعزول (Unit) والتيست ديال الربط بين المكونات (Integration)."
pubDate: 2026-10-11T08:48:00.000Z
translationKey: 113-unit-tests-vs-integration-tests
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل صاوبتي سيستيم ديال الشراء (procurement) فين خاص الماناجير يوافق على الطلب عاد يقدر الشاري يدوز الكوموند. كتبتي الكود، ولكن دابا حرتي: واش تيستي غير الميثود ديال الموافقة بوحدها، ولا تطلق السيركوي كامل من لاباز دو دوني حتى لـ API؟ هاد الحيرة هي لي كتخلي التيستات يولو تقال وكيطيحو بلا سبب واضح.

## شنو هما الـ Unit Tests
الـ Unit tests كيركزو على أصغر طرف من الكود، غالباً ميثود وحدة. الهدف هو نتأكدو من المنطق (business logic) بلا ما نحتاجو لحوايج خارجية. باش نديرو هادشي، كنستعملو Mockito باش نسيميلييو (simulate) الخدمة ديال الكلاصات لخرين. مثلاً، إلا كان `ApprovalService` محتاج `RequestRepository` ، كنديرو mock لداك الـ repository باش التيست ما يقيسش لاباز دو دوني بصح.

## دور الـ Integration Tests
الـ Integration tests كيشوفو واش المكونات المختلفة خدامة مع بعضياتها مزيان. عكس الـ unit tests، هادو كيطلبو نطلعو الـ application context (بحال Spring Boot) ونتعاملو مع لاباز دو دوني حقيقية (مثلاً H2 in-memory). هنا فين كنتأكدو بلي الـ SQL queries صحاح وبلي الـ ORM mappings خدامين، حيت الـ mock ما يقدرش يوريك هادشي.

## مثال تطبيقي: الموافقة على الطلب
نشوفو كيفاش كيكون الفرق في الكود:

**Unit Test (معزول):**
```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock RequestRepository repository;
    @InjectMocks ApprovalService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        service.approve(1L);
        verify(repository).save(any());
    }
}
```
*النتيجة:* سريع بزاف. كيتأكد غير بلي الميثود `approve` عيطات على `save`.

**Integration Test (مرتبط):**
```java
@SpringBootTest
class ApprovalIntegrationTest {
    @Autowired ApprovalService service;
    @Autowired RequestRepository repository;

    @Test
    void testFullApprovalFlow() {
        repository.save(new Request(1L, "Laptop"));
        service.approve(1L);
        assertEquals("APPROVED", repository.findById(1L).get().getStatus());
    }
}
```
*النتيجة:* تقيل شوية. كيتأكد بلي الداتا تسجلات بصح في لاباز دو دوني.

## غلط شائع: تسيميلي كلشي
بزاف كيسحاب ليهم بلي ملي كيخدمو بـ `@InjectMocks` راه كيديرو integration test. ولكن راه ملي كدير mock لـ repository، راك ما كتيسطيش الـ SQL ديالك. إلا كان عندك غلط في السنتكس ديال SQL، الـ unit test غادي يدوز عادي حيت الـ mock كيرجع غير داكشي لي قلتي ليه يرجع.

## تمرين تطبيقي
إلا بغيتي تأكد بلي `BuyerService` كيحسب الضريبة (tax) ديال الكوموند بطريقة صحيحة على حساب واحد الفورمول معقدة، أما نوع ديال التيست خاصك تخدم بيه؟

**الجواب:** Unit Test، حيت حساب الضريبة هو منطق رياضي (pure logic) وما محتاج لا لاباز دو دوني لا ريزو.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
