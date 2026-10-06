---
title: "Nested REST Resources: فوقاش خاصك تستعملهم؟"
description: "دليل باش تعرف واش تخدم بـ URI imbriquée ولا flat باش تسير لي ريسورس لي بيناتهم علاقة فـ API REST."
pubDate: 2026-10-10T06:48:00.000Z
translationKey: 087-nested-rest-resources-when-should-you-use-them
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخايل راسك كتصاوب سيستيم ديال الشريان (procurement). عندك `Requests` (طلبات) و `Items` (سلعة). المشكل لي كيوقع بزاف هو واش السلعة خاصنا نوصلو ليها بـ `/items/{id}` ولا بـ `/requests/{requestId}/items/{itemId}`. إلا كترتي من nesting، الـ URLs كيوليو طوال بزاف ومعقدين، وإلا مادرتيهش، كتفقد داك الترتيب المنطقي ديال الداتا.

## المنطق ديال الـ Nesting
الـ Nesting كنستعملوه باش نبينو علاقة 'ديال' (parent-child). خاصك تخدم بيه ملي تكون الـ resource الصغيرة مايمكنش تكون بلا الـ resource الكبيرة، ولا ملي تكون العلاقة هي الطريقة الأساسية باش بنادم كيلقى الداتا. فـ l'app ديالنا، `Item` ماعندوش معنى إلا كان وسط `Request`.

## فوقاش تخدم بـ Flat Structure
ماديرش nesting ملي تكون الـ resource مستقلة. مثلا، إلا كان manager بغا يقلب على كاع لي `Items` فكاع لي `Requests` باش يشوف شحال تخسر، هنا `/items?type=laptop` أحسن وأسرع. القاعدة هي ماتفوتش مستوى واحد ديال nesting. فوق `/parents/{id}/children` الـ API كتولي صعيبة فالتسيير.

## مثال تطبيقي: Procurement Workflow
تخايل واحد الموظف بغا يزيد سلعة لواحد الطلب.

**Request:** `POST /requests/101/items` 
**Body:** `{"product": "Mechanical Keyboard", "qty": 1}`
**النتيجة:** السيرفر كيصاوب السلعة مرتبطة بالطلب 101 وكيرجع `201 Created` مع `Location: /requests/101/items/505`.

باش تبدل ديك السلعة:
`PATCH /requests/101/items/505` 
**Body:** `{"qty": 2}`

## غلط شائع: كثرة الـ Nesting
بزاف كيغلطو وكيديرو مسارات طويلة بحال `/departments/5/managers/2/requests/101/items/505`. هكا كتفرض على client يعرف كاع لي ID ديال الوالدين غير باش يبدل حاجة وحدة.

**التصحيح:** خدم بـ nested path باش تكريه (create) ولا تقلب عليه، ولكن باش تعدلو (update) خدم بـ flat path: `PATCH /items/505`. هكا الـ API كتبقى نقية.

## تمرين تطبيقي
سيناريو: عندك `Orders` و `Shipments`. كل shipment تابعة لـ order وحدة. كيفاش تصاوب endpoint باش تجيب كاع لي shipments ديال واحد الـ order معينة؟

**الجواب:** أحسن URI هي `GET /orders/{orderId}/shipments` حيت كتبين العلاقة بشكل واضح.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
