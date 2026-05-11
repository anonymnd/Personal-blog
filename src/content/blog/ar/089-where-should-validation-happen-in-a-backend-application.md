---
title: "فين خاص تدار الـ Validation فـ Backend Application؟"
description: "دليل باش تفرق بين الـ validation ديال الشكل ديال الداتا، وقواعد البيزنس، والـ constraints ديال قاعدة البيانات."
pubDate: 2026-10-10T08:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل كتصاوب تطبيق ديال الشراء (procurement app). واحد الموظف صيفط طلب باش يشري 100 بيسي. هاد الطلب كيوصل على شكل JSON. إلا كان الحقل ديال `quantity` ما كاينش أو صيفطوه كـ string بلاصت number، السيستيم غادي يتبلوكا. وإلا كانت الكمية -5، هادشي منطقياً غلط. وإلا كان هاد الموظف سالا الميزانية السنوية ديالو، الطلب ما مقبولش. كل مشكل من هادو خاصو يتعالج فبلاصة مختلفة.

## Validation ديال شكل الداتا (Input Shape)
أول خط دفاع هو الـ API layer. هنا كنأكدو واش الداتا 'شكلها' صحيح. فـ Java كنخدمو بـ Jakarta Bean Validation بحال `@NotNull` أو `@NotBlank`. خاصك تعرف بلي `@NotNull` كتشوف غير واش الحقل خاوي (null)، ولكن ما كترفضش string خاوية. داكشي علاش `@NotBlank` هي اللي ضرورية للـ strings. ملي كتخدم بـ `@Valid` فـ controller، هي اللي كتكلف تبدا الـ validation ديال كاع الحقول قبل ما يدخل الكود لـ service.

## Validation ديال قواعد البيزنس (Business Eligibility)
ملي كيكون شكل الداتا صحيح، خاصنا نشوفو واش هاد العملية مسموح بها. هادشي كيكون فـ Service Layer. فالتطبيق ديالنا، الـ service كيشوف واش الموظف باقي عندو ميزانية. هنا المشكل ماشي فـ 'الشكل'—حيت 100 راه رقم صحيح—ولكن المشكل فـ 'القاعدة'. هاد الأخطاء خاصها تلوح (throw) exceptions ديال domain باش الـ API يرجع ميساج مفهوم للكليان بلا ما يبين ليه الـ stack trace ديال الكود.

## Constraints ديال Database والـ Concurrency
وخا يكون الـ service ناضي، يقدروا يوصلوا جوج طلبات فـ نفس الميلي-ثانية. إلا حاول شي واحد يصاوب جوج طلبات بنفس الـ ID، الـ service يقدر يشوفهم بجوج 'صحيحين' حيت مزال ما تسجلوش فـ DB. هنا فين كينفعو الـ unique constraints ديال database. هما اللي كيبقاو آخر ضمانة ضد الـ race conditions.

## مثال تطبيقي: طلب شراء

```java
public class PurchaseRequest {
    @NotBlank // باش ما يكونش null وما يكونش خاوي
    private String itemCode;

    @NotNull // باش يكون الحقل موجود
    @Min(1)   // باش يكون الرقم موجب
    private Integer quantity;
}

// Logic ديال Service Layer
public void processRequest(PurchaseRequest req) {
    if (budgetService.isExceeded(req.getUserId())) {
        throw new BudgetExceededException("الميزانية سالات");
    }
    repository.save(req);
}
```

**النتيجة:** طلب فيه `itemCode` خاوي كيرجع rejected من الـ API (400 Bad Request). طلب ديال 100 بيسي لموظف ما عندوش ميزانية كيرجع rejected من الـ Service (422 Unprocessable Entity).

## غلط شائع: الاعتماد الكلي على @Valid
بزاف ديال المطورين كيسحاب ليهم `@Valid` كتعوض كلشي. ولكن `@Valid` ما تقدرش تشوف فـ database أو تطبق قواعد بيزنس معقدة.
**التصحيح:** خدم بـ `@Valid` للشكل (syntax) وخدم بـ Service method للحالة (state) والأهلية.

## تمرين تطبيقي
فـ أي layer خاصنا نتأكدو واش `username` كاين ديجا فـ database: فـ Controller (بـ `@Valid`) أو فـ Service layer؟

**الجواب:** فـ Service layer (وفـ الأخير unique constraint فـ DB)، حيت خاصنا نقلبو فـ database، وهذا كيتسمى business rule ماشي validation ديال الشكل.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
