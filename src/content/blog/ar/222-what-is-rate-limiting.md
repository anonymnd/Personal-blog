---
title: "كيفاش تختار Rate-Limiting Algorithms باش تحكم فـ Bursts و Fairness"
description: "دليل تقني على Token Bucket و Leaky Bucket، كيفاش تحسب الـ burst، وكيفاش تضمن العدل بين لي كليان فـ API ديال geocoding."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 222-what-is-rate-limiting
seriesOrder: 49
locale: ar
tags: ["system-design","learning-series"]
draft: false
---

## علاش كنحتاجو Rate Limiting وكيفاش نختارو الـ Key

الـ Rate limiting كيحمي السيرفر باش ما يطيحش ملي كيكثر عليه الضغط. الهدف هو نمنعو شي كليان واحد (سواء كان غلط أو مقصود) باش ما يستهلكش كاع الموارد ويخلي لخرين بلا خدمة.

أهم حاجة هي تختار الـ "key" اللي غاتحدد بيها اللي ميت. إلا درتي Global limiter (ليمت واحد للـ API كاملة)، راه أي واحد دار الضغط غايخلي كاع لي كليان لخرين ياخدو 429 Too Many Requests. باش تكون Fairness (عدل)، خاصك دير Per-client limiting (تخدم بـ API key أو User ID)، هكا غير اللي فات ليميت ديالو هو اللي كيتحبس.

## الفرق بين Token Bucket و Leaky Bucket

بجوج كينقصو من الضغط، ولكن كيتعاملو مع الـ "bursts" (دقة وحدة ديال الطلبات) بطريقة مختلفة.

**Token Bucket**: تخيل سطل كيتعمر بـ tokens بواحد الريتم ثابت (refill rate). كل request كتاخد token واحد. إلا كان السطل عامر، tokens الجداد كيمشيو. إلا خوى السطل، الـ request كترفض. هاد الطريقة كتسمح بـ "burst" (يعني تقدر تدوز بزاف ديال requests دقة وحدة) مادام السطل عامر.

**Leaky Bucket**: تخيل سطل فيه تقبة من التحت. الـ requests كيدخلو للسطل وكيخرجو من ديك التقبة بواحد الريتم ثابت ومحدد. إلا عمر السطل بزاف، الـ requests الجداد كيتلاحو. هاد الطريقة كتخلي trafik يكون مقاد (smooth) وكتقتل الـ bursts تماماً.

## مثال تطبيقي: Geocoding API

تخيل عندنا API ديال geocoding بهاد الإعدادات:
- **Refill Rate**: 5 requests فالثانية (rps)
- **Bucket Capacity**: 10 tokens

### حساب الـ Burst
إلا كانت الـ API مرتاحة شحال هادي، السطل غيكون عامر (10 tokens).

1. **T=0s**: كليان صيفط 12 request دقة وحدة.
   - 10 requests غادوز دغيا (حيت استهلكنا الـ burst capacity).
   - 2 requests غايترفضو بـ 429 status.
2. **T=1s**: السطل تعمر بـ 5 tokens جداد.
   - الكليان دابا يقدر يصيفط 5 requests خرين دقة وحدة.

### الـ 429 و Retry-After
ملي كنرفضو request، كنصيفطو HTTP 429. باش الكليان ما يبقاش يعاود يصيفط كل ميكرو-ثانية ويزيد يضغط على السيرفر، كنضيفو header سميتو `Retry-After`.

- **Retry-After قصير**: كيخلي السيرفيس يرجع يخدم دغيا، ولكن يقدر يدير "thundering herd" إلا بزاف ديال لي كليان عاودو فدقة وحدة.
- **Retry-After طويل**: كيحمي السيرفر كتر، ولكن كيخسر الـ user experience.

## ملاحظات تقنية

باش تفرض quota وحدة بين instances، نسق token consumption atomically بـ Redis ولا gateway ولا limiter مصممة أخرى. Redis implementation وحدة ماشي فرض عام. Local buckets مستقلين كيضاعفو quota إلا traffic allocation محسوبة. اختار behavior إلا limiter store طاحت.

جمع client quotas للعدالة مع global capacity limit إلا ضرورية؛ حتى واحدة ما كتضمنش availability بوحدها. Identity keys خاصها تكون موثوقة وIP تقدر تجمع users وراء NAT. الحسابات كتفترض ما كايناش requests بين الأوقات وrefill policy موثقة. Leaky bucket هنا queue/shaping variant؛ policing variant تقدر ترفض بلا queue.
## تمرين

**السيناريو**: سيستيم فيه refill rate ديال 2 tokens/sec و capacity ديال 5. السطل دابا خاوي.
1. شحال من request يقدر يدوز فـ T=3 ثواني؟
2. إلا جاو 10 ديال requests فـ T=3 ثواني، شحال غايترفضو؟

**الجواب**:
1. فـ T=3s، السطل تعمر بـ 3 × 2 = 6 tokens، ولكن بما أن الـ capacity هي 5، غايكون فيه غير 5. إذن 5 requests يقدروا يدوزو.
2. جاو 10، دازو 5، و 5 ترفضو.
