---
title: "علاش Authentication ماشي غير endpoint ديال login"
description: "غادي نشوفو علاش تأكيد الهوية ماشي هو غير login، وكيفاش نتعاملو مع tokens والـ security بطريقة صحيحة."
pubDate: 2026-10-15T11:48:00.000Z
translationKey: 212-why-authentication-is-more-than-a-login-endpoint
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيسحاب ليهم بلي غير يصاوبو endpoint `/login` كيتأكد من المودباس، صافي راه دار security. ولكن هادي غير البداية. المشكل الحقيقي هو كيفاش تحافظ على الهوية ديال المستخدم فكل request بلا ما تطلب منو المودباس كل مرة وبلا ما تخلي السيستيم معرض للاختراق.

## دورة حياة الـ Token
ملي كيتأكد السيستيم من المستخدم، كنعطيوه JWT (JSON Web Token). واحد الغلط شائع هو كيسحاب للناس بلي JWT مشفر (encrypted)، ولكن فالحقيقة هو غير signé. يعني أي واحد يقدر يقرأ المعلومات اللي فيه، ولكن ما يقدرش يبدلها حيت signature غادي تخسر. داكشي علاش ضروري الـ backend يتأكد من الـ algorithm، شكون صيفط الـ token (issuer)، وفين غادي (audience)، وفوقاش كيسالي (expiration).

## الفرق بين Authentication و Authorization
الـ Authentication هي باش نعرفو *شكون* أنت. أما الـ Authorization هي باش نعرفو *شنو* مسموح ليك دير. مثلا فـ application ديال الشراء (procurement)، الـ authentication كتخلي المستخدم يدخل، ولكن الـ authorization هي اللي كتمنع الموظف اللي دار الطلب (Requester) باش يوافق على الطلب ديالو راسو، وكتمنع الشاري (Buyer) يبدل ميزانية ديال قسم ماشي ديالو.

## مشكل تخزين المودباسات
المودباسات خاصهم يتخزنو بـ hashing (one-way salted)، ماشي encryption. BCrypt معروف بزاف فـ Spring ولكن عندو ليميت ديال 72-byte. دابا OWASP كتنصح بـ Argon2id حيت أقوى ضد الهجمات.

## مثال تطبيقي: Validation ديال Token
تخيل مستخدم بغا يشوف طلب شراء فـ `/api/requests/123` وصيفط معاه Bearer token.

```java
// مثال بسيط كيفاش كتكون validation
public boolean validateToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
    
    return !claims.getExpiration().before(new Date()) 
           && "procurement-app".equals(claims.getIssuer());
}
```
النتيجة: إلا كان الـ token سالا وقتو أو signature ديالو مغير، السيستيم كيرجع 401 Unauthorized بلا ما يوصل حتى لـ database.

## غلط شائع: وهم الـ Logout
بزاف كيسحاب ليهم بلي إلا مسحنا الـ JWT من `localStorage` راه المستخدم تخرج (logout). ولكن حيت JWT stateless، كيبقى خدام فالسيرفر حتى يسالي وقتو. باش تحبس الـ token فعليا، خاصك تخدم بـ blacklist أو refresh tokens.

## تمرين تطبيقي
سيناريو: عندك JWT فيه `role: "USER"`. المستخدم بدل هاد القيمة لـ `role: "ADMIN"` فالمتصفح وصيفطها. علاش السيرفر غادي يرفض الطلب؟

**الجواب:** حيت السيرفر كيتأكد من الـ signature cryptographique. أي تغيير فالمعلومات بلا الساروت (secret key) كيخلي الـ signature غير صالحة.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
