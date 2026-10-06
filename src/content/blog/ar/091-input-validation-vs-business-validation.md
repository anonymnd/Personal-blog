---
title: "الفرق بين Input Validation و Business Validation"
description: "تعلم الفرق بين التأكد من شكل البيانات (Input Validation) والتأكد من أنها منطقية ومقبولة حسب قواعد الخدمة (Business Validation)."
pubDate: 2026-10-10T10:48:00.000Z
translationKey: 091-input-validation-vs-business-validation
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف صيفط طلب باش يشري بيسي جديد. السيستيم قبل الطلب حيت المعلومات كاملة، ولكن من بعد المدير رفضو حيت الميزانية ديال القسم سالات. هنا كاينين جوج أنواع ديال التشييك: الأول واش الطلب مكتوب بطريقة صحيحة؟ والثاني واش عندنا الفلوس باش نشريوه؟

## Input Validation: الباب الأول
هاد النوع كيركز غير على 'الشكل' و 'النوع' ديال البيانات. الهدف هو نتأكدو أن الطلب اللي جاي مافيهش أخطاء تقنية قبل ما يوصل للـ business logic. فـ Java كنستعملو Jakarta Bean Validation بحال `@NotBlank` للـ strings و `@NotNull` للأوبجيكت. خاصك ترد البال بلي `@NotNull` ما كتحبسش الـ empty strings، داكشي علاش كنستعملو `@NotBlank`. وملي كدير `@Valid` فـ controller، السيستيم كيدير تشييك كامل على الـ object.

## Business Validation: منطق الخدمة
هادي كتجي من بعد ما كنكونو متأكدين بلي الـ input صحيح تقنياً. هنا كنشوفو واش الطلب 'مسموح به' منطقياً. مثلاً، الطلب يقدر يكون مكتوب مزيان (الـ ID صحيح والمبلغ موجب)، ولكن القواعد ديال الشركة كتقول بلي أي حاجة فوق 5000 دولار خاصها موافقة ديال VP. هاد التشييك كيطلب ندخلو لـ database، وهادشي ما يمكنش نديروه غير بـ annotations بسيطة.

## مثال تطبيقي: طلب شراء
شوف هاد المثال ديال DTO وكيفاش كيتعامل معاه الـ service:

```java
public class RequestDTO {
    @NotBlank
    private String itemDescription;
    
    @NotNull
    @Positive
    private BigDecimal amount;
    // getters/setters
}

// فـ Service Layer
public void processRequest(RequestDTO dto) {
    if (budgetService.getRemainingBudget() < dto.getAmount()) {
        throw new InsufficientBudgetException("الميزانية ما كافياش");
    }
}
```
النتيجة: إذا كانت `itemDescription` خاوية، الـ API كيرجع 400 Bad Request ديك الساعة. ولكن إذا كان الوصف مزيان والميزانية هي اللي سالات، الـ service كيطلع exception ديال business.

## غلط شائع: الاعتماد غير على Annotations
بزاف ديال المطورين كيحاولوا يديروا business logic وسط custom validation annotation. هادشي كيخلي الـ API مرتبط بزاف بـ database. وعقل بلي `@Valid` ماشي هي database constraint. ضروري تزيد unique constraints فـ database باش تفادى المشاكل ملي بزاف ديال الناس كيطلبوا نفس الحاجة فدقة وحدة (race conditions).

## تمرين تطبيقي
سيناريو: مستخدم دخل 'الكمية' (Quantity). بغينا نتأكدو بلي هاد الحقل ماشي null وبلي السلعة كاينة فـ stock.

سؤال: شكون فيهم Input Validation وشكون Business Validation؟

الجواب: التشييك واش الحقل null هو Input Validation، والتشييك ديال الـ stock هو Business Validation.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
