---
title: "Dependency Injection, Inversion of Control و Interface Contracts"
description: "شرح عميق ديال كيفاش كيتصاوبو components، الـ constructor injection، والحقيقة ديال semantic coupling ملي كنخدمو بـ interfaces."
pubDate: 2026-10-07T04:48:00.000Z
translationKey: 055-what-is-dependency-injection
seriesOrder: 13
locale: ar
tags: ["spring-architecture","learning-series"]
draft: false
---

## تبديل التحكم (The Shift in Control)

فالبرمجة العادية، الـ class هي اللي كتكون مسؤولة باش تصاوب الـ dependencies ديالها. مثلاً، إلا كان `TaxCalculator` محتاج `RateSource` باش يجيب نسبة الضريبة، غادي يدير `new RemoteRateSource()` وسط الـ constructor ديالو. هادشي كيخلي الـ calculator مرتبط بزاف بـ implementation وحدة، وما تقدرش تدير ليه test بلا ما تكون كونيكطي مع السيرفر.

هنا فين كتجي Inversion of Control (IoC). بلاصت ما الـ `TaxCalculator` هو اللي يتحكم فصناعة الـ `RateSource` ، كنعطيو هاد التحكم لشي حاجة خارجية (بحال Spring container أو شي class ديال bootstrap). الـ calculator كيقول غير شنو محتاج، والبيئة اللي خدام فيها هي اللي كتعطيه. الـ Dependency Injection (DI) هي الطريقة باش كنطبقو IoC، وأحسن طريقة هي الـ constructor injection.

## الـ Constructor Injection والكونترا (Contract)

ملي كنخدمو بـ constructor injection، كنضمنو أن الـ component ما عمره يكون فـ حالة ناقصة (invalid state). حيت الـ compiler كيفرض علينا نعطيو الـ dependencies فاش كنصاوبو الـ object، إذن `TaxCalculator` ضروري يكون عنده `RateSource` قبل ما نعيطو لأي method.

باش نخليو هادشي flexible، كنخدمو بـ interface. الـ interface هي بمثابة "كونترا" (contract) — كتحدد شنو هما الـ methods اللي خاص يكونو، ولكن ما كتقولش *كيفاش* كيخدمو. هادشي كيخلينا نبدلو implementation ديال production بـ وحدة ديال test بلا ما نقيسو حتى سطر فـ الـ calculator.

## مثال تطبيقي: نظام حساب الضريبة

تخيل عندنا سيستيم كيجيب نسبة الضريبة من API فـ production، ولكن فـ tests بغيناها تكون قيمة ثابتة باش النتائج تكون ديما هي هي.

### الكونترا (The Contract)
```java
public interface RateSource {
    double getRate(String regionCode);
}
```

### الـ Implementations
```java
// ديال Production: كيمشي لـ API بعيدة
public class RemoteRateSource implements RateSource {
    @Override
    public double getRate(String regionCode) {
        // مثال: هنا غادي يكون كاين RestClient
        System.out.println("Fetching from remote API...");
        return 0.20;
    }
}

// ديال Test: كيرجع قيمة ثابتة
public class FixedRateSource implements RateSource {
    @Override
    public double getRate(String regionCode) {
        return 0.15;
    }
}
```

### الـ Component
```java
public class TaxCalculator {
    private final RateSource rateSource;

    // Constructor Injection
    public TaxCalculator(RateSource rateSource) {
        this.rateSource = rateSource;
    }

    public double calculateTax(double amount, String region) {
        return amount * rateSource.getRate(region);
    }
}
```

### كيفاش كيدوز الـ Execution

**الحالة A: Production Bootstrap**
1. `RemoteRateSource remote = new RemoteRateSource();`
2. `TaxCalculator prodCalc = new TaxCalculator(remote);`
3. `prodCalc.calculateTax(100, "US")` → كيعيط لـ `RemoteRateSource.getRate` → كيرجع `20.0`.

**الحالة B: Test Bootstrap**
1. `FixedRateSource fixed = new FixedRateSource();`
2. `TaxCalculator testCalc = new TaxCalculator(fixed);`
3. `testCalc.calculateTax(100, "US")` → كيعيط لـ `FixedRateSource.getRate` → كيرجع `15.0`.

## كذبة الـ Decoupling الكامل

بزاف كيصحاب ليهم أن الـ interfaces كيحيدو كاع الـ coupling. هي بصح كتحيد الـ *implementation coupling* (الـ calculator ما عارفش `RemoteRateSource`) ولكن ما كتحيدش الـ *semantic coupling*.

الـ semantic coupling كيوقع ملي الـ caller كيتوقع أن الـ implementation غادي تصرف بطريقة معينة اللي ما مكتوباش فـ الـ signature ديال الـ method. مثلاً، إلا كان `TaxCalculator` كيسحاب ليه أن `getRate` عمرها ترجع رقم سالب، أو أنها ديما كتجاوب فـ أقل من 100ms، راه باقي مرتبط بـ *السلوك* (behavior) ديال الـ implementation. إلا زدنا `DatabaseRateSource` اللي كيرمي `SQLException` (مغلفة فـ RuntimeException)، الـ calculator يقدر يـ crash وخا الـ interface contract محترم تقنياً. الـ interfaces كيحددو *شنو* (what)، ولكن *كيفاش* (how) — بحال الـ performance والـ errors — كيبقاو مأثرين على الـ caller.

## تمرين

**المطلوب:** عندك `NotificationService` كيعتمد على interface سميتها `MessageSender`. عندك جوج ديال الـ implementations: `SmsSender` و `EmailSender`. بغيتي تصاوب `BulkNotifier` اللي يقدر يبدل بين هاد الـ senders على حساب configuration فـ بداية التشغيل.

1. كيفاش خاص `BulkNotifier` يتوصل بـ `MessageSender` ؟
2. إلا كان `SmsSender` محتاج API key و `EmailSender` محتاج SMTP server، فين خاص هاد المعلومات يتحطو ؟
3. إلا كان `SmsSender` كيسكت ملي كيوقع غلط (fails silently) ولكن `EmailSender` كيرمي exception، واش `BulkNotifier` فعلاً decoupled من الـ implementation ؟

**الجواب:**
1. عن طريق constructor injection: `public BulkNotifier(MessageSender sender) { ... }`.
2. هاد المعلومات خاص يكونو وسط الـ implementation classes (أو يتعطاو ليهم فـ الـ constructor ديالهم فـ الـ bootstrap)، ماشي وسط `BulkNotifier`.
3. لا. هادشي كيتسمى semantic coupling. حيت الـ logic ديال التعامل مع الأخطاء فـ `BulkNotifier` غادي يتبدل على حساب شكون الـ implementation اللي دخلات، وهذا كيبين أن الـ interface بوحدها ما كتحيدش الارتباط بالسلوك.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Java records](https://dev.java/learn/records/)
