---
title: "Endpoints خاصهم يمثلو Resources ماشي Boutons"
description: "تعلم كيفاش تحول تصميم الـ API ديالك من نظام الأوامر (RPC) لنظام الموارد (REST)."
pubDate: 2026-10-09T17:48:00.000Z
translationKey: 074-endpoints-should-represent-resources-not-buttons
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخيل راسك خدام على تطبيق ديال الشراء (procurement). تقدر تجيك فكرة دير endpoint سميتها `/approveRequest?id=123`. هاد الطريقة كتبان ساهلة حيت كتشبه لشي bouton كتكليكي عليه فـ interface. ولكن هادشي غلط كيتسمى 'RPC-style'. فـ REST API الحقيقية، الـ endpoints خاصهم يمثلو 'حوايج' (resources) ماشي 'أفعال' (buttons).

## التفكير بطريقة الـ Resource
بلاصة ما تفكر فشنو كيدير المستخدم، فكر فشنو كيغير. الموافقة (approval) ماشي فعل بوحدو، بل هي تغيير فالحالة (state) ديال واحد الـ `PurchaseRequest`. ملي كتعامل مع الطلب كـ resource، كتولي تستعمل HTTP methods باش تحدد العملية، وهادشي كيخلي الـ API ديالك مفهومة لأي مطور.

## من الأفعال للحالات
ملي كتحول من الـ buttons لـ resources، الـ URL كيتبدل. بلاصة ما دير `/submitOrder` أو `/cancelOrder` كدير `/orders`. والفعل كيتحدد على حساب الـ HTTP verb:

| العملية | Style RPC (غلط) | Style REST (صحيح) | HTTP Method |
| :--- | :--- | :--- | :--- |
| إنشاء طلب | `/createRequest` | `/requests` | POST |
| موافقة على طلب | `/approveRequest` | `/requests/{id}/status` | PUT/PATCH |
| مسح طلب | `/deleteRequest` | `/requests/{id}` | DELETE |

## مثال تطبيقي: الموافقة على طلب شراء
فـ تطبيق ديال الشراء، ملي manager كيوافق على طلب، راه كيغير الحالة ديال داك الـ resource.

**الطلب (Request):**
`PATCH /requests/456` 
`Content-Type: application/json` 
`{ "status": "APPROVED" }` 

**النتيجة:**
السيرفر كيحدث البيانات وكيرجع `200 OK` مع الحالة الجديدة. إلا كان الطلب ديجا موافق عليه، العملية كتبقى idempotent. ولكن إلا كان الطلب ديجا ملغي (cancelled)، السيرفر خاصو يرجع `409 Conflict` حيت مايمكنش تحول طلب ملغي لـ approved.

## غلط شائع: الفعل وسط الـ URL
بزاف كيديرو خلط وكيكتبو `POST /requests/456/approve`. هادشي زايد حيت `POST` أصلاً كتعني فعل. التصحيح هو تستهدف الخاصية ديال الـ resource: `PATCH /requests/456` أو `PUT /requests/456/status`.

## تمرين تطبيقي
كيفاش تقدر تبدل هاد الـ endpoint `POST /orders/12/shipItem` باش تولي تتبع نظام الـ resources؟

**الجواب:** استعمل `PATCH /orders/12` مع body فيه `{ "status": "SHIPPED" }` أو استهدف resource فرعية بحال `PUT /orders/12/shipping-status`.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
