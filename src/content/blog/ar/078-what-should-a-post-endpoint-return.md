---
title: "شنو خاص يرجع الـ POST Endpoint؟"
description: "دليل باش تختار الـ HTTP status codes والـ response body الصحيحين فاش كتصاوب POST requests فـ REST API."
pubDate: 2026-10-09T21:48:00.000Z
translationKey: 078-what-should-a-post-endpoint-return
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخايل راسك خدام على تطبيق ديال الشراء (procurement). واحد المستخدم صيفط طلب شراء، ولكن نتا ماعرفتيش واش ترجع ليه الـ object اللي تكرى، ولا غير ميساج ديال النجاح، ولا غير code ديال الحالة. إلا غلطتي هنا، غادي تدوخ الـ frontend developer وتخربق الـ API ديالك.

## المعيار الأساسي: 201 Created
فاش الـ POST request كتصاوب resource جديدة بنجاح، أحسن جواب هو `201 Created`. هادشي كيعلم الـ client بلي السيرفر ماشي غير خدم الطلب، ولكن راه فعلاً كريا حاجة جديدة. وباش تكون REST-compliant، خاصك تزيد `Location` header فيه الـ URI ديال ديك الـ resource الجديدة.

## التعامل مع العمليات اللي كتاخد الوقت: 202 Accepted
فـ procurement، كاينين طلبات اللي خاصهم موافقة ديال manager عاد يتسجلو رسمياً. إلا كان السيرفر قبل الطلب ولكن مازال ماسالاش من المعالجة ديالو، رجع `202 Accepted`. هاد الكود كيعني بلي الطلب صحيح وراه فـ la file d'attente، ولكن النتيجة النهائية مازال ماكايناش.

## النجاح العام: 200 OK ولا 204 No Content
إلا كانت الـ POST request كدير غير واحد action (مثلاً كتحسب شي حاجة) وماشي كتكري resource، استعمل `200 OK`. وإلا كانت العملية دازت مزيان ولكن ماكاين حتى شي معلومة مهمة ترجعها فـ body، استعمل `204 No Content` باش ماتضيعش الـ bandwidth.

## مثال تطبيقي: طلب شراء
نشوفو endpoint سميتو `/api/requests`:

**الطلب (Request):**
`POST /api/requests` 
`{ "item": "Laptop", "quantity": 1 }`

**الجواب (Response):**
Status: `201 Created`
Header: `Location: /api/requests/123`
Body: `{"id": 123, "status": "PENDING"}`

## غلط شائع: استعمال 200 فكلشي
بزاف ديال المطورين كيرجعو `200 OK` فكاع الحالات ديال النجاح. واخا هادشي خدام، ولكن كيضيع المعنى ديال العملية. مثلاً، إلا رجعتي `200` بلاصة `201` الـ client ماغاديش يعرف واش الـ resource تكرات فعلاً فـ base de données ولا لا. ديما اختار الكود اللي كيوصف الحالة بدقة.

## تمرين تطبيقي
التطبيق ديالك فيه endpoint سميتو `/api/orders/submit` اللي كيبدا عملية طويلة فـ background باش يتواصل مع الموردين (vendors). شنو هو الـ status code اللي خاصو يرجع ديك الساعة فاش كيوصل الطلب؟

**الجواب:** `202 Accepted` حيت العملية asynchronous ومازال ماسالاتش.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
