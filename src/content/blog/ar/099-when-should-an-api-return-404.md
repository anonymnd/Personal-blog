---
title: "إمتى الـ API خاصها ترجع 404؟"
description: "دليل باش تفرق بين ملي كتكون الـ ressource ماكايناش وبين ملي كتكون الـ request غالطة."
pubDate: 2026-10-10T18:48:00.000Z
translationKey: 099-when-should-an-api-return-404
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

تخيل معايا خدام على app ديال procurement (المشتريات). واحد manager بغا يـapprove واحد الطلب بالـ ID `REQ-123`. إلا السيرفر رجع 404، واش هادشي كيعني أن الـ ID مكتوب غلط، ولا كيعني أن الطلب أصلاً ماكاينش فـ la base de données؟ إلا خلطنا بين هاد الجوج، الـ client غادي يتلف فاش يبغي يعالج الأخطاء.

## شنو كيعني 404 بالضبط
الـ code `404 Not Found` خاصو يتستعمل غير ملي السيرفر ملقاش الـ ressource اللي طلبتي. فـ REST، الـ URI كتشير لشي حاجة محددة. إلا كانت ديك الحاجة ماكايناش فـ la base de données، هنا كنرجعو 404. هادشي كيعني أن الـ endpoint صحيحة، ولكن داك الـ ID اللي عطيتي ماكاينش.

## الفرق بين 404 و 400 Bad Request
واحد الغلط شائع هو ملي كنرجعو 404 والـ input أصلاً ماخدامش. مثلاً، إلا صيفط المستخدم ID قصير بزاف ولا فيه حروف ممنوعة، هادي كتسمى validation error ماشي ressource manquante. هنا خاصك ترجع `400 Bad Request`. الـ validation (بحال `@NotBlank` ولا `@NotNull` فـ Jakarta EE) كتدار قبل ما نمشيو لـ la base de données. إلا كان الشكل ديال الـ input غلط، حبس تما ورجع 400.

## مثال تطبيقي: Approval ديال طلب
نشوفو هاد الـ endpoint: `PUT /requests/{id}/approve`.

1. **الحالة A (400):** الـ client صيفط `PUT /requests/abc-123/approve` ولكن الـ ID خاصو يكون غير أرقام. السيرفر كيرفضها ديك الساعة.
   *النتيجة:* `400 Bad Request` - "Format ديال ID غلط".
2. **الحالة B (404):** الـ client صيفط `PUT /requests/999/approve`. الـ ID فيه غير أرقام، ولكن ماكاين حتى طلب بالرقم 999 فـ la base.
   *النتيجة:* `404 Not Found` - "الطلب رقم 999 ماكاينش".

## غلط كيديروه بزاف ديال الـ devs
بزاف كيديرو `try-catch` عامة وكيرجعو 404 على أي مشكل وقع. مثلاً، إلا طاحت la base de données، ورجعتي 404، الـ client غادي يسحاب ليه أن الـ data تمسحات، وهي فالحقيقة السيرفر اللي فيه مشكل. ديما ربط الـ 404 بـ exception محددة (بحال `ResourceNotFoundException`) وخلي المشاكل الأخرى ترجع `500 Internal Server Error`.

## تمرين تطبيقي
أنا code خاصنا نرجعو إلا المستخدم طلب `/orders/55` والـ order كاين، ولكن المستخدم ماعندوش الحق يشوفو (permission)؟

**الجواب:** `403 Forbidden` (أو `404` إلا بغيتي تخبي بلي ديك الـ ressource كاينا لأسباب أمنية)، ولكن ماشي `400` حيت الـ request مكتوبة بطريقة صحيحة.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
