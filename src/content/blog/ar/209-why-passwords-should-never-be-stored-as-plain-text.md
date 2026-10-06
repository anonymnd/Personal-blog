---
title: "علاش خاصنا مانهزوش المودباسات (Passwords) كما هما فـ Base de données"
description: "شرح علاش تخزين المودباسات كـ Plain Text خطر وكيفاش كنخدمو بـ Hashing و Salting باش نحميو المعلومات."
pubDate: 2026-10-15T08:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا واحد المطور كيصاوب تطبيق ديال الشراء (procurement app) فين الموظفين كيصيفطو طلبات. باش يسهل على راسو، دار المودباسات فـ column سميتها `password` كتبقى كيفما هي (plain text). إلا شي هكر قدر يدخل لـ base de données عن طريق SQL injection، غادي يلقى كاع المودباسات باينين. ما غاديش يحتاج يقلب عليهم، غادي غير يقراهم ويتحكم فكاع الحسابات.

## خطر الـ Plain Text
تخزين المودباسات بلا تشفير هو غلط كبير حيت كيرد السيستيم ضعيف بزاف. إلا تسربات الداتا، ما كيبقاش عندك حتى شي خط دفاع آخر. وزيد عليها أن الناس غالباً كيستعملو نفس المودباس فبزاف ديال السيتات، يعني إلا تسرب المودباس من تطبيق الشراء، يقدر الهكر يدخل حتى للإيميل ديال الخدمة ولا الحساب البنكي ديال المستخدم.

## الفرق بين Hashing و Encryption
بزاف كيغلطو وكيقولو خاصنا نديرو Encryption للمودباسات. الـ Encryption هو طريق فجوج اتجاهات؛ يعني إلا عندك الساروت (key) تقدر ترجع المودباس كيف كان. ولكن المودباسات خاصهم يدوزو من Hashing. الـ Hashing هو عملية فجهة وحدة (one-way)؛ كتحول المودباس لواحد السلسلة ديال الحروف والأرقام، ولكن مستحيل ترجعها للمودباس الأصلي حسابياً.

## شنو هو الـ Salting؟
الـ Hashing بوحدو ما كافيش حيت كاينين شي لستات واجدين سميتهم Rainbow Tables فيهم المودباسات المشهورين والـ hash ديالهم. باش نحبسو هادشي، كنستعملو الـ Salt: وهو واحد النص عشوائي كنزيدوه للمودباس قبل ما نديرو ليه الـ hash. هكذا، وخا جوج ناس عندهم نفس المودباس، الـ hash اللي غيتخزن فـ base de données غيكون مختلف تماماً.

## مثال تطبيقي
فـ Spring applications، كنستعملو `BCryptPasswordEncoder` حيت هو اللي كيتكلف بالـ salt بوحدو.

```java
// مثال توضيحي باستعمال Spring Security
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String rawPassword = "SecurePass123!";

// هاد النتيجة هي اللي كتخزن فـ DB
String hashedPassword = encoder.encode(rawPassword);

// باش نتأكدو من المودباس فاش كيبغي يدخل المستخدم:
boolean isMatch = encoder.matches(rawPassword, hashedPassword);
```

## غلط شائع: استعمال Hash سريع
كاين اللي كيستعمل MD5 ولا SHA-256 حيت خفاف. ولكن فـ security، السرعة هي نقطة ضعف. الهكر يقدر يجرب ملايير ديال الـ hashes فالثانية. داكشي علاش كنستعملو Argon2id ولا BCrypt حيت تقال بالعاني باش يصعبو المأمورية على أي واحد باغي يسرق المودباسات.

## تمرين تطبيقي
**الحالة:** لقيتي فـ base de données جوج ديال المستخدمين عندهم نفس الـ hash هو `5e884898da28...`. شنو اللي ناقص فـ هاد السيستيم؟

**الجواب:** ناقص الـ Salting. حيت كون كان كاين salt لكل مستخدم، كون لقيتي hash مختلف وخا يكون المودباس هو نفسه.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
