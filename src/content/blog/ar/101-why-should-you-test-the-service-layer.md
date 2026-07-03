---
title: "كيفاش تختار التستات على حساب الريسك لي كيقدروا يلقاو"
description: "دليل باش تعرف فين تحط كل تست على حساب المشكل لي بغيتي تكتشف، بمثال ديال تحويل العملات."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
seriesOrder: 21
locale: ar
tags: ["backend-testing","learning-series"]
draft: false
---

## الخدعة ديال "كلشي أخضر"

بزاف ديال لي ديفلوبور كيوقع ليهم واحد الاكتشاف: تقدر تكون عندك coverage ديال 100% وتلقى لابليكاسيون كاطيح فـ production. هادشي كيوقع حيت كنكونو كنطستيو *كيفاش* مكتوب الكود (implementation) ماشي *شنو* لي يقدر يهرس (risk). إلا كنتي داير mock للـ repository ديال الداتابيز فـ unit test، راك كتطستي غير واش كتعرف تعيط للميتود، ماشي واش الـ SQL query صحيحة ولا واش الـ ORM mapping خدام.

## توزيع الريسك على أنواع التستات

باش تبني suite ديال تستات صحيحة، خاصك كل مشكل محتمل تعطيه التست لي قادر يلقاه. تخيل عندنا ميزة (feature) ديال تحويل العملات: كتحسب القيمة على حساب واحد الـ API ديال الأسعار، كدير rounding (تقريب)، وكتسجل العملية فالداتابيز.

### 1. Unit Tests: اللوجيك والحالات الخاصة
الـ unit tests خاصهم يركزو على اللوجيك "الصافي". فهاد المثال، الـ rounding هو فين كاين أكبر ريسك. واش كيقرّب لـ half-up؟ واش كيتعامل مع الأرقام السالبة؟

**شنو كيكتشف:** أغلاط فالحساب، مشاكل ديال off-by-one، و NullPointerException فـ business logic.
**شنو مكيشوفش:** مشاكل ديال constraints فالداتابيز، network timeouts، ولا غلط فـ JSON parsing ديال الـ API.

### 2. Integration Tests: الحدود (Boundaries)
هاد التستات كيتحققو من الربط بين الكود ديالك وسيستيم خارجي (Database, API, Message Broker).

**شنو كيكتشف:** SQL syntax غلط، كولون ناقصة فالداتابيز، سميات ديال fields غلط فـ JSON، ولا مشاكل فـ transaction rollback.
**شنو مكيشوفش:** الحالات المعقدة ديال business logic (حيت إلا درناهم هنا، التستات غيوليو تقال بزاف).

### 3. المشكل ديال الـ Private Methods
بزاف كيتحيرو واش يطستيو الميتودات الـ private. إلا كانت ميتود private فيها لوجيك معقد (بحال الـ rounding)، الحل ماشي هو تردها public ولا تخدم بـ reflection. الحل هو تطستي الـ behavior public لي كيخدم بهاد الميتود. وإلا كانت الميتود معقدة بزاف لدرجة خاصها suite بوحدها، فهذا دليل بلي خاصك تخرج داك اللوجيك لـ class بوحدها (Strategy ولا Utility) وتطستيها كـ unit test عادي.

## مثال تطبيقي: توزيع الريسك

ها كيفاش نقسمو المشاكل ديال feature تحويل العملات على أنواع التستات:

| المشكل المحتمل | مستوى الريسك | نوع التست المناسب | علاش؟ |
| :--- | :--- | :--- | :--- |
| تقريب 1.005 لـ 1.01 مخدامش | عالي | Unit Test | لوجيك صافي؛ سريعة باش تجرب بزاف ديال الحالات. |
| الـ API رجعات 404 ولا JSON خاسر | متوسط | Integration Test | كيتحقق من الـ HTTP client و DTO mapping. |
| الكولون `amount` فالداتابيز صغيرة بزاف | عالي | Integration Test | غير داتابيز حقيقية (أو Testcontainer) لي تفيق بهاد الغلط. |
| السيرفيس مكيطستيش يعيط للـ Repository | طايح | Unit Test (Mock) | كيتحقق غير من الترتيب ديال الخدمة (interaction). |
| الـ Transaction مكديرش commit مورا التحويل | متوسط | Integration Test | خاصو transaction manager حقيقي باش يتأكد. |

## تحليل الكود: اللوجيك ضد الداتابيز

شوف هاد الكود التوضيحي ديال service ديال التحويل:

```java
public record ConversionResult(BigDecimal amount, LocalDateTime timestamp) {}

public class CurrencyService {
    private final RateClient rateClient;
    private final HistoryRepository repository;

    public CurrencyService(RateClient rateClient, HistoryRepository repository) {
        this.rateClient = rateClient;
        this.repository = repository;
    }

    public ConversionResult convert(BigDecimal amount, String from, String to) {
        BigDecimal rate = rateClient.getRate(from, to);
        BigDecimal result = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        var entity = new ConversionEntity(result, from, to);
        repository.save(entity);

        return new ConversionResult(result, LocalDateTime.now());
    }
}
```

**حالة الفشل:** تخيل `ConversionEntity` فيها `@Column(precision = 5, scale = 2)` ولكن النتيجة هي `123456.78`. الـ unit test لي خدام بـ mocked `HistoryRepository` غادي **يدوز (pass)** حيت `repository.save()` غير ميتود وهمية. غير الـ integration test لي كيضرب داتابيز حقيقية لي غادي يعطيك `DataIntegrityViolationException`.

## تمرين تطبيقي

**السيناريو:** بغيتي تزيد ميزة كتحسب تخفيض (discount) على حساب نقط الوفاء (loyalty points). كاتجيب النقط من Redis cache وكتسجل التخفيض فـ PostgreSQL.

**السؤال:** فين تحط هاد التستات وعلاش؟
1. تست باش تأكد بلي لي عندو 0 نقط كياخد 0% تخفيض.
2. تست باش تأكد بلي الـ timeout ديال Redis مخدّام.
3. تست باش تأكد بلي قيمة التخفيض كتسجل فالداتابيز بلا ما يضيعو الأرقام (precision loss).

**الجواب:**
1. **Unit Test:** لوجيك صافي كيربط النقط بالنسبة المئوية.
2. **Integration Test:** كيتحقق من الربط الحقيقي مع Redis و configuration ديال timeout.
3. **Integration Test:** كيتحقق من نوع الكولون فالداتابيز (مثلا `NUMERIC` vs `FLOAT`) و الـ ORM mapping.

فمثال numeric overflow، خاص colonne تكون فعلا NUMERIC(5,2) فـ PostgreSQL ودير flush/commit فالـ integration test. Annotation بوحدها ما كتبدلش schema الموجودة، وexception wrapping كتعلق بالحدود. JSON parsing بوحدها تقدر تختبرها بـ unit test؛ boundary test كتزيد تحقق من configuration الحقيقية ديال client.

## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
