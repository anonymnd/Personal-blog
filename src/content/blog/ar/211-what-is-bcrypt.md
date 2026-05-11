---
title: "شنو هو BCrypt؟"
description: "شرح مبسط على الطريقة باش كيتخباو المودباسات (Passwords) فالسيرفر باش حتى واحد ما يقدر يسرقهم."
pubDate: 2026-10-15T10:48:00.000Z
translationKey: 211-what-is-bcrypt
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (Procurement app) فين الموظفين كيصيفطو طلبات. عندك قاعدة بيانات فيها المستخدمين، ولكن إلا شي هكر دخل ليها ولقى المودباسات مكتوبين عادي (Plain text)، غتكون كارثة. ما يمكنش تستعمل Encryption حيت هو كيمشي ويجي (Two-way)، يعني اللي عندو الساروت يقدر يرجع المودباس كيف كان. هنا فين كيجي الدور ديال BCrypt.

## كيفاش كيخدم هاد الـ Hashing
BCrypt ماشي Encryption، بل هو Hashing function. الفرق هو أن الـ Hashing كيمشي فجهة وحدة (One-way)؛ يعني المودباس ملي كيتحول لـ Hash، ما يمكنش ترجعو للمودباس الأصلي. BCrypt كيزيد واحد الحاجة سميتها Salt (ملحة)—وهي عبارة عن سلسلة ديال الحروف عشوائية—باش حتى لو كانو جوج ديال الناس عندهم نفس المودباس، الـ Hash اللي كيخرج كيكون مختلف تماماً. هادشي كيخلي الـ Rainbow Tables ما يخدموش.

## قضية الـ Cost Factor
الحاجة اللي كتميز BCrypt هي الـ Cost factor. هاد الخاصية كتخلي المطور يحدد شحال ديال الوقت خاص السيرفر باش يحسب الـ Hash. حيت الماتيريال (Hardware) كيولي سريع، كنقدرو نزيدو فهاد الـ Cost باش نثقلو العملية على الهكرز اللي كيديرو Brute-force، ولكن بالنسبة للمستخدم اللي كيدخل المودباس ديالو مرة وحدة، ما غاديش يحس بفرق.

## مثال تطبيقي: كيفاش كنتأكدو من المودباس
فـ Spring application كنستعملو `BCryptPasswordEncoder` بلا ما نبقاو نقارنو النصوص بيدينا.

```java
// مثال توضيحي
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12); // Cost factor هو 12
String rawPassword = "buyer_secret_2024";
String encodedPassword = encoder.encode(rawPassword);

// عملية التأكد
boolean isMatch = encoder.matches(rawPassword, encodedPassword);
System.out.println("واش المودباس صحيح: " + isMatch); // النتيجة: true
```

## غلط شائع: تسيير الـ Salt بوحدك
بزاف ديال المبتدئين كيحاولوا يصاوبو Salt بوحدهم ويخزنوه فـ Column بوحدها فـ Database. هادشي ما عندو حتى معنى حيت BCrypt كيدمج الـ Salt وسط الـ Hash اللي كيخرج. الميثود `matches()` هي اللي كتعرف تجبدو وتخدم بيه.

## تمرين تطبيقي
إلا لقيتي Hash ديال BCrypt كيبدا بـ `$2a$10$...` شنو كيعني هاد الرقم `10`؟

**الجواب:** كيعني الـ Cost factor، يعني السيرفر دار 2^10 ديال الدورات (Iterations) باش يخرج هاد الـ Hash.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
