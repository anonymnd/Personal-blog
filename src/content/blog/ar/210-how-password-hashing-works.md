---
title: "كيفاش كيخدم الـ Password Hashing"
description: "شرح مبسط للطريقة باش كنحميو كلمات السر باستعمال الـ salts والـ hashing algorithms اللي كيكونوا ثقال."
pubDate: 2026-10-15T09:48:00.000Z
translationKey: 210-how-password-hashing-works
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

تخيل راسك خدام على application ديال procurement (مشتريات) فين manager خاصو يوافق على الطلبات. إلا خبيتي passwords كيفما هما (plain text) وتسرقات base de données، كاع الحسابات غادي يتشفروا فدقة وحدة. بزاف ديال المبتدئين كيغلطو بين الـ hashing والـ encryption؛ الـ encryption كيكون فيه الطريق رايحة وجاية (تقدر ترجع النص الأصلي)، ولكن الـ hashing طريق فجهة وحدة، يعني مستحيل ترجع من الـ hash للمود باس الأصلي.

## كيفاش كيخدم الـ Hashing
الـ hash function كتاخد أي نص وكتعطيك واحد السلسلة ديال الحروف بطول محدد. وخا يكون المود باس طويل بزاف، النتيجة (digest) ديما عندها نفس الطول. أهم حاجة هي أن نفس المود باس ديما كيعطي نفس الـ hash. ولكن، إلا بدلتي غير حرف واحد، الـ hash كامل كيتبدل، وهادشي كيتسمى avalanche effect.

## الدور ديال الـ Salt
إلا كانو جوج ديال الناس دايرين نفس المود باس "123456"، الـ hashes ديالهم غادي يكونو بحال بحال. الـ hackers كيستعملو شي حاجة سميتها "Rainbow Tables" (ليستات واجدين فيهم المود باسات معروفين والـ hashes ديالهم) باش يلقاو المود باس دغيا. باش نحبسو هادشي، كنزيدو **Salt**: واحد النص عشوائي كنزيدوه للمود باس قبل ما نديرو ليه الـ hashing. هكذا، وخا يكون المود باس متشابه، الـ salt مختلف، والنتيجة كتكون مختلفة.

## اختيار الـ Algorithm المناسب
دابا مابقاش خدامين بـ MD5 ولا SHA-256 حيت سراع بزاف، والـ GPUs يقدروا يجربو ملايين الاحتمالات فثانية. داكشي علاش كنستعملو algorithms "ثقال". BCrypt هو اللي مستعمل بزاف فـ Spring، ولكن OWASP دابا كتنصح بـ Argon2id فـ السيسطيمات الجداد حيت كيقاوم الـ GPUs حسن.

## مثال تطبيقي: Application ديال المشتريات
واحد requester بغا يصاوب حساب بمود باس `SecurePass123`:
1. **التسجيل**: السيسطيم كيصاوب salt عشوائي `xYz789`. كيدير hash لـ `SecurePass123 + xYz789` باستعمال BCrypt. فـ الـ DB كيتخزن الـ hash النهائي: `$2a$10$R9h...` (اللي ديجا فيه الـ salt).
2. **الدخول**: المستخدم كيدخل `SecurePass123`. السيسطيم كيجيب الـ hash اللي مخزن، كيخرج منو الـ salt، كيدير hash للمود باس اللي دخل، وكيقارن النتيجة. إلا كانوا بحال بحال، كيدخل.

## غلط شائع: استعمال الـ Encryption
بزاف كيغلطو وكيستعملو AES. المشكل هو إلا خبيتي الساروت (key) فالسيرفر وتسرق السيرفر، الـ hacker يقدر يفك التشفير ديال كاع المود باسات. الـ hashing كيهنيك من هاد المشكل حيت أصلاً ماكاينش ساروت باش ترجع النص الأصلي.

## تمرين تطبيقي
**سؤال**: علاش خاصنا نزيدو الـ salt وخا الـ algorithm معقد؟
**جواب**: باش نحبسو الـ Rainbow Table attacks وباش المود باسات اللي متشابهين يعطيو hashes مختلفين.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
