---
title: "كيفاش تختار بين Loops و Streams و Method References على حساب الـ Readability"
description: "مقارنة تقنية بين الطريقة العادية (iterative) والطريقة الوظيفية (functional) في Java باستعمال بيانات ديال sensors باش نشوفو شكون اللي ساهلة في القراية وشكون اللي فيها مخاطر."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 126-streams-vs-loops-when-should-you-use-each
seriesOrder: 27
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## الفرق بين Imperative و Functional

فاش كتكون خدام مع collections في Java، الاختيار بين `for-each` loop و `Stream` ماشي مسألة سرعة، ولكن مسألة "قصد" (intent). الـ loops العادية كتوصف *كيفاش* نديرو الحاجة (خطوة بخطوة)، بينما الـ Streams كتوصف *شنو* بغينا يوقع (سلسلة ديال التحويلات).

## السيناريو: تلخيص بيانات ديال sensors

تخيل عندنا سيستيم كيجيب قراءات ديال sensors. خاصنا نحيدو القراءات اللي ماشي صحيحة (null أو negative) ونحسبو شحال من مرة الحرارة فاتت واحد السقف (threshold) محدد.

### الطريقة العادية (Loop)

في الـ loop، حنا اللي كنتحكمو في الـ state. هاد الطريقة كتكون ساهلة في القراية فاش كتكون الـ logic معقدة أو فاش كنبغيو نبدلو شي حاجة برا الـ loop (side effects).

```java
// Illustrative: Imperative loop approach
public long countThresholdCrossingsLoop(List<Double> readings, double threshold) {
    long count = 0;
    for (Double reading : readings) {
        if (reading != null && reading >= 0) {
            if (reading > threshold) {
                count++;
            }
        }
    }
    return count;
}
```

### الطريقة الوظيفية (Stream)

الـ Streams كيخليونا نلصقو العمليات وحدة مورا وحدة. الحاجة المهمة هنا هي الـ **laziness**: العمليات بحال `filter` مكيخدموش حتى كنوصلو لعملية نهائية (terminal operation) بحال `count()`. هادشي كيخلي JVM تحسن الطريقة باش كيخدم الكود.

```java
// Illustrative: Stream approach
public long countThresholdCrossingsStream(List<Double> readings, double threshold) {
    return readings.stream()
        .filter(Objects::nonNull)
        .filter(r -> r >= 0)
        .filter(r -> r > threshold)
        .count();
}
```

## الـ Method References والـ Readability

في المثال ديال stream، `Objects::nonNull` هي method reference. هي غير اختصار لـ lambda `r -> Objects.nonNull(r)`. هاد الطريقة كتنقص "الصداع" ديال سميات المتغيرات وكتخلينا نركزو على شنو كيدير الكود.

**فاش تستعمل method references:**
1. فاش كتكون الـ lambda غير كتعيط لشي method موجودة بنفس الـ arguments.
2. فاش كيكون سميت الـ method واضحة وكتشرح راسها (مثلا `String::toUpperCase` بلاصة `s -> s.toUpperCase()`).

## الـ Side Effects والترتيب (Ordering)

أكبر خطر في الـ Streams هو الـ "side effect". هادشي كيوقع فاش شي عملية وسط الـ stream كتبدل شي variable كاين برا ديالو.

**طريقة غلط (Side Effect في Stream):**
```java
List<Double> results = new ArrayList<>();
readings.stream().forEach(r -> results.add(r)); // بعد من هادشي!
```
هاد الكود خطر. حيت إلا بدلتي الـ stream لـ `.parallelStream()`، الـ `ArrayList` (اللي ماشي thread-safe) غادي يوقع فيها مشاكل ديال race conditions، وتقدر تضيع ليك الداتا أو يخرج ليك `ConcurrentModificationException`.

**الترتيب (Ordering):**
في الـ sequential stream، الترتيب ديال العناصر كيبقى هو هو. ولكن الترتيب ديال *العمليات* مهم بزاف. فاش كدير `filter` في الأول، كتنقص عدد العناصر اللي غادي يدوزو للعمليات اللي موراها، وهادشي كيخلي الكود أحسن.

## ملخص المقارنة

| الميزة | For-Each Loop | Stream API |
| :--- | :--- | :--- |
| **الـ State** | كنتحكمو فيها بيدينا (mutable) | مخبية وسط الـ pipeline |
| **التنفيذ** | مباشر (Eager) | معطل (Lazy) حتى لآخر عملية |
| **Side Effects** | عادية ومقبولة | ممنوعة أو خطيرة |
| **القراية** | أحسن في الـ logic المعقد | أحسن في التحويلات المتسلسلة |

## تمرين

عندك list ديال `SensorReading` records (فيها `String id` و `double value`). صاوب stream pipeline اللي:
1. كيحيد القراءات اللي الـ ID ديالهم null.
2. كيحول القراءات غير للقيم (values) ديالهم.
3. كيحيد القيم اللي صغر من 100.0.
4. كيرجع لينا الحساب (count).

**الجواب:**
```java
public long countHighReadings(List<SensorReading> readings) {
    return readings.stream()
        .filter(r -> r.id() != null)
        .map(SensorReading::value)
        .filter(v -> v > 100.0)
        .count();
}
```

الأمثلة كتفترض sensor domain كترفض negatives؛ temperatures سلبية صالحة فـ domains أخرى. Exercise كتفترض SensorReading objects ماشي null؛ زيد Objects::nonNull إلا ممكنين. Encounter order كتعلق بالمصدر وoperations؛ sequential stream ما كتخلقش order لمصدر unordered.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
