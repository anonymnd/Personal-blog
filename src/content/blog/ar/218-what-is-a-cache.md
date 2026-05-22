---
title: "كيفاش تخدم بـ Redis Cache-Aside بلا ما تخرج داتا غالطة"
description: "شرح مفصل لـ Cache-Aside باش تسير داتا ديال سينما بلا ما يوقع ليك مشكل ديال داتا قديمة (stale) ولا يطيح ليك السيرفر (stampede)."
pubDate: 2026-10-08T15:48:00.000Z
translationKey: 218-what-is-a-cache
seriesOrder: 48
locale: ar
tags: ["system-design","learning-series"]
draft: false
---

## شنو هو الـ Cache-Aside؟

فـ Cache-Aside (لي كيتسمى حتى Lazy Loading)، التطبيق ديالك هو لي كيكون مسؤول على العلاقة بين الـ Database (لي هي المصدر الحقيقي للداتا) والـ Cache (لي هي بلاصة سريعة). هنا الـ cache ما كيتحدثش بوحدو ملي كتبدل شي حاجة فـ DB. التطبيق كيتبع هاد المنطق: كيشوف واش الداتا كاين فـ cache؛ إلا كانت (hit)، كيرجعها ديريكت؛ إلا ما كانتش (miss)، كيمشي يجيبها من الـ DB، كيحطها فـ cache، وعاد كيرجعها للمستخدم.

المشكل فهاد الطريقة هو أن الداتا تقدر تولي قديمة (stale). مثلاً، إلا تلغات شي حصة ديال فيلم فـ DB ولكن الـ cache باقي شاد التوقيت القديم، المستخدم غادي يشوف معلومة غالطة.

## سيناريو: تسيير حصص السينما

تخيل عندك سيستيم كيعطي توقيت الأفلام. الداتا كتقرا بزاف ولكن كتبدل مرة مرة (مثلاً شي حصة تلغات).

### تتبع العملية (Trace)

1. **قراءة أولى (Miss):** مستخدم طلب `movie_123`. الـ cache خاوي. التطبيق مشى لـ DB → لقا "19:00". حط "19:00" فـ Redis وعطاها TTL (وقت انتهاء) ديال 3600 ثانية. المستخدم شاف "19:00".
2. **قراءة تانية (Hit):** مستخدم آخر طلب `movie_123`. التطبيق لقا "19:00" فـ Redis. المستخدم شافها ديريكت بلا ما يصدع الـ DB.
3. **تحديث الداتا (Invalidation):** الأدمن لغى حصة 19:00. التطبيق بدل الداتا فـ DB لـ "Cancelled". باش ما يبقاش الـ cache فيه داتا غالطة، خاص التطبيق يدير `DEL movie_123` فـ Redis دابا.
4. **قراءة مورا التحديث:** مستخدم طلب `movie_123`. الـ cache خاوي (حيت مسحناه). التطبيق مشى لـ DB → لقا "Cancelled". حط "Cancelled" فـ Redis. المستخدم شاف "Cancelled".

## كيفاش تعامل مع المشاكل التقنية

Reader تقدر تقرا screening قديمة وتوقف، ومن بعد تعمر cache من بعد transaction أخرى commit وإلغاء key. Invalidation بعد commit كتفادى حذف cache لـ transaction غادي rollback، ولكن ما كتمنعش بوحدها stale refill متأخرة. TTL كتحد عمر هاد entry؛ stale writes متكررين ولا replica lag ولا resets خاصهم analysis. Version-aware writes ولا coordinated invalidation ولا bounded-staleness policy اختيارات ممكنة. Booking eligibility خاصها authoritative state.

فـ hot-key miss، جمع requests باش loader وحدة تعمر والآخرين يتسناو ولا يستعملو stale data مسموحة. Local mutex كتغطي غير instance وحدة؛ distributed leases خاصهم expiry وownership آمنة. Negative caching كتخزن not-found marker واضحة مع TTL قصيرة، ماشي Java null اللي كتتشابه مع miss. دخل tenant وquery dimensions فالـ key.
## مثال تطبيقي: الكود بالـ Java

استعمل cache envelope typed فيها found وvalue منفصلين وserializer configured. Redis كتخزن bytes؛ Java null ماشي negative marker موثوقة. هادا pseudocode توضيحي:

```text
GET screening:tenant-7:id-123
  MISS → database lookup
  FOUND → SET {found:true,value:...} with positive TTL
  ABSENT → SET {found:false,value:null} with short negative TTL
HIT {found:false,...} → return absent without a DB lookup
UPDATE → commit authoritative change → invalidate key
```

Hit كتفادى DB read، ما كتضمنش غير query وحدة فالساعة: eviction وretries وconcurrent misses وinvalidation يقدرو يزيدو reads. إلا Redis فشلات، اختار bounded fallback ولا failure؛ fallback بلا حدود تقدر تغرق DB. راقب hit rate وload duration وstale incidents. Invalidation بعد commit خاصها retry ولا reconciliation إلا فشلات. Trace العادية ما كتضمنش strict consistency فكل races.
## تمرين

Key وحدة ديال premiere إلا سالات تقدر تعطي misses متزامنين بزاف: دير request coalescing لهاد key. TTL jitter كتفرق expiration بين keys مختلفة ولا entries مستقلين، ما كتفرقش requests ديال نفس Redis key الوحدة. جرب burst وقت expiry وRedis outage وreader واقفة وقت cancellation. تأكد من staleness policy وأن booking decisions باقين authoritative.
