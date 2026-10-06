---
title: "علاش localhost:3000 و localhost:8080 كيتعتابرو Origins مختلفين"
description: "فهم كيفاش المتصفح كيحدد الـ origin وعلاش اختلاف الـ ports كيسبب مشاكل CORS فاش كتكون خدام local."
pubDate: 2026-10-14T19:48:00.000Z
translationKey: 196-why-localhost-3000-and-localhost-8080-are-different-origins
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل عندك App ديال React خدامة فـ `localhost:3000` و API ديال Spring Boot فـ `localhost:8080`. ملي كتحاول تجيب data بـ fetch، المتصفح كيطلع ليك error حمراء فيها 'CORS'. غادي تقول مع راسك: 'راه كلشي فـ PC ديالي، علاش المتصفح كيشوفهم مختلفين؟'

## شنو هي الـ Origin بالضبط؟
فـ security ديال الويب، الـ **Origin** ماشي هي غير السمية ديال domain. هي مجموعة من تلاتة ديال الحوايج: **Scheme** (البروتوكول)، **Host** (السيرفر)، و **Port**. إلا تبدلات غير وحدة من هاد التلاتة، المتصفح كيعتبرها 'Cross-Origin'.

| المكون | Origin A | Origin B | واش بحال بحال؟ |
| :--- | :--- | :--- | :--- |
| Scheme | http | http | اه |
| Host | localhost | localhost | اه |
| Port | 3000 | 8080 | **لا** |

حيت الـ ports مختلفين، `http://localhost:3000` و `http://localhost:8080` كيتعتابرو جوج ديال الـ origins مختالفين تماماً.

## كيفاش المتصفح كيخدم بـ Same-Origin Policy
الـ Same-Origin Policy (SOP) هي واحد الحماية باش السكريبت لي جاي من origin ما يقدرش يقرا data من origin أخرى. خاصك تعرف بلي SOP ماشي ديما كتمنع *إرسال* الطلب. يقدر الطلب (simple request) يوصل للسيرفر ويغير شي حاجة فـ database، ولكن المتصفح كيمنع الـ JavaScript باش يقرا الجواب (response) إلا إذا السيرفر عطاه الإذن عبر headers ديال CORS.

## مثال تطبيقي: تطبيق ديال Procurement
تخايل App ديال طلبات الشراء، فين الموظف (requester) فـ port 3000 كيصيفط طلب شراء لـ backend فـ port 8080.

**الطلب من Frontend:**
```javascript
fetch('http://localhost:8080/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'Laptop', qty: 1 })
});
```

**النتيجة:** المتصفح كيصيفط الطلب، والسيرفر كيعالجو وكيرجع `201 Created`. ولكن حيت السيرفر ما صيفطش header سميتو `Access-Control-Allow-Origin` ، المتصفح كيمنع الـ frontend باش يشوف هاد الجواب وكيطلع error ديال CORS.

## غلط شائع: استعمال الـ Wildcard
بزاف ديال developers كيستعملو `@CrossOrigin("*")` فـ Jakarta EE باش يحلوا المشكل. هاد الطريقة خدامة فـ APIs لي مفتوحة للعموم، ولكن ما خداماش إلا كنتي باغي تصيفط cookies أو headers ديال authentication. إلا كانت `credentials` هي `include` فـ fetch، السيرفر **ما يمكنش** يستعمل `*`؛ خاصو يحدد بالضبط `http://localhost:3000`.

## تمرين تطبيقي
إلا كان الـ frontend ديالك فـ `https://app.local` والـ backend فـ `https://api.local` ، واش هادو نفس الـ origin؟

**الجواب:** لا. حيت الـ hosts (`app.local` و `api.local`) مختلفين، إذن هما origins مختلفين.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
