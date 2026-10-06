---
title: "واش DELETE خاصها ترجع 200 ولا 204؟"
description: "دليل باش تختار الـ status code الصحيح فاش تكون كتصاوب DELETE endpoint فـ REST API."
pubDate: 2026-10-09T23:48:00.000Z
translationKey: 080-should-delete-return-200-or-204
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

تخيل راسك خدام على تطبيق ديال الشراء (procurement app). واحد manager بغا يمسح طلب شراء (purchase request). الـ frontend كيصيفط DELETE request، ولكن الديفلوبور متردد واش يرجع 200 OK مع ميساج ديال التأكيد ولا 204 No Content. هاد الاختيار كيأثر على كيفاش الـ client غادي يتعامل مع الـ response وعلى التناسق ديال الـ API كاملة.

## شنو هو 204 No Content
الـ code 204 هو اللي مستعمل بزاف فـ DELETE. كيعلم الـ client بلي العملية دازت بنجاح، ولكن ما كاين حتى شي حاجة باش ترجع فـ الـ body ديال الـ response. هاد الطريقة مزيانة حيت كتنقص من استهلاك الـ data وكتكون واضحة بلي الـ resource مابقاتش كاينه.

## شنو هو 200 OK
كنستعملو 200 OK فاش كيكون الـ API خاصو يرجع شي معلومات فـ الـ body. مثلاً، تقدر ترجع ميساج ديال التأكيد، ولا نسخة من داكشي اللي تمسح باش يقدر المستخدم يرجعو (undo)، ولا ملخص ديال العملية. إلا كان التطبيق ديالك خاصو يقول للمستخدم بالضبط شنو هو الـ ID اللي تمسح، هنا 200 هي اللي مناسبة.

## مثال تطبيقي: طلب شراء
نشوفو طلب باش نمسحو commande:
`DELETE /api/orders/ORD-123`

**الحالة A (204 No Content):**
الرد: `HTTP/1.1 204 No Content`
النتيجة: الـ client كيعرف بلي الـ order تمسح وكيحيدو نيشان من القائمة فـ الـ UI.

**الحالة B (200 OK):**
الرد: `HTTP/1.1 200 OK`
الـ Body: `{"message": "Order ORD-123 has been successfully deleted", "deletedAt": "2023-10-27T10:00Z"}`
النتيجة: الـ client كيطلع notification فيها الميساج اللي رجع من الـ API.

## غلط شائع: الخلط بين Idempotency و Response Codes
بزاف كيغلطو وكيصحاب ليهم بلي حيت DELETE هي idempotent، خاصها ديما ترجع نفس الـ code. الـ idempotency كتعني بلي الحالة (state) ديال السيرفر كتبقى هي هي واخا تعاود الـ request بزاف د المرات، ماشي ضروري الـ response يكون هو نفسه. مثلاً، أول DELETE تقدر ترجع 204، ولكن المرات اللي موراها لنفس الـ ID يرجع 404 Not Found. هادشي راه عادي وصحيح.

## تمرين تطبيقي
إلا كان الـ API ديالك كيمسح profile ديال مستخدم وكيرجع الـ email ديالو فـ الـ body باش يأكد العملية، شنو هو الـ status code اللي خاصك تستعمل؟

**الجواب:** 200 OK، حيت كاين body فـ الـ response.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
