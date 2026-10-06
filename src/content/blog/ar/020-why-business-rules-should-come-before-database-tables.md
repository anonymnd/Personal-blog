---
title: "علاش خاصك تحدد قواعد البيزنس قبل ما تصاوب جداول القاعدة ديال البيانات"
description: "تعلم علاش خاصك ترسم المنطق ديال الخدمة (Business Logic) قبل ما تبدا تكريي Tables باش ماتلقاش راسك كتعاود الخدمة من الزيرو."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 020-why-business-rules-should-come-before-database-tables
locale: ar
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل معايا خدام على تطبيق ديال الشراءات (Procurement App). بديتي نيشان وكرييتي Table سميتها `Requests` وزدتي فيها column ديال status. من بعد، اكتشفتي بلي الطلب مايمكنش يولي 'Approved' إلا إذا كان اللي طلب عندو ميزانية كافية والمدير يكون من نفس القسم. دابا، حيت ديجا صاوبتي الجداول، غادي تضطر تزيد constraints معقدين ولا triggers فواحد السكيما اللي ما مصاوباش لهاد الغرض. هادشي هو اللي كنسميوه الفخ ديال 'database-first'.

## المنطق هو الأول
قواعد البيزنس (Business Rules) هي اللي كتقول لينا 'شنو' خاص يوقع و 'كيفاش'، أما الجداول فهي غير بلاصة فين كنخزنو المعلومات. إلا بديتي بالجداول، راك كتصمم باش تخزن ماشي باش تخدم. ملي كتحدد القواعد هي الأولى، كتعرف شكون هما الـ entities الحقيقيين—بحال اللي كيطلب (Requester)، المدير (Manager)، والطلب (Order)—والشروط اللي خاصها توفر باش الحالة ديال الطلب تبدل.

## ربط القواعد بالـ Entities
فالمثال ديالنا، القواعد هي:
1. Requester (acteur) كيدفع طلب.
2. Manager (user عنده سلطة) خاصو يوافق إلا كان الثمن فايت 500 دولار.
3. Buyer (domain entity) كيحول الطلب اللي موافق عليه لـ Purchase Order.

إلا حددنا هادشي هو الأول، غادي نعرفو بلي خاصنا علاقة many-to-one بين الطلبات والمديرين، وقاعدة ديال validation على الثمن.

## مثال تطبيقي: مسار الموافقة
بلاصة ما نديرو غير كلمة 'status'، القاعدة كتقول: *"الطلب مايمكنش يولي 'Ordered' إلا إذا كانت عنده timestamp ديال الموافقة و Buyer ID صحيح."*

```java
// مثال بسيط ديال كيفاش كنطبقو القاعدة فـ code
public class ProcurementService {
    public void transitionToOrdered(Request request, User buyer) {
        if (!request.isApproved()) {
            throw new IllegalStateException("الطلب خاصو يكون موافق عليه أولا");
        } 
        if (buyer.getRole() != Role.BUYER) {
            throw new UnauthorizedException("غير الـ Buyer اللي يقدر يكوموندي");
        }
        request.setStatus(Status.ORDERED);
    }
}
```
النتيجة: السيستيم كيمنع أي حالة غلط، وخا تكون Table SQL بسيطة.

## غلط شائع: Table وحدة فيها كلشي
بزاف ديال المطورين كيكرييو Table وحدة فيها 50 column باش يغطيو كاع الحالات. هادشي كيوقع حيت ما حددوش قواعد البيزنس فالبداية. الحل هو نقسمو الجداول على حساب شكون المسؤول (مثلا: نفصلو `RequestDetails` على `ApprovalAudit`).

## تمرين تطبيقي
سيناريو: كاين قاعدة كتقول بلي المستخدم مايمكنش يطلب PC جديد إلا إذا دازت 24 شهر على الـ PC اللي خدا قبل.
سؤال: واش هادشي نحلوه بـ `UNIQUE` constraint فـ database ولا بـ business rule check؟

الجواب: بـ business rule check. حيت `UNIQUE` constraint ماكتحسبش الفرق بين التواريخ، هي كتشوف غير واش كاين تكرار ديال نفس القيمة.
