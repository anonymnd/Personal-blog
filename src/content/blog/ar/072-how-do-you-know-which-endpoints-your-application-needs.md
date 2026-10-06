---
title: "كيفاش تعرف شنو هما الـ Endpoints لي كيحتاجهم التطبيق ديالك؟"
description: "دليل باش تخرج الـ endpoints ديال REST API من الاحتياجات ديال البيزنس باستعمال طريقة الـ resources."
pubDate: 2026-10-09T15:48:00.000Z
translationKey: 072-how-do-you-know-which-endpoints-your-application-needs
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

بزاف ديال المطورين كيبداو يتخيلو الجداول ديال قاعدة البيانات (database tables) عاد كيصاوبو endpoints كيشبهو لهاد الجداول. هادشي كيخلي الـ API تكون غير بحال شي غلاف على الـ database. التحدي الحقيقي هو كيفاش تحول عملية ديال البيزنس—مثلاً طلب شراء (procurement)—لمجموعة ديال الـ resources منطقية.

## حدد الـ Resources الأساسية
بلاصة ما تفكر في "الخدمات" (functions)، فكر في "الأسماء" (nouns). في تطبيق ديال الشراء، ماعندناش خدمة سميتها 'submitRequest'؛ عندنا resource سميتها `PurchaseRequest`. حدد العناصر الأساسية والعلاقة بيناتهم. مثلاً `PurchaseRequest` تقدر تكون مرتبطة بـ `User` (لي طلب) و `Department` (القسم).

## تتبع دورة حياة العملية (Business Lifecycle)
شوف الطريق لي كدوز منها الـ resource من نهار كتصاوب حتى كتسالي:
1. **الطلب**: الشخص كيصاوب طلب (`POST /purchase-requests`).
2. **المراجعة**: المدير كيشوف الطلبات لي باقين pending (`GET /purchase-requests?status=pending`).
3. **القرار**: المدير كيوافق أو كيرفض (`PATCH /purchase-requests/{id}`).
4. **التنفيذ**: المشتري كيحول الطلب لي توافق عليه لـ commande (`POST /orders`).

## اختيار الـ HTTP Method المناسبة
ملي كتحدد الـ resource، الفعل هو لي كيحدد الـ method. استعمل `GET` باش تجيب المعلومات، `POST` باش تصاوب حاجة جديدة، `PUT` باش تبدل الـ resource كاملة، و `PATCH` باش تبدل غير طرف منها. مثلاً، إلا بغيتي تبدل غير الحالة (status) ديال الطلب من 'Pending' لـ 'Approved'، هنا `PATCH` هي لي مناسبة.

## مثال تطبيقي: عملية الموافقة
تخيل مدير بغا يوافق على طلب.
**الطلب:** `PATCH /purchase-requests/REQ-123` 
**الجسم (Body):** `{"status": "APPROVED"}`
**النتيجة:** السيرفر كيرجع `200 OK` مع المعلومات الجديدة أو `204 No Content`. وإلا كان الطلب أصلاً ملغي (cancelled)، السيرفر خاصو يرجع `409 Conflict` حيت هاد التغيير في الحالة مايمكنش.

## غلط شائع: Endpoints ديال RPC
تجنب تسمي الـ endpoints بحال `/approveRequest` أو `/updateUser`. هاد الستيل كيتسمى RPC ماشي REST. 
**التصحيح:** استعمل `/purchase-requests/{id}` مع `PATCH`. الموافقة هي مجرد تغيير في الحالة ديال الـ resource، ماشي عملية بوحدها.

## تمرين تطبيقي
إلا بغيتي تسمح للمشتري يمسح commande غلط، شنو هو الـ endpoint والـ method لي غادي تستعمل؟

**الجواب:** `DELETE /orders/{id}`. هادي كتمسح الـ resource وخاصها تكون idempotent، يعني واخا تعاود الطلب بزاف د المرات، النتيجة كتبقى هي هي مورا أول مسح.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
