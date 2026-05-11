---
title: "الفرق بين Testing Behavior و Testing Implementation"
description: "تعلم كيفاش تكتب tests صبارين ومكايتكسروش دغيا بتركيز على النتيجة ماشي على كيفاش تخدم الكود."
pubDate: 2026-10-11T13:48:00.000Z
translationKey: 118-testing-behavior-vs-testing-implementation
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك دوزتي ساعات باش كتبت test مثالي لواحد service ديال procurement. من بعد سيمانة، بدلتي واحد la méthode privée باش تسرع الخدمة بلا ما تبدل النتيجة النهائية، ولكن صدمة: لقيتي 10 ديال tests ماتو. هادشي كيتسمى 'fragile test'، وكيوقع حيت ركزتي على implementation (كيفاش الكود مكتوب) ماشي على behavior (شنو كيدير الكود).

## شنو الفرق بيناتهم؟
ملي كتستي l'implémentation، كتكون كتشوف *كيفاش* وصلتي للنتيجة—مثلاً واش واحد la méthode privée تعيطات ولا لا. ولكن ملي كتستي le comportement، كتشوف *شنو* هي النتيجة—مثلاً واش الطلب ديال الشراء وصل للمدير باش يوافق عليه، بلا ما يهمك واش استعملتي loop ولا stream لداخل.

## مثال تطبيقي
نشوفو `ProcurementService` فين requester كيصيفط طلب. بغينا نتأكدو بلي الطلب تسجل فـ database والمدير توصل بخبر.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldSubmitRequestForApproval() {
        Request req = new Request("Laptop", 1200.0);
        when(repository.save(any())).thenReturn(req);

        service.submitRequest(req);

        // هنا كنستيو behavior: واش النتيجة اللي بغينا وقعات؟
        verify(repository).save(req);
        verify(notificationService).notifyManager(any());
    }
}
```
فهاد المثال، ميهمناش واش service خدام بـ `for` loop ولا شي حاجة خرى؛ اللي كيهمنا هو أن repository دار save والمدير توصل بـ notification.

## غلط شائع: كثرة الـ Mocking لداخل
بزاف ديال الناس كيغلطو ملي كيستعملو Mockito باش يـ verify-يو la méthode privée ولا كيحاولو يطيرو على private methods. إلا بدلتي غير سمية ديال méthode privée، الـ test غادي يطيح واخا logic ديال business باقة صحيحة.

**التصحيح:** ركز غير على التفاعلات مع dependencies اللي برا (بحال `RequestRepository`) ولا شوف النتيجة النهائية (return value) ديال la méthode publique.

## مقارنة سريعة
| الجانب | Test d'Implémentation | Test de Comportement |
| :--- | :--- | :--- |
| التركيز | Logique interne/Private methods | API Publique/Résultats |
| Refactoring | tests كيتكسرو دغيا | tests كيبقاو مستقرين |
| الهدف | "واش تعيطات la méthode X؟" | "واش النتيجة صحيحة؟" |

## تمرين تطبيقي
عندك méthode سميتها `calculateTotal()` كتحسب المجموع وكتنقص remise. درتي test كيتأكد بلي méthode privée سميتها `applyTax()` تعيطات مرة وحدة. واش هادا test ديال behavior ولا implementation؟

**الجواب:** هادا test ديال implementation. باش يكون behavior، خاصك غير تأكد بلي المجموع النهائي اللي رجع هو الرقم الصحيح.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
