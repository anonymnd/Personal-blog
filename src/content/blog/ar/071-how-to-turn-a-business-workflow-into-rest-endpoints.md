---
title: "كيفاش تحول workflow ديال الخدمة لـ REST Endpoints"
description: "دليل باش تحول مراحل ديال خدمة فشركة لمجموعة ديال REST resources و methods مقادين."
pubDate: 2026-10-09T14:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

بزاف ديال developers كيتحيرو ملي كتكون عندهم عملية معقدة فالخدمة—مثلا كيفاش كيدوز طلب شراء (procurement)—وما كيعرفوش كيفاش يرجعوها REST API. الغلط اللي كيديرو بزاف هو كيصاوبو endpoints فيهم أفعال بحال `/approveRequest` أو `/submitOrder` وهادشي كيخلي الـ API تولي بحال شي function عادية ماشي resource-oriented.

## كيفاش تحدد الـ Resources الأساسية
أول حاجة، نسا الأفعال وركز على 'الأسماء'. فـ workflow ديال الشراء، الـ resource الأساسية هي `PurchaseRequest`. الـ workflow ماشي هو endpoint واحد، ولكن هو مجموعة ديال التغييرات فالحالة (state) ديال ديك الـ resource. خاصك تشوف الدورة ديالها: الطلب كيتكريا، كيولي 'Pending'، من بعد 'Approved' أو 'Rejected'، وفالاخير 'Ordered'.

## ربط مراحل الخدمة بـ HTTP Methods
كل مرحلة فـ business process عندها method ديال HTTP على حساب شنو بغيتي دير. باش تكريي طلب جديد كنستعملو `POST`. وباش نبدلو الحالة ديالو لـ 'Approved'، هادي كتسمى modification ديال الـ state، وهنا كنستعملو `PATCH` يلا بغينا نبدلو غير طرف من الـ data، أو `PUT` يلا بغينا نبدلو الـ resource كاملة.

## مثال تطبيقي: Workflow ديال الشراء
تخيل واحد الموظف بغا يطلب Laptop:

1. **صيفط الطلب**: `POST /purchase-requests` 
   - Payload: `{"item": "Laptop", "amount": 1200}`
   - النتيجة: `201 Created` ومعاها `Location` header كيشير لـ `/purchase-requests/123`.

2. **الموافقة**: المدير كيوافق على الطلب.
   - Request: `PATCH /purchase-requests/123` 
   - Payload: `{"status": "APPROVED"}`
   - النتيجة: `200 OK` مع الـ data الجديدة.

3. **الطلب**: المشتري (buyer) كيسجل بلي راه شرا السلعة.
   - Request: `PATCH /purchase-requests/123` 
   - Payload: `{"status": "ORDERED", "orderDate": "2023-10-01"}`
   - النتيجة: `204 No Content` (يلا ما رجعناش شي body).

## التعامل مع مشاكل الحالة (State Conflicts)
الخدمة ديما فيها قواعد. مثلا، ما يمكنش الطلب يولي 'Ordered' والطلب باقي ما تقبلش. يلا حاول المشتري يدوز طلب باقي Pending، الـ API ما خاصهاش تعطي error عامة. خاصنا نخدمو بـ `409 Conflict` باش نبينو بلي الحالة الحالية ديال الـ resource ما كتسمحش بهاد التغيير.

## غلط شائع: استعمال الأفعال فـ URL
بعد من الـ URLs اللي فيهم أفعال بحال `/purchase-requests/123/approve`. هادا غلط كيديروه بزاف. من الأحسن تعامل مع الموافقة كأنها تغيير فـ field ديال `status`. هكدا كتبقى الـ API ديالك متناسقة وكتتبع القواعد ديال REST.

## تمرين تطبيقي
كيفاش غادي تدير باش تموديلي (model) الحالة ديال مدير رفض الطلب فـ هاد السيستيم؟

**الجواب**: استعمل `PATCH /purchase-requests/{id}` مع payload فيه `{"status": "REJECTED"}` ورجع `200 OK` أو `204 No Content`.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
