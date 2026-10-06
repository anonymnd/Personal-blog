---
title: "شنو كيوقع ملي كيسالي المفعول (Expire) ديال JWT؟"
description: "فهم كيفاش كيخدم الـ expiration ديال التوكن وكيفاش تحافظ على session خدامة باستعمال refresh tokens."
pubDate: 2026-10-15T02:48:00.000Z
translationKey: 203-what-happens-when-a-jwt-expires
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

تخيل معايا واحد المستخدم خدام فـ application ديال الشراء (procurement)، كيعمر طلبية طويلة، وملي كيورك على 'Submit'، السيرفر كيجاوبو بـ 401 Unauthorized. المستخدم كيتلف حيت يلاه دخل للحساب ديالو هادي ساعة. هادي هي الحالة ملي كيسالي المفعول ديال التوكن.

## كيفاش كيخدم الـ Expiration
الـ JWT كيكون stateless، يعني السيرفر ما كيحفظش session فـ base de données. السيرفر كيشوف غير واحد القيمة سميتها `exp` (expiration) كاينة وسط التوكن. ملي كتوصل request، السيرفر كيحل التوكن، كيتأكد من السينيور (signature)، وكيقارن الوقت ديال دابا مع القيمة ديال `exp`. إلا كان الوقت ديال دابا فات `exp` ، التوكن كيولي غير صالح وخا السينيور تكون صحيحة.

## مثال من application ديال الشراء
نفترضو عندنا application فين الموظف (Requester) كيدير طلب شراء:
1. **Login**: المستخدم كياخد Access Token (كيصلاح لـ 15 دقيقة) و Refresh Token (كيصلاح لـ 7 أيام).
2. **Request**: المستخدم كيصيفط POST لـ `/api/requests` بالـ Access Token.
3. **Expiration**: من بعد 16 دقيقة، السيرفر كيلقى بلي `exp` سالات، وكيرفض الطلب.
4. **Recovery**: الـ client كيشد erreur 401، كيصيفط Refresh Token لـ `/api/refresh` وكيجيب Access Token جديد بلا ما يطلب من المستخدم يعاود يدخل المودباس.

## غلط شائع: التيقة فـ Decoded Claims
بزاف ديال المطورين كيحلوا التوكن فـ frontend باش يشوفوا واش `exp` مزال ما سالات وكيصحاب ليهم بلي التوكن راه مزال خدام.

**غلط**: `if (decoded.exp > now) { sendRequest(); }` 
**الصحيح**: ديما تعامل مع 401 ديال السيرفر هي اللي صحيحة. السيرفر هو اللي خاصو يتأكد من السينيور عاد يتيق فـ أي معلومة، بما فيها تاريخ انتهاء الصلاحية.

## مشكل الـ Logout
حيت JWT stateless، ما يمكنش تمسح التوكن من السيرفر. إلا كان التوكن باقي ليه 10 دقايق، غادي يبقى خدام وخا المستخدم يورك على 'Logout'. باش تحل هاد المشكل، المطورين كيخدموا بـ 'blacklist' فـ Redis باش يسجلوا التوكنات اللي تـ revoked حتى يسالي المفعول ديالهم.

## تمرين تطبيقي
**الحالة**: واحد JWT عندو `exp` هي `1672531200`. الوقت ديال السيرفر دابا هو `1672531201`. واش السيرفر غيقبل الطلب؟

**الجواب**: لا، حيت الوقت ديال دابا فات الوقت ديال expiration، إذن التوكن سالا المفعول ديالو.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
