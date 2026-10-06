---
title: "Sequence Diagrams: شنو كيوقع ملي كنكليكيوا على شي بوطون؟"
description: "تعلم كيفاش ترسم الترتيب ديال الميساجات اللي كيدوزو بين الـ objects ملي المستخدم كيدير شي حركة فالسيسطيم."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 027-sequence-diagrams-what-happens-after-the-user-clicks-a-button
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك كتشرح شي ميزة (feature) لشي ديفلوبور جديد. كتقول ليه: «المستخدم كيورك على شراء، السيسطيم كيقلب واش السلعة كاينه، ومن بعد كيصيفط إيميل». هاد الهضرة كتبان ساهلة، ولكن فاش كيكون السيسطيم كبير، كنسوا شكون هو الـ object بالضبط اللي مكلف بكل خدمة. هنا فين كينفعنا الـ Sequence Diagram حيت كيرسم لينا الترتيب ديال التفاعلات مع الوقت.

## المنطق ديال Lifelines و Messages
فالـ sequence diagram، كنستعملو خطوط عمودية منقطة كتسمى lifelines باش نمثلو الـ objects. والأسهم الأفقية هي الميساجات (messages) اللي كيدوزو بيناتهم. الفرق بينو وبين الـ flowchart هو أن الـ sequence diagram كيركز على *الترتيب* ديال التواصل. إلا كان Object A عيط لشي method فـ Object B، السهم كيمشي من A لـ B، وكنرسمو واحد المستطيل صغير (activation bar) فوق الخط ديال B باش نبينو بلي راه خدام كيعالج الطلب.

## مثال: طلب شراء (Procurement Request)
نشوفو تطبيق ديال المشتريات فين الموظف كيصيفط طلب شراء. الترتيب كيكون بحال هكا:
1. **الموظف** → **RequestController**: `submitRequest(data)`
2. **RequestController** → **RequestService**: `validateAndSave(request)`
3. **RequestService** → **RequestRepository**: `save(entity)`
4. **RequestRepository** → **RequestService**: `Confirmation`
5. **RequestService** → **RequestController**: `Success Response`
6. **RequestController** → **الموظف**: `إظهار رسالة "تم إرسال الطلب"`

## مثال ديال الكود
ها كيفاش كيكون الـ `RequestController` باستعمال Jakarta EE باش يطبق هاد السيكوانس:

```java
@Path("/requests")
public class RequestController {
    @Inject
    private RequestService requestService;

    @POST
    public Response submitRequest(PurchaseRequest request) {
        // هاد السطر هو اللي كيدير السهم الموالي فالديغرام
        boolean result = requestService.validateAndSave(request);
        return result ? Response.ok().build() : Response.status(400).build();
    }
}
```

## غلط شائع: تخلط بين notation وشنو تقدر تبين
Sequence diagram ماشي محدود فطريق وحدة مستقيمة. استعمل `alt` للموافقة ولا الرفض، و`opt` لواحد التفاعل اختياري، و`loop` للتكرار، و`par` لتفاعلات كتدوز بالتوازي. هاد fragments عندهم معنى محدد فـ UML؛ ما تدخلش فيهم losanges ديال flowchart بلا قواعد. إلا الهدف هو workflow ديال الخدمة كامل، activity diagram غالبا أنسب. وإلا بغيتي تعرف شكون كيصيفط الرسائل ولمن وفاش، استعمل sequence diagram.
## تمرين تطبيقي
**السيناريو:** المدير كيكليكي على "Approve" لشي طلب. السيسطيم خاصو يبدل الحالة لـ 'Approved' ويعلم الـ Buyer.
**المطلوب:** كتب الترتيب ديال الميساجات.
**الجواب:** Manager → ApprovalController → RequestService → RequestRepository (Update) → NotificationService (Notify Buyer) → Manager (Success).


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
