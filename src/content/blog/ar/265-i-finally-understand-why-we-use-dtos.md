---
title: "فهمت أخيراً علاش كنخدمو بـ DTOs"
description: "شرح مبسط علاش خاصنا نفصلو بين البيانات ديال الداتابيز والبيانات لي كنصيفطو لـ API."
pubDate: 2026-10-17T16:48:00.000Z
translationKey: 265-i-finally-understand-why-we-use-dtos
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال الشراء (procurement app)، فين الموظف كيصيفط طلب شراء. فالبداية، تقدر تجي في بالك بلي ساهل ترجع الـ `PurchaseRequest` entity نيشان من الـ controller. كتبان القضية سريعة، ولكن هنا فين كاين المشكل: الـ entity فيها حوايج بحال `secretInternalNote` لي ما خاصش الموظف يشوفهم، وكاين `version` ديال Hibernate لي ما كتهمنش الـ frontend. إلا صيفطتي الـ entity، راك كتعري الداتابيز ديالك قدام أي واحد.

## كيفاش كيخدم هاد الفصل

الـ DTO (Data Transfer Object) هو عبارة على كلاس بسيطة (POJO) الهدف ديالها غير تهز الداتا من بلاصة لبلاصة. بلاصت ما تصيفط الـ entity، كتصاوب كلاس خاصة فيها غير داكشي لي محتاج الـ frontend فديك اللحظة. هادشي كيدير واحد "الحيط" بين الداتابيز و الـ API. إلا بدلتي سمية ديال شي column فالداتابيز، كتبدل غير المابينغ (mapping) وما كتقيسش الـ API، يعني الـ frontend ما غاديش يوقع ليه crash.

## مثال تطبيقي

ناخدو `PurchaseRequest` entity فيها: `id`, `item`, `quantity`, `status`, و `internalAuditCode`. حنا بغينا الموظف يشوف غير السلعة و الحالة ديال الطلب.

```java
// Domain Entity
public class PurchaseRequest {
    private Long id;
    private String item;
    private int quantity;
    private String status;
    private String internalAuditCode; // سرية!
}

// DTO
public class PurchaseRequestDTO {
    private String item;
    private String status;
}
```

فالـ service layer، كنحولوا الـ entity لـ DTO. النتيجة هي JSON فيه غير `item` و `status` و الـ `internalAuditCode` كتبقى مخبية فالسيرفر.

## غلط شائع: DTO كيشبه للـ Entity

بزاف ديال الناس كيغلطو فاش كيصاوبو DTO فيه نفس الحقول ديال الـ entity بالضبط، وكيقولو "علاش غاندير هاد الخدمة الزايدة؟". الغلط هنا هو أنك كتشوف غير الحقول، ولكن القيمة الحقيقية هي فـ *الفصل*. إلا ما درتيش DTO، أي تغيير بسيط فالداتابيز غادي يهرس ليك الـ API كاملة.

## تمرين تطبيقي

**الحالة:** عندك entity سميتها `Buyer` فيها `name`, `email`, و `hashedPassword`. بغيتي تصاوب DTO لصفحة البروفايل لي كيشوفها أي واحد.

**السؤال:** شنو هما الحقول لي خاص يكونو فـ `BuyerProfileDTO`؟

**الجواب:** خاص يكونو غير `name` و `email`. الـ `hashedPassword` ما خاصوش يخرج من الـ service layer نهائياً.
