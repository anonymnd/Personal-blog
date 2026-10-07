---
title: "Records و Immutable Value Objects: شنو اللي immuable بصح؟"
description: "تحليل ديال shallow vs deep immutability فـ Java records وكيفاش نحميو collections باستعمال defensive copying."
pubDate: 2026-10-07T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
seriesOrder: 25
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## الخدعة ديال Immutability فـ Records

بزاف كيصحاب ليهم بلي Java records ديما immuable. هي بصح المكونات (components) ديالها كيكونوا `final` ولكن هادشي كيعطينا غير **shallow immutability** (إيميوتابيليتي سطحية). الـ record كيكون immuable بصح غير إلا كانوا كاع المكونات ديالو حتى هما immuable. إلا كان الـ record فيه reference لشي حاجة mutable، بحال `List` ولا `Map` ، راه ما تقدرش تبدل الـ reference لـ list أخرى، ولكن تقدر تبدل شنو كاين وسط ديك الـ list.

## Shallow vs Deep Immutability

الـ Shallow immutability كتعني بلي الـ fields ديال object ما يمكنش تعاود تعطيهم قيمة أخرى (reassignment). أما Deep immutability كتعني بلي أي حاجة كيوصل ليها الـ object (the object graph) كامل ما يمكنش تتبدل.

نشوفو مثال ديال `RouteSummary` اللي كيهز سميات ديال المحطات. إلا خدمنا بـ `java.util.List` عادية، غادي نخليو ثغرة فـ immutability ديالنا.

### مثال فيه مشكل (Illustrative)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {}

// الاستعمال
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// هنا كاين المشكل: إلا بدلنا list الأصلية، الـ record حتى هو كيتبدل
myStops.add("Tangier");
System.out.println(summary.stops()); // Output: [Casablanca, Rabat, Tangier]
```

فهاد المثال، `RouteSummary` راه shallowly immuable. الـ field `stops` ما يمكنش تبدلو بـ list جديدة، ولكن `ArrayList` اللي كيشير ليها راها mutable. هادشي كيضرب المبدأ ديال Value Object اللي خاص الحالة ديالو تبقى ثابتة من نهار كيتكريا.

## كيفاش نحميو الـ State: Defensive Copies

باش نوصلو لـ deep immutability، خاصنا نتأكدو بلي حتى شي reference mutable ما تخرج من الـ object ولا تدخل ليه بلا ما نديرو ليها copy. فـ records، هادشي كانديروه فـ canonical constructor.

أحسن طريقة هي نستعملو `List.copyOf()` (لي جات فـ Java 10). هادي كتعطينا list ما يمكنش تتبدل (unmodifiable). وإلا كانت الـ list اللي عطيناها أصلاً unmodifiable، راه كترجعها كيف ما هي باش ما تضيعش الـ memory فـ copies زايدين.

### مثال صحيح (Illustrative)

```java
import java.util.*;

public record RouteSummary(String routeId, List<String> stops) {
    public RouteSummary {
        // defensive copy باش نضمنو deep immutability
        stops = List.copyOf(stops);
    }
}

// الاستعمال
List<String> myStops = new ArrayList<>(List.of("Casablanca", "Rabat"));
RouteSummary summary = new RouteSummary("R-101", myStops);

// دابا هادي غادي تلوح UnsupportedOperationException
try {
    summary.stops().add("Tangier");
} catch (UnsupportedOperationException e) {
    System.out.println("Immutable! ما يمكنش تبدل الـ list.");
}

// حتى إلا بدلنا list الأصلية، الـ record ما كيتأثرش
myStops.add("Tangier");
System.out.println(summary.stops()); // Output: [Casablanca, Rabat]
```

## Immutability فـ Classes العاديين

الـ records غير كيسهلو الكتابة، ولكن حتى الـ classes العاديين يقدروا يكونوا immuable. باش ترد class immuable، خاصك:
1. ترد الـ class `final` باش حتى واحد ما يورث منها.
2. ترد كاع الـ fields `private` و `final`.
3. ما دير حتى شي setter method.
4. دير defensive copies للـ fields اللي mutable فـ constructor و getters.

## التأثير على الـ Equality

الـ records كيديرو `equals()` و `hashCode()` أوتوماتيكياً على حساب شنو كاين فـ components ديالهم. إلا كان الـ record فيه list mutable وتبدلات (فـ حالة shallow immutability)، الـ `hashCode` ديال الـ record غادي يتبدل. هادشي خطير إلا كنتي خدام بـ الـ record كـ key فـ `HashMap` ، حيت الـ object غادي يتوضر فـ map حيت الـ bucket ديالو تبدل.

## تمرين

**السيناريو:** عندك record سميتو `UserPreferences` فيه `Set<String>` ديال tags. حالياً، هاد الـ tags كيقدروا يتبدلو من برا الـ record.

**المطلوب:** عاود كتب الـ record باش تضمن بلي الـ `Set` راها deeply immuable.

**الجواب:**
```java
import java.util.*;

public record UserPreferences(String userId, Set<String> tags) {
    public UserPreferences {
        tags = Set.copyOf(tags);
    }
}
```

copyOf كتخلي collection unmodifiable ماشي mutable elements immutable بعمق. Strings كيخليو هاد الأمثلة آمنة؛ nested mutable values خاصها design إضافية. Factories كترفض null وتقدر تعاود instance مناسبة؛ ما تعتمدش على object identity.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
