---
title: "كيفاش تنظم مشروع Spring Boot كبير"
description: "دليل باش تقاد بنية ديال تطبيق Spring Boot معقد باستعمال modular monolith باش تفادى الروينة ديال الكود."
pubDate: 2026-10-17T08:48:00.000Z
translationKey: 257-how-to-organize-a-large-spring-boot-project
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيبداو المشروع بـ package structure بسيطة، ولكن ملي كيكبر التطبيق، كيوليو كاع لي كلاس (classes) مرتبطين ببعضياتهم. هاد الحالة كنسميوها 'big ball of mud'، وكتولي صعيبة تبدل شي حاجة بلا ما تخسر حوايج خرين. الحل ماشي هو تمشي نيشان لـ microservices، ولكن هو تنظم الـ monolith ديالك على شكل modules مقسمين حسب domain métier.

## تقسيم الكود حسب الـ Domain
بلاصة ما تنظم الكود حسب الطبقات التقنية (مثلا دير كاع controllers فبلاصة و services فبلاصة)، نظمهم حسب الخاصية (feature). مثلا فـ application ديال الشراء (procurement)، دير packages منفصلين لـ `request` (الطلبات)، `approval` (الموافقة)، و `ordering` (الطلب من المورد).

## تحديد الحدود ديال الـ Modules
باش ما يكونش كاين ارتباط قوي (tight coupling)، كل module خاص يكون عندو نقطة دخول واضحة. غير الـ service layer ديال الـ module هي اللي خاص تكون accessible للموديلات لخرين. إلا كان الـ module ديال `Ordering` بغا يعرف واش الطلب مقبول، خاصو يعيط لـ `ApprovalService` ماشي يقيس `ApprovalEntity` نيشان.

## مثال تطبيقي: مسار الشراء
تخيل هاد التقسيم:
- `com.app.request`: كيتكلف بتقديم الطلبات.
- `com.app.approval`: كيتكلف بموافقة المدير.
- `com.app.ordering`: كيتكلف بالطلب من عند المورد.

```java
// فـ com.app.ordering.OrderingService
public void placeOrder(Long requestId) {
    // الطريقة الصحيحة: عيط للـ service ديال الـ approval
    if (approvalService.isApproved(requestId)) {
        // logic باش تطلب من المورد
    }
}
```
النتيجة: الـ module ديال `Ordering` ما محتاجش يعرف كيفاش خدامة الـ approval لداخل، كيهمو غير واش مقبولة ولا لا.

## غلط شائع: الارتباط الدائري (Circular Dependencies)
واحد الغلط كيوقع بزاف هو ملي `RequestService` كيعيط لـ `ApprovalService` و فـ نفس الوقت `ApprovalService` كيعيط لـ `RequestService`. هادشي كيخلي التطبيق ما يبغيش يدماري.

**التصحيح:** دير طبقة ديال orchestration ولا استعمل Spring Application Events. بلاصة ما تعيط للـ service لخر، `ApprovalService` يلوح event سميتو `ApprovalGrantedEvent` والـ module ديال `Ordering` هو اللي يتسناه ويطبق الخدمة ديالو.

## تمرين تطبيقي
إلا كان عندك module ديال `User` و module ديال `Notification` وبغيتي تصيفط email ديال الترحيب ملي يتسجل user جديد، فين خاص تكون الـ logic باش ما يكونش ارتباط قوي؟

**الجواب:** الـ module ديال `User` خاصو يلوح notification event، والـ module ديال `Notification` هو اللي يتكلف بصيفط الـ email.
