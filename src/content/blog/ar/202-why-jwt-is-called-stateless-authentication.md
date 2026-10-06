---
title: "علاش JWT كتسمى Stateless Authentication"
description: "شرح كيفاش JSON Web Tokens كتخلي السيرفر ميسحقش يخزن السيسيون باش يعرف شكون المستخدم."
pubDate: 2026-10-15T01:48:00.000Z
translationKey: 202-why-jwt-is-called-stateless-authentication
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

تخايل راسك خدام على تطبيق ديال الشراء (procurement app) فين الماناجير كيوافق على الطلبات. فالسيسطيم العادي، ملي الماناجير كيدير login، السيرفر كيصاوب session فالميموار وكيعطيه Session ID. كل مرة الماناجير كيبرك على 'Approve'، السيرفر خاصو يقلب على داك ID فالداتابيز ولا RAM باش يتفكر شكون هو. ملي كيوليو عندك آلاف المستخدمين، هاد القضية كتولي تقيلة على السيرفر.

## كيفاش خدامة Stateless
الـ JWT كتبدل هاد الطريقة حيت كتحول 'الحالة' (state) من السيرفر للكليان. بلاصت ما يعطيه ID عشوائي، السيرفر كيعطيه token مسني (signed) فيه المعلومات ديالو والصلاحيات (claims). حيت هاد token مسني رقمياً، السيرفر ميسحقش يخزنو عندو. كيشوف غير واش السينياتور (signature) صحيحة باستعمال واحد الساروت (secret key). إلا كانت صحيحة والوقت ديال expiration مزال ماسالا، السيرفر كيتيق فالمعلومات اللي لداخل بلا ما يرجع للداتابيز.

## مثال تطبيقي: عملية الموافقة
1. **Login**: الماناجير كيدخل. السيرفر كيصاوب JWT: `{ "user": "manager1", "role": "APPROVER", "exp": 1715000000 }`.
2. **Signing**: السيرفر كيسني هادشي بـ secret key: `HS256(payload, secret)`.
3. **Request**: الماناجير كيصيفط طلب لـ `/approve-order` ومعاه `Authorization: Bearer <token>`.
4. **Validation**: السيرفر كيشوف التوكن، كيتأكد من السينياتور ومن التاريخ `exp`. إلا كان كلشي هو هذاك، الطلب كيتقبل.

## غلط شائع: التيقة فالمعلومات بلا فيريفيكاسيون
بزاف ديال الناس كيغلطو وكيديكوديو (decode) الـ payload باش ياخدو user ID قبل ما يتأكدو من السينياتور. الـ JWT كيكون غير Base64 (ماشي encrypted)، يعني أي واحد يقدر يبدلو. خاصك ديما تفيريفيكي السينياتور هي الأولى، وإلا يقدر شي مستخدم يبدل الـ role ديالو من `REQUESTER` لـ `APPROVER` بيده.

## مشكل الـ Revocation
هاد السيسطيم stateless فيه واحد العيب: صعيب تحبس token بمجرد ما تخرج. إلا تسرق التوكن ديال الماناجير، كيبقى خدام حتى يسالي الوقت ديالو. باش نحلو هاد المشكل، كنستعملو Access Tokens قصيرة بزاف و Refresh Tokens كيكونوا فالداتابيز، وهكا كنرجعو شوية ديال state باش نضمنو السيكيريتي.

## تمرين تطبيقي
**الحالة**: واحد الـ JWT السينياتور ديالو صحيحة، ولكن التاريخ ديال `exp` سالا البارح. واش السيرفر خاصو يقبل الطلب؟

**الجواب**: لا. السينياتور كتقول لينا غير بلي التوكن ماتبدلش، ولكن خاص السيرفر ضروري يشوف واش التاريخ مزال خدام.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
