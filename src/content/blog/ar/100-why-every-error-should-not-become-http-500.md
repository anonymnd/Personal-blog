---
title: "علاش ماشي أي غلط خاصو يولي HTTP 500"
description: "تعلم كيفاش تفرق بين أغلاط المستخدم ومشاكل السيرفر باش تحسن الأداء والأمان ديال الـ API ديالك."
pubDate: 2026-10-10T19:48:00.000Z
translationKey: 100-why-every-error-should-not-become-http-500
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف صيفط طلب شراء ولكن نسى ما دارش الكمية. إلا كان السيرفر ديالك كيرجع ديما 'Internal Server Error 500'، المستخدم ما غادي يعرفش شنو دار غلط، والـ logs ديالك غادي يعمارو بمشاكل كتبان بحال إلا السيرفر طاح، وهي غير غلط بسيط ديال السيزر.

## شنو كتعني HTTP 500
الـ HTTP 500 هي واحد 'الشبكة' كتشد أي حاجة غير متوقعة طرات فالسيرفر، بحال إلا تقطعات الكونيكسيون مع la base de données. ملي كترجع 500 على قبل غلط فالسيزر (validation error)، راك كتخبي السبب الحقيقي وكتصعب المأمورية على لي كيدير monitoring باش يعرف واش كاين bug فلكود ولا غير المستخدم لي غلط.

## الفرق بين Validation و Business Eligibility
ماشي كاع الأغلاط بحال بحال. ملي كتشيك واش الداتا واصلة مقادة (مثلا باستعمال `@NotBlank` باش تأكد بلي الحقل ماشي خاوي)، هنا خاصك ترجع 400 Bad Request. ولكن ملي كيكون الغلط فـ 'قواعد العمل' (business rules)، بحال مدير بغا يوافق على طلب ديجا تسد، هنا خاصك ترجع 422 Unprocessable Entity ولا 409 Conflict.

## مثال تطبيقي: طلب شراء
فاش الموظف كيصيفط طلب، إلا دار ثمن بالسالب، `@Positive` غادي تخدم. وإلا كان ما عندوش ميزانية كافية، هنا logic ديال business هي لي غادي تخدم.

```java
// طرف من الكود باش توضح الفكرة
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorDto> handleValidation(MethodArgumentNotValidException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto("البيانات غير صحيحة"));
}

@ExceptionHandler(InsufficientBudgetException.class)
public ResponseEntity<ErrorDto> handleBudget(InsufficientBudgetException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new ErrorDto(ex.getMessage()));
}
```
النتيجة: المستخدم كيوصلو 400 إلا غلط فلكتابة، و 422 إلا كانت مشكلة فالميزانية، والسيرفر كيسجل 500 غير ملي كيوقع crash بصح.

## غلط شائع: إظهار الـ Stack Traces
بزاف ديال المطورين كيخليو السيرفر يرجع الـ stack trace كاملة للمستخدم. هادشي خطر حيت كيكشف معلومات على لغة البرمجة والمكتبات لي خدام بيها. ديما حول الـ exceptions لـ DTO نقي فيه غير ميساج بسيط و ID ديال التتبع.

## تمرين تطبيقي
أشمن status code خاصك ترجع إلا واحد المشتري بغا يشري حاجة لي يلاه مسحها admin آخر فديك اللحظة (race condition)؟

**الجواب:** HTTP 409 Conflict، حيت الطلب صحيح ولكن كاين تعارض مع الحالة الحالية ديال السيرفر.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
