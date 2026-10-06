---
title: "شنو كايتستى بالضبط Mockito verify()؟"
description: "شرح مفصل باش تفهم الفرق بين verification ديال الحالة (state) و verification ديال التفاعل (interaction) ف Mockito."
pubDate: 2026-10-11T02:48:00.000Z
translationKey: 107-what-does-mockito-verify-actually-test
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك كتبتي test لواحد service ديال الشريات (procurement). الـ test داز success، ولكن عاد رديتي البال بلي ماراكش كاتأكد واش `PurchaseOrderRepository` تعيطات باش تسجل la commande؛ راك كاتأكد غير واش la méthode رجعات `true`. هنا كاين الفرق بين أنك تشوف *شنو* وقع (state) وبين *كيفاش* وقع (interaction).

## الفرق بين State و Interaction
بزاف ديال المبتدئين كايخلطو بين `when().thenReturn()` و `verify()`. الـ `when()` كاتصاوب لينا precondition (stubbing)، ولكن `verify()` هي assertion. هي ماشي كاتشوف القيمة ديال variable ولا شي حاجة ف la base de données، ولكن كاتسول Mockito: "واش هاد la méthode بالضبط فهاد الـ mock تعيطات بهاد les arguments بالضبط؟"

## كيفاش خدامة verify()
ملي كاتعيط لـ `verify(mock).method()`، Mockito كايقلب ف l'historique ديال les appels لي وقعو. كايشوف واش كاين تطابق بين la signature ديال la méthode و les arguments لي تدازو ملي كان code خدام. إلا كانت la méthode ماتعيطاتش، ولا تعيطات ب arguments خرين، Mockito كايعطيك erreur بحال `ArgumentsAreDifferent` ولا `WantedButNotInvoked`.

## مثال تطبيقي: Approbation ديال طلب
نشوفو service فين manager كايوافق على طلب. خاصنا نتأكدو بلي `NotificationService` تصيفطت ملي تدارت l'approbation.

```java
// مثال توضيحي
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock NotificationService notificationService;
    @InjectMocks ProcurementService service;

    @Test
    void testApproveRequest() {
        Request request = new Request("Laptop", 1200);
        service.approve(request);
        
        // هنا كانأكدو بلي l'interaction وقعات
        verify(notificationService).sendEmail(eq("manager@company.com"), anyString());
    }
}
```
فهاد الحالة، الـ test غايفشل إلا ماتعيطاتش `sendEmail` وخا la méthode `approve` ترجع `true`.

## غلط شائع: Verification ديال stubs
واحد الغلط كايوقع بزاف هو ملي كاتبغي تدير `verify()` لشي méthode ديجا درتي ليها stubbing غير باش "تأكد" بلي الـ stub خدام. مثلا، تعيط لـ `verify(repo).findById(1)` غير حيت درتي `when(repo.findById(1)).thenReturn(opt)` هادشي زايد. استعمل `verify()` غير للحوايج لي كايخليو أثر (side effects) بحال صيفط email ولا save ف base، ماشي للحوايج لي غير كايجيبو data.

## تمرين تطبيقي
إلا كانت عندك méthode سميتها `processOrder()` وخاصها تعيط لـ `repository.save()` مرة وحدة بالضبط، شنو هي السطر ديال Mockito لي كايضمن بلي ماتعيطاتش جوج مرات؟

**الجواب:** `verify(repository, times(1)).save(any());`


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
