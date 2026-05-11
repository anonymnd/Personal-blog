---
title: "علاش الـ Architecture المزيانة هي حدود (Boundaries) ماشي غير سميات ديال Dossiers"
description: "تعلم علاش الفصل المنطقي ديال المهام (Domain Capabilities) أهم بزااف من الطريقة باش كتستف الملفات ديالك."
pubDate: 2026-10-17T13:48:00.000Z
translationKey: 262-why-good-architecture-is-about-boundaries-not-folder-names
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيسحاب ليهم بلي غير يصاوبو folder سميتو `services` ولا `repositories` راه داروا Architecture نقية. ولكن، تقدر تكون عندك dossiers منظمين ومقادين، وفي نفس الوقت الكود ديالك عبارة عن 'Big Ball of Mud'، يعني كل Class مرتبطة مع الأخرى بطريقة عشوائية. المشكل ماشي فين حطيتي الملف، ولكن فين رسمتي الحدود ديال المنطق (Logic).

## الخدعة ديال تنظيم الـ Folders
الـ Folders هما غير بلايص فين كنحطو الملفات، ولكن الـ Architecture هي كيفاش كنقسمو المسؤوليات. إلا كان `OrderService` كيبدل مباشرة فـ `User` بلا ما يدوز من Interface محددة، راه واخا ديرهم فـ dossiers مفرقين، كيبقى المشكل ديال الـ Coupling (الارتباط القوي). الـ Cohesion المزيانة هي ملي الحوايج اللي كيتبدلو مجموعين كيبقاو مجموعين، والـ Coupling الناقص هو ملي موديول مكيأثرش على موديول آخر إلا تبدل فيه شي حاجة.

## كيفاش نرسمو حدود الدومين (Domain Boundaries)
عوض ما تنظم الكود على حساب الدور التقني (Controller, Service, DAO)، نظمو على حساب الخدمة اللي كيقدمها (Capability). مثلاً فـ application ديال الشراء، المنطق ديال 'طلب السلعة' (Request) خاصو يكون معزول على المنطق ديال 'الموافقة' (Approval). وخا تكون خدام بـ Monolith، خاص كل وحدة تعامل كأنها Module بوحدو. هادشي هو اللي كيخليك من بعد تقدر تحول لـ Microservices بلا ما تعاود الكود من الزيرو.

## مثال تطبيقي: نظام المشتريات
تخيل معانا عملية طلب شراء. عوض ما نديرو `ProcurementService` واحد كبير، غنديرو حدود لـ `RequestModule`.

```java
// Boundary: RequestModule
public class RequestService {
    public RequestId submitRequest(RequestDetails details) {
        // المنطق ديال إنشاء الطلب
        return new RequestId("REQ-123");
    }
}

// Boundary: ApprovalModule
public class ApprovalService {
    public void approve(RequestId id, Manager manager) {
        // المنطق ديال الموافقة من طرف المدير
        // هاد الموديول كيعرف غير RequestId، مكيشوفش RequestDetails
    }
}
```
النتيجة: `ApprovalService` ميمكنش ليه يغير `RequestDetails` بالغلط حيت كيتعامل غير مع الـ Boundary ديال `RequestId`.

## غلط شائع: فخ الـ Interface
كاين اللي كيسحاب ليه غير يدير Interface (مثلاً `IOrderService`) راه دار Boundary. هادشي غلط. إلا كانت الـ Interface كتعاود غير نفس الميثودز ديال الـ Implementation، راه سميتها 'Leaky Abstraction'. الـ Boundary الحقيقية هي اللي كتخبي التعقيدات وكتعطي غير داكشي اللي ضروري باش الموديول الآخر يخدم.

## تمرين تطبيقي
سيناريو: عندك `BuyerModule` و `PaymentModule`. الـ `BuyerModule` خاصو يعرف واش الخلاص داز باش يصيفط السلعة. واش `BuyerModule` خاصو يعيط مباشرة لـ `PaymentRepository.findByTransactionId()`؟

**الجواب:** لا. خاصو يعيط لـ method فـ الـ Boundary ديال `PaymentService` (مثلاً `isPaymentCleared(id)`). هكا كنمنعو `BuyerModule` باش ميبقاش مرتبط بـ Schema ديال Database ديال الخلاص.
