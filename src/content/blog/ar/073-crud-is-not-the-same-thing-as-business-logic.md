---
title: "CRUD ماشي هي نيتها Logique Métier"
description: "تعلم علاش ملي كتربط الـ API ديالك نيشان مع الـ database كتصاوب سيستيم قاصح، وكيفاش تفرق بين تسيير الـ resources وقواعد البيزنس."
pubDate: 2026-10-09T16:48:00.000Z
translationKey: 073-crud-is-not-the-same-thing-as-business-logic
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخيل معايا خدام على app ديال الشريات (procurement). عندك واحد الـ entity سميتها `PurchaseRequest`. شي حد يلاه بادي يقدر يدير endpoint ديال `PUT /requests/{id}` اللي كيبدل أي حاجة فـ database. ولكن فالحقيقة، اللي دار الطلب ما يمكنش ليه يبدل الثمن يلا كان manager ديجا وافق عليه. يلا كانت الـ API ديالك غير CRUD (Create, Read, Update, Delete)، غادي تلقى راسك كدير بزاف ديال `if/else` وسط الـ update، وهادشي كيخلي الكود مرون.

## الفخ ديال CRUD
الـ CRUD كيهتم غير كيفاش تخزن الداتا (persistence). السؤال ديالو هو: "كيفاش نحط هاد السطر فـ table؟". أما الـ Business Logic كيهتم بقواعد الخدمة. السؤال ديالو هو: "واش هاد العملية مسموح بها دابا على حساب الحالة ديال السيستيم؟". ملي كتعامل مع الـ API بحال إلا هي interface ديال database، كتكشف التفاصيل الداخلية ديالك وكتفرض على client يفهم القواعد ديال البيزنس باش ما يبقاش يطلع ليه 400 ولا 409.

## الفرق بين Resource و Action
بلاصة ما تدير `UPDATE` عام، حدد تحولات (transitions) واضحة. مثلا فـ طلب شراء، بلاصة `PUT /requests/123` وتبدل الحالة (status)، دير endpoint خاصة بحال `POST /requests/123/approvals`. هكا كتكون باين بلي راك كدير Action ديال بيزنس ماشي غير كتبدل داتا.

## مثال تطبيقي: عملية الموافقة (Approval)
نفترضوا عندنا طلب خاصو موافقة manager.

**طريقة غلط (CRUD Pur):**
`PUT /requests/123` 
Body: `{"status": "APPROVED"}`
(هنا السيرفر خاصو يتأكد واش هاد الشخص manager واش الطلب باقي 'PENDING').

**طريقة صحيحة (Business Logic):**
`POST /requests/123/approvals`
Body: `{"managerId": "MGR-01", "comments": "Budget vérifié"}`

**النتيجة:** الـ API كترجع `200 OK` ولا `204 No Content` يلا دازت. ويلا كان الطلب ديجا موافق عليه، كترجع `409 Conflict` حيت كاين تعارض فالحالة (state conflict).

## غلط شائع: الـ Endpoint اللي كيدير كلشي
بزاف ديال developers كيديروا `PATCH` واحد كيتكلف بجميع التغييرات الممكنة.
*التصحيح:* فرق بيناتهم. استعمل `PATCH` للتغييرات البسيطة (مثلا تبدل وصف)، ولكن استعمل endpoints ديال actions للحالات اللي فيها قواعد (مثلا `submit`, `approve`, `cancel`).

## تمرين تطبيقي
فـ app ديال الشريات، الـ Buyer خاصو يرد الطلب 'Ordered'. واش نديرو `PUT /requests/{id}` ونبدلو الـ status، ولا نديرو `POST /requests/{id}/order`؟

**الجواب:** `POST /requests/{id}/order` هي اللي أحسن، حيت 'Ordering' عملية ديال بيزنس اللي غالبا كتدير حوايج خرين (بحال تصيفط email للـ vendor)، ماشي غير تبديل كلمة فـ table.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
