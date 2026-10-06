---
title: "@NotBlank, @NotNull و @Valid شرح مبسط"
description: "تعلم كيفاش تفرق بين annotations ديال validation فـ Jakarta باش تضمن أن الـ API ديالك كتوصل ببيانات صحيحة."
pubDate: 2026-10-10T09:48:00.000Z
translationKey: 090-notblank-notnull-and-valid-explained
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على app ديال الشراء (procurement) فين الموظف كيصيفط طلب. لاحظتي أن شي طلبات كيوصلوا بسميات خاوين أو descriptions null، وهذا كيخلي الـ code يوقع فيه NullPointerException. هاد المشكل كيوقع حيت بزاف كيديرو @NotNull وهوما فالحقيقة محتاجين يتأكدو أن النص ماشي غير خاوي أو فيه غير spaces.

## الفرق بين @NotNull و @NotBlank

وخا كيبانو بحال بحال، ولكن كاين فرق كبير. @NotNull كتشوف غير واش القيمة ماشي null. يعني إلا صيفطتي string خاوية (`""`) أو فيها غير الفراغات (`"  "`) غادي تقبلها. أما @NotBlank فهي مزيرة كتر؛ كتأكد أن القيمة ماشي null وبلي راه فيها حروف حقيقية (trimmed length > 0). هادي كتخدم غير مع `CharSequence`.

## شنو كدير @Valid

@Valid ماشي constraint بحال لخرين، ولكن هي بحال شي "ساروت" كيشعل validation. مثلا، إلا كان عندك object سميتو `PurchaseRequest` وفيه object آخر سميتو `User`؛ إلا درتي @NotNull لـ User، غادي يتأكد فقط واش الـ object كاين. باش تقول لـ Spring يدخل لوسط الـ User ويشوف واش الحقول اللي لداخل (بحال username) صحاح، خاصك تزيد @Valid. هاد العملية كتسمى cascading validation.

## مثال تطبيقي: طلب شراء

```java
public class PurchaseRequest {
    @NotBlank(message = "سمية المنتج ضرورية")
    private String itemName;

    @NotNull(message = "الكمية مايمكنش تكون null")
    private Integer quantity;

    @Valid
    @NotNull
    private Requester requester;
}

public class Requester {
    @NotBlank
    private String employeeId;
}
```

فهاد المثال، إلا صيفط شي واحد `"itemName": " "` غادي تفركع @NotBlank. وإلا صيفط `"quantity": null` غادي تخدم @NotNull. وإلا كان الـ `requester` كاين ولكن `employeeId` اللي لداخل خاوي، @Valid هي اللي كتخلي validation تهبط لـ Requester وتلقى الخطأ.

## غلط شائع: الاعتماد الكلي على Validation

بزاف كيصحابلهم أن @NotBlank كتعوض unique constraints ديال database. الـ validation كتكون غير فـ application level. إلا جوج ناس صيفطو نفس الـ ID فدقة وحدة، الـ validation غادي تدوز ليهم بجوج، وهنا خاص ضروري تكون unique constraint فـ database باش تحبس التكرار.

## تمرين تطبيقي

أنا annotation خاصني نخدم بها لواحد الـ `String` اللي خاصو يكون فيه نص حقيقي ومايكونش غير فراغات؟ وكيفاش نتأكد أن object لداخل (nested) حتى هو يتـvalida?

**الجواب:** كنخدمو بـ @NotBlank للنص و @Valid للـ object اللي لداخل.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
