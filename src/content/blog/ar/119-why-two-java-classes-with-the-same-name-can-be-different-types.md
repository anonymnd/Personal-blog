---
title: "الهوية ديال الـ Types في Java: الـ Packages والـ Class Loaders"
description: "علاش جوج classes عندهم نفس السمية كيتعتابرو أنواع مختلفة وكيفاش تحول بيناتهم بلا مشاكل."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
seriesOrder: 24
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## كيفاش Java كتعرف الـ Type

في Java، الـ class ما كيتعرفش غير بالسمية ديالو البسيطة (مثلاً `Money`)، ولكن بـ Fully Qualified Name (FQN). الـ FQN هو السمية ديال الـ package متبوعة بسمية الـ class. إلا كانو جوج classes عندهم نفس السمية ولكن في packages مختلفين، الـ JVM كيشوفهم بحال جوج أنواع ما عندهم حتى علاقة بيناتهم.

هاد الهوية مرتبطة حتى بـ ClassLoader. أي class كيتحدد بـ FQN ديالو والـ ClassLoader اللي شارجاه. إلا شارجيتي نفس الـ `.class` file بجوج ClassLoaders مختلفين، غادي يولي عندك جوج objects ديال `Class` مختلفين، وإلا حاولتي دير cast من واحد لواحد، غادي تطلع ليك `ClassCastException`.

## السيناريو: مشكل مع SDK قديم

تخيل عندك application فيها record سميتو `Money` للخدمة الداخلية، وفي نفس الوقت خاصك تخدم بـ SDK قديم حتى هو فيه class سميتها `Money`. حيت هادو أنواع مختلفة، ما تقدرش تستعمل cast باش تحول بيناتهم، واخا يكونو عندهم نفس الـ fields.

### مثال تطبيقي

```java
// Type ديال application
package com.app.domain;

public record Money(java.math.BigDecimal amount, String currency) {}

// Type ديال SDK القديم
package com.legacy.sdk;

public class Money {
    private final java.math.BigDecimal value;
    private final String isoCode;

    public Money(java.math.BigDecimal value, String isoCode) {
        this.value = value;
        this.isoCode = isoCode;
    }

    public java.math.BigDecimal getValue() { return value; }
    public String getIsoCode() { return isoCode; }
}
```

## التحويل الآمن (Boundary-Safe Mapping)

باش تنقل الداتا من الـ SDK لـ application ديالك، خاصك دير mapping صريح. الـ cast ما خدامش حيت الـ JVM كيقلب على الهوية ديال الـ type (FQN + ClassLoader) فاش كيكون البرنامج خدام.

### مثال ديال الـ Mapping

```java
package com.app.service;

import java.util.Optional;
import com.app.domain.Money; // Type ديال application

public class CurrencyConverter {

    public com.app.domain.Money mapToDomain(com.legacy.sdk.Money sdkMoney) {
        if (sdkMoney == null) return null;

        // تحويل صريح: كنخدو القيم باش نصاوبو instance جديدة
        return new com.app.domain.Money(
            sdkMoney.getValue(),
            sdkMoney.getIsoCode()
        );
    }

    public void processPayment(com.legacy.sdk.Money sdkMoney) {
        // هادي غادي تلوح ClassCastException:
        // com.app.domain.Money domainMoney = (com.app.domain.Money) sdkMoney;

        com.app.domain.Money domainMoney = mapToDomain(sdkMoney);
        System.out.println("Processed: " + domainMoney.amount());
    }
}
```

### تحليل الطريقة
1. **التعامل مع FQN**: الـ compiler كيستعمل الـ imports باش يفرق بين `com.app.domain.Money` و `com.legacy.sdk.Money`. إلا كنتي محتاجهم بجوج في نفس الـ file، خاصك تكتب المسار الكامل ديالهم.
2. **Allocation في الذاكرة**: الميثود `mapToDomain` كتصاوب object جديد في الـ heap. ما كتبدلش الهوية ديال الـ object اللي جاي من الـ SDK، ولكن كتاخد المعلومات ديالو وتحطها في type اللي كتفهمو الـ application.
3. **حالة الفشل**: إلا حاول شي واحد يستعمل reference ديال `Object` جاي من الـ SDK ويدير ليه cast لـ `Money` ديال الـ domain، الـ JVM غادي يلقى بلي الـ class مشارجية من package `com.legacy.sdk` وغادي يرفض الـ cast، واخا يكونو السميات ديال الـ fields بحال بحال.

## تمرين

**سؤال**: عندك class سميتها `com.util.Config` و وحدة أخرى `com.internal.Config`. وصلك object من نوع `Object` وعارفو راه `com.util.Config`. شنو يوقع إلا درتي `(com.internal.Config) receivedObject`؟ وكيفاش تنقل الداتا من config ديال util لـ config ديال internal بطريقة صحيحة؟

**الجواب**: غادي تطلع `ClassCastException` حيت الـ FQN مختلف. باش تنقل الداتا، خاصك تستعمل mapper صريح: تصاوب instance جديدة من `com.internal.Config` وتعمرها بالقيم اللي كتجيبهم من `com.util.Config` باستعمال الـ getters.

Package declarations اللي فالمثال خاصهم files منفصلين. Java ما فيهاش import alias. Cast مباشر بين final types بلا علاقة يقدر يترفض فـ compilation؛ cast عبر Object يقدر يدوز ومن بعد يفشل فـ runtime. ClassLoader اللي كيهم هو defining loader؛ جوج initiating loaders يقدرو يفوضو لنفس definition ويجيبو نفس type.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
