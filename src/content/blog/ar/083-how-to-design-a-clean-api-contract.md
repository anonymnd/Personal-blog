---
title: "كيفاش تصمم API Contract نقي ومزيان"
description: "تعلم كيفاش تصاوب interface واضحة ومفهومة بين client و server باستعمال قواعد REST."
pubDate: 2026-10-10T02:48:00.000Z
translationKey: 083-how-to-design-a-clean-api-contract
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخيل راسك خدام على application ديال procurement (المشتريات) فين الموظف كيدفع طلب شراء. إلا كان الـ API contract مرون—يعني السميات ماشي متشابهين ولا codes de statut ما واضحينش—الدراري ديال frontend غادي يبقاو يسولوك ديما: 'شنو كيعني 200 هنا؟' ولا 'علاش هنا درتي `userId` وهنا درتي `user_id`؟'.

## كيفاش تختار Endpoints على شكل Resources
السر باش يكون الـ contract نقي هو تخدم بالأسماء (nouns) ماشي بالأفعال (verbs). بلاصة ما دير `/createRequest` ولا `/approveRequest` دير غير `/requests`. الفعل كيتحدد بـ HTTP method. مثلاً، `POST /requests` باش تزيد طلب جديد، و `GET /requests/{id}` باش تجيب معلومات طلب معين. هاد الطريقة كتخلي الـ API ساهلة لأي واحد يخدم بها.

## فهم الـ HTTP Methods و Idempotency
خاصك تختار method اللي كتعبر على شنو غادي يوقع. `GET` آمنة و idempotent، يعني ما كتبدل والو في السيرفر. `PUT` كتعوض الـ resource كاملة وهي idempotent؛ واخا تصيفط نفس الـ request عشرة دالمرات، النتيجة كتبقى هي هي. `PATCH` كنستعملوها باش نبدلو غير طرف صغير (مثلاً نبدلو الحالة لـ 'Approved') وهي ماشي ديما idempotent. أما `DELETE` فهي idempotent من ناحية الحالة ديال السيرفر، واخا الـ response يتبدل من 204 لـ 404 من بعد أول مرة.

## استعمال Status Codes دقيقة
ما تبقاش ترجع `200 OK` في كلشي. استعمل codes اللي كيشرحو شنو وقع:
- `201 Created`: ملي كتصاوب طلب جديد بـ `POST` وكتعطي `Location` header.
- `202 Accepted`: ملي كيكون الـ processing كياخد وقت (مثلاً الطلب تسنى موافقة المدير).
- `401 Unauthorized`: ملي كيكون الـ authentication ناقص ولا غالط.
- `403 Forbidden`: المستخدم معروف ولكن ما عندوش الحق يـ approve هاد الطلب.
- `409 Conflict`: الطلب ديجا approved وما يمكنش يتبدل دابا.

## مثال تطبيقي: الموافقة على الطلب
ملي المدير كيوافق على طلب شراء، الـ contract خاصو يكون بحال هكا:

**Request:** `PATCH /requests/REQ-123` 
**Body:** `{"status": "APPROVED"}`
**Response:** `200 OK` مع المعلومات الجديدة ديال الطلب.

**غلط شائع:** تستعمل `POST /updateRequest?id=123`.
**التصحيح:** استعمل `PATCH` ولا `PUT` على الـ URI ديال الـ resource نيشان.

## تمرين تطبيقي
أنا method و أنا status code خاصني نستعمل باش نبدل كاع المعلومات ديال طلب شراء موجود، وشنو يكون الـ code إلا العملية دازت بلا ما نرجعو شي body؟

**الجواب:** نستعملو `PUT` و الـ status code يكون `204 No Content`.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
