---
title: "شرح Redis من خلال مشاكل حقيقية فـ API"
description: "تعلم كيفاش تحل مشاكل الـ API بحال الثقل ديال Database و Rate Limiting باستعمال Redis كـ shared state."
pubDate: 2026-10-15T18:48:00.000Z
translationKey: 219-redis-explained-through-real-api-problems
locale: ar
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك API ديال شراء المعدات (procurement) فين الموظفين كيصيفطو طلبات. ملي كبرات الشركة، الـ Database مابقاتش قادرة تحمل آلاف الطلبات في الثانية على نفس الوثيقة ديال "قوانين الشركة"، والسيرفر كيتبلوكا ملي شي bot كيبدا يصيفط طلبات بزاف. مايمكنش تزيد غير السيرفرات حيت كل واحد عندو الذاكرة (RAM) ديالو بوحدو، وماعارفينش شنو كيدير الآخر.

## مشكل الـ Shared State
ملي كتزيد بزاف ديال الـ instances ديال API، كيوقع مشكل ديال التناقض في الـ cache local. إذا السيرفر A خزن معلومة والسيرفر B لا، المستخدم غادي يلقى نتائج مختلفة. Redis كتحل هاد المشكل حيت كتخدم كـ shared memory خارجية. كاع السيرفرات كيهضرو مع Redis، وهكدا كولشي كيشوف نفس الـ state.

## نقص الضغط على Database بـ Cache-Aside
باش الـ Database ماتطيحش، كنخدمو بـ Cache-Aside pattern. ملي شي واحد كيطلب وثيقة، الـ API كتشوف أولا في Redis. إذا مالقاتهاش (cache miss)، كتمشي تجيبها من الـ Database وكتخزنها في Redis باش المرة الجاية تكون واجدة.

```java
// مثال بسيط ديال Cache-Aside logic
public String getPolicy(String policyId) {
    String cached = redisClient.get("policy:" + policyId);
    if (cached != null) return cached;

    String dbPolicy = db.findPolicy(policyId);
    redisClient.setex("policy:" + policyId, 3600, dbPolicy);
    return dbPolicy;
}
```

## حبس الـ Spam بـ Rate Limiting
باش تمنع شي مستخدم يغرق السيستيم بالطلبات، كنخدمو بـ Token Bucket algorithm في Redis. كنخزنو counter لكل user. كل طلب كينقص token؛ وإذا وصل الصفر، الـ API كترجع `429 Too Many Requests`. حيت Redis atomic، ماكيوقعوش مشاكل ديال race conditions.

## غلط شائع: نسيان الـ Invalidation
بزاف ديال الناس كينساو يمسحو الـ cache ملي كيتبدل شي حاجة في الـ Database. مثلا، إذا المدير بدل قانون الشراء في الـ DB ولكن النسخة القديمة بقات في Redis، المستخدمين غادي يشوفو معلومات غالطة. الحل هو تمسح الـ key ديال Redis مباشرة ملي تدير update في الـ DB.

## تمرين تطبيقي
**الوضعية:** الـ API ديالك كتخدم بـ Redis باش تخزن session tokens. لاحظتي بلي ملي المستخدم كيدير logout، كيبقى يقدر يدخل للسيستيم لمدة 5 دقائق. شنو هو المشكل؟

**الجواب:** غالبا الـ logout logic مكاتمسحش الـ key من Redis، وكيبقى الـ token خدام حتى كيسالي الـ TTL (Time To Live) ديالو.
