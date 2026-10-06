---
title: "كيفاش خدامة l'authentification بـ JWT"
description: "شرح مفصل على JSON Web Tokens وكيفاش كتخلي التواصل مع الـ API يكون آمن وبلا ما يحتاج السيرفر يعقل على كل session."
pubDate: 2026-10-14T23:48:00.000Z
translationKey: 200-how-jwt-authentication-works
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. ملي كيدير login، السيرفر خاصو يعرف شكون هاد السيد فكل request بلا ما يبقى يقلب فـ database كل مرة. هنا فين كيجي الدور ديال JWT باش يحل هاد المشكل بطريقة stateless.

## شنو هو هاد الـ Token؟
الـ JWT ماشي هو session ID، ولكن هو بحال واحد الصندوق ديال المعلومات. كيتكون من 3 ديال الأجزاء مفروقين بنقطة (.): الـ Header (فيه النوع ديال l'algorithme)، الـ Payload (فيه المعلومات بحال `userId` و `role`)، والـ Signature. هاد السينياتور هي أهم حاجة، حيت كتصاوب بـ hashing ديال الـ header والـ payload مع واحد الساروت (secret key) كيكون غير السيرفر اللي عارفو.

## كيفاش كدوز العملية
ملي المستخدم كيدخل credentials ديالو، السيرفر كيتأكد منهم. بلاصة ما يفتح session فـ RAM، كيصاوب JWT وكيصيفطو للكليان. الكليان كيخزنو وكيصيفطو فكل request فـ l'en-tête `Authorization: Bearer <token>`. السيرفر ملي كيوصلو، كيتحقق من السينياتور باش يتأكد بلي حتى واحد ما بدلها، وكيشوف واش التاريخ ديالو (`exp`) مزال خدام.

## مثال تطبيقي: الموافقة على الطلب
نفترضو عندنا Manager بغا يوافق على طلب. الـ payload ديال الـ JWT غيكون بحال هكا:
```json
{
  "sub": "manager_123",
  "role": "MANAGER",
  "exp": 1715600000
}
```
ملي الـ Manager كيصيفط request لـ `/approve/request/45` السيرفر كيقرا التوكن. إلا كانت السينياتور صحيحة والـ `role` هو `MANAGER` كيدوز الطلب. ولكن إلا حاول شي واحد يبدل الـ role لـ `ADMIN` فـ payload، السينياتور غتولي غالطة حيت الساروت ديال السيرفر مابقاش كيماشي مع داك التغيير.

## غلط شائع: تيق فـ Payload بلا verification
بزاف ديال المطورين كيغلطو ملي كيديكوديو الـ payload (حيت هو غير Base64 وأي واحد يقدر يقراه) وكيخدمو بالمعلومات اللي فيه بلا ما يتأكدو من السينياتور. خاصك ديما دير verification هي الأولى. إلا تقتي فـ `userId` بلا verification، أي واحد يقدر يسرق حساب أي مستخدم غير بتبديل ID.

## تمرين تطبيقي
**الحالة:** واحد التوكن فيه `exp: 1600000000` (تاريخ من 2020). السينياتور ديالو صحيحة 100%. واش السيرفر خاصو يقبلو؟

**الجواب:** لا. وخا السينياتور صحيحة، التوكن راه سالات الصلاحية ديالو (expired). السيرفر خاصو يرفضو ويطلب من المستخدم يعاود يدير login.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
