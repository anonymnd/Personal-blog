---
title: "شحال من Endpoint كتحتاج فعلياً ميزة (Feature) وحدة؟"
description: "دليل باش توازن بين عدد الـ endpoints وتخدم بـ HTTP methods الصحيحة على حساب الخدمة لي بغيتي دير."
pubDate: 2026-10-10T05:48:00.000Z
translationKey: 086-how-many-endpoints-does-one-feature-really-need
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيوقعوا فواحد الغلط لي هو كيكتّروا الـ endpoints بزاف، كيصاوبوا URL جديدة لكل حركة، مثلاً `/approveRequest` ولا `/cancelOrder`. هادشي كيخلي الـ API مشتتة وصعيبة فالتسيير. الهدف هو نربطوا المنطق ديال البيزنس (business logic) مع الـ REST verbs لي معروفين، بلا ما نبقاو نخترعوا مسارات جديدة لكل تغيير فالحالة ديال الداتا.

## التفكير بمنطق الـ Resource
عوض ما تفكر فـ «الأفعال» (actions)، فكر فـ «الموارد» (resources). أي ميزة هي فالحقيقة مجموعة ديال العمليات على شي حاجة محددة. مثلاً، إلا كنتي كتصاوب تطبيق ديال المشتريات، الـ «Purchase Request» هي الـ resource ديالك. ماشي ضروري دير endpoint لكل مرحلة، خاصك غير تبدل الحالة (state) ديال داك الـ resource.

## كيفاش نوزعوا المهام على Methods
باش تعرف شحال من endpoint محتاج، طبق هاد القواعد:
- **GET /requests**: باش تجيب ليستة ديال الطلبات.
- **GET /requests/{id}**: باش تشوف تفاصيل طلب واحد.
- **POST /requests**: باش تكرِي طلب جديد (كيرجع 201 Created).
- **PUT /requests/{id}**: باش تعوض الطلب كامل بـ version جديدة.
- **PATCH /requests/{id}**: باش تبدل غير شي حاجة بسيطة، بحال تحول الحالة من 'Pending' لـ 'Approved'.
- **DELETE /requests/{id}**: باش تمسح الطلب.

## مثال تطبيقي: الموافقة على الطلب
تخيل مدير بغا يوافق على طلب. بلاصة ما نديرو `/requests/{id}/approve` نخدمو بـ PATCH:

```http
PATCH /requests/123
Content-Type: application/json

{ "status": "APPROVED" }
```
**النتيجة:** السيرفر كيبدل الحالة وكيرجع 200 OK مع الداتا الجديدة. وإلا كان الطلب ديجا ملغي (cancelled)، السيرفر كيرجع 409 Conflict حيت هاد التغيير ماشي منطقي فديك الحالة.

## غلط شائع: الـ URL لي فيها فعل
بزاف كيصاوبو `POST /requests/{id}/submit`. هادشي غلط حيت «submit» هي مجرد تحديث للحالة (status).
**التصحيح:** خدم بـ `PATCH /requests/{id}` وصيفط فـ body ديالها `{"status": "SUBMITTED"}`. هكذا الـ API ديالك كتبقى نقية ومفهومة.

## تمرين تطبيقي
إلا بغيتي تزيد ميزة فين المشتري (buyer) كيحدد بلي الطلب راه «تطلب» (Ordered)، شنو هي الـ HTTP method و الـ URL لي غادي تستعمل؟

**الجواب:** `PATCH /requests/{id}` مع body فيه الحالة الجديدة (مثلاً: `{"status": "ORDERED"}`).

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
