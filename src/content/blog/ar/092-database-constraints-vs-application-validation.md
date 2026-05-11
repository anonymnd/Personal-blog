---
title: "الفرق بين Database Constraints و Application Validation"
description: "تعلم كيفاش توازن بين validation ديال البيانات في Java و constraints ديال base de données باش تحمي البيانات ديالك من الأخطاء."
pubDate: 2026-10-10T11:48:00.000Z
translationKey: 092-database-constraints-vs-application-validation
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات) فين الموظف كيصيفط طلب شراء. زدتي واحد التحقق (check) في Java باش `requestAmount` ما يكونش سالب. في التست كلشي خدام، ولكن ملي كطلع application لـ production وكيكون الضغط، يقدروا جوج طلبات يدوزو في دقة واحدة ويغلطوا logic ديالك، ولا شي واحد يدخل بيانات غلط نيشان لـ base de données بـ SQL script، وهادشي كيخسر التقارير المالية.

## الدور ديال Application Validation
الـ validation في application، اللي غالباً كنخدمو فيها بـ Jakarta Bean Validation، هي خط الدفاع الأول. الهدف منها هو نتأكدوا بلي الشكل ديال البيانات اللي صيفط المستخدم صحيح قبل ما نبداو business logic. مثلاً، `@NotBlank` في السمية ديال requester كتضمن بلي السمية ماشي null وماشي خاوية. خاصك ترد البال بلي `@NotNull` ما كتحبسش strings خاوين، هي فقط كتشوف واش القيمة null ولا لا.

## علاش خاصنا Database Constraints
وخا الـ checks ديال Java سراع، ما يقدروش يضمنوا السلامة ديال البيانات ملي كيكونوا بزاف ديال requests في نفس الوقت (race conditions). مثلاً، إلا بغيتي `requestReference` يكون unique، ما كافيش دير `if (repository.exists(ref))` في Java. حيت يقدروا جوج threads يسولوا base de données في نفس الميلي-ثانية، بجوج يلقاوها ما كايناش، وبجوج يدخلوها. الحل الوحيد هو دير `UNIQUE` constraint في base de données.

## مثال تطبيقي: طلب شراء
نشوفو مثال ديال طلب شراء فين `amount` خاصو يكون موجب و `requestCode` يكون unique.

```java
public class PurchaseRequest {
    @NotBlank(message = "الرمز مطلوب")
    private String requestCode;

    @NotNull
    @Positive(message = "المبلغ خاصو يكون كبر من صفر")
    private BigDecimal amount;
    // getters and setters
}
```

وفي base de données:
```sql
CREATE TABLE purchase_requests (
    id BIGINT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) CHECK (amount > 0)
);
```
النتيجة: `@Positive` كتعطي ميساج زوين للمستخدم ديك الساعة. الـ `CHECK` constraint كتحبس أي بيانات غلط تدخل بـ SQL. والـ `UNIQUE` constraint كتمنع التكرار وخا يكون الضغط.

## غلط شائع: الاعتماد فقط على @Valid
بزاف ديال developers كيصحاب ليهم بلي `@Valid` كتعوض database constraints. `@Valid` غير كتفعل الـ validation ديال الحقول، ولكن ما كديرش lock لـ base de données وما كتعرفش واش القيمة unique على مستوى الجدول كامل. إلا حيدتي `UNIQUE` constraint حيت درتي check في Java، غادي تلقى داتا مكررة في الجداول ديالك.

## تمرين تطبيقي
سيناريو: بغيتي تضمن بلي `managerEmail` مكتوب وما خاويش. شنو هي أحسن تركيبة تستعمل؟

الجواب: استعمل `@NotBlank` في Java باش تعطي رد سريع للمستخدم، ودير `NOT NULL` constraint في base de données باش تضمن integrity ديال البيانات.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
