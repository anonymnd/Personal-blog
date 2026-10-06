---
title: "كيفاش تصمم رد موحد للأخطاء في الـ API"
description: "تعلم كيفاش تصاوب بنية موحدة للأخطاء باش تسهل الخدمة على الـ frontend developer بلا ما تخرج أسرار السيرفر."
pubDate: 2026-10-10T16:48:00.000Z
translationKey: 097-how-to-design-a-consistent-api-error-response
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا واحد الـ frontend developer خدام بالـ API ديالك. مرة كيعطيه خطأ ديال validation على شكل نص بسيط، ومرة كيطلع ليه stack trace طويل ديال HTML حيت وقع مشكل فـ database، ومرة أخرى كيرجع ليه الجسم (body) خاوي. هاد التخلاط كيخلي الـ client يضطر يكتب بزاف ديال 'if-else' غير باش يبين ميساج بسيط للمستخدم.

## شنو خاص يكون في الرد الموحد
باش تحل هاد المشكل، خاصك تصاوب DTO خاص بالأخطاء. الرد الموحد خاصو يكون فيه ديما: كود كيقراه السيستيم (machine-readable code)، ميساج كيفهمو بنادم، وليستة ديال الأخطاء اللي متعلقة بحقول معينة (field-specific errors). هكا، سواء كان الخطأ 400 Bad Request أو 422 Unprocessable Entity، الـ JSON كيبقى ديما بنفس الشكل.

## كيفاش تطبق هاد الموديل
إلا كنتي خدام بـ Jakarta EE، تقدر تستعمل record باش تجمع هاد المعلومات. هاد الطريقة كتفرق بين الخطأ العام والأخطاء ديال validation، مثلا فاش شي واحد كيصيفط نص خاوي فـ field دايرين ليه `@NotBlank`.

```java
public record ApiError(String code, String message, List<FieldError> details) {}
public record FieldError(String field, String reason) {}
```

## مثال تطبيقي: تطبيق المشتريات
تخيل تطبيق ديال المشتريات فين الموظف كيصيفط طلب شراء. إلا صيفط مبلغ ناقص (negative amount)، الـ API ما خاصهاش تطيح، بل خاصها ترجع status 400 مع هاد الـ JSON:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "الطلب فيه معلومات غلط",
  "details": [
    { "field": "amount", "reason": "المبلغ خاصو يكون كبر من صفر" }
  ]
}
```
وإلا كان الطلب صحيح ولكن المدير ديجا رفض داك المنتج (business error)، الـ API كترجع status 422 مع الكود `ITEM_ALREADY_REJECTED`.

## غلط شائع: تسريب معلومات السيرفر
بزاف ديال المطورين كيديرو `exception.getMessage()` نيشان للـ client. هادشي خطر حيت إلا وقع مشكل فـ database، يقدر يبان للمستخدم `SQLIntegrityConstraintViolationException` وهكا كتعرفو كيفاش مصاوبين الجداول ديالكم. الحل هو تشد (catch) هاد الـ exception وترجع كود عام بحال `CONFLICT`.

## تمرين تطبيقي
صاوب رد JSON لحالة فين المشتري بغا يكوموندي منتج ولكن سالا من الـ stock. استعمل status 409 Conflict.

**التأكد من الحل:** الرد خاص يكون فيه `code` بحال `OUT_OF_STOCK` وميساج واضح، و `details` تكون خاوية حيت هادا خطأ ديال business ماشي ديال validation.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
