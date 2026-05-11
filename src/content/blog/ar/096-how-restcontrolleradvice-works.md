---
title: "كيفاش كيخدم @RestControllerAdvice"
description: "تعلم كيفاش تجمع كاع تسيير الأخطاء (error handling) فبلاصة وحدة فـ Spring Boot باش يبقاو controllers ديالك نقيين."
pubDate: 2026-10-10T15:48:00.000Z
translationKey: 096-how-restcontrolleradvice-works
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على application ديال الشراء (procurement). فـ `PurchaseRequestController` عندك بزاف ديال methods. إلا صيفط المستخدم طلب غلط أو manager بغا يوافق على طلب ما كاينش، غادي تلقى راسك كتعاود نفس try-catch فكل بلاصة. هاد التكرار كيخلي الكود مرون وصعيب فالتعديل.

## الملقط المركزي (Centralized Interceptor)
`@RestControllerAdvice` كايخدم بحال شي ملقط (interceptor) عام لجميع الأخطاء اللي كيوقعو فـ أي controller فالتطبيق. بلاصة ما تعالج الخطأ فكل method بوحدها، Spring كايصيفط exception لواحد الـ class عندها `@RestControllerAdvice`. وسط هاد الـ class، كانديرو methods بـ `@ExceptionHandler` باش نحددوا كل نوع ديال الخطأ كيفاش نتعاملو معاه.

## كيفاش كايخدم هادشي
ملي شي request كايوصل للـ controller وكيوقع خطأ، Spring كايقلب على `@ExceptionHandler` اللي كايناسب داك الخطأ فـ الـ advice class. إلا لقاه، كايخدم ديك الـ method وكايصيفط النتيجة كـ HTTP response. هكدا كانفرقو بين الخدمة ديال التطبيق (business logic) وبين كيفاش كنتعاملوا مع المشاكل.

## مثال تطبيقي: Validation ديال الطلبات
نفترضو شي واحد صيفط `PurchaseRequest` والوصف (description) خاوي. إلا كنا مستعملين `@NotBlank` فـ الـ DTO، غادي يوقع `MethodArgumentNotValidException`.

```java
@RestControllerAdvice
public class GlobalErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<String> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
```
إلا صيفط المستخدم وصف خاوي، النتيجة غاتكون `400 Bad Request` مع JSON فيه `{"description": "cannot be blank"}` بلا ما تخرج ليه ديك الـ stack trace الطويلة اللي كاتخلع.

## غلط شائع: تسريب معلومات السيستيم
بزاف ديال الناس كايصيفطو الـ exception object كيف ما هو أو كايصيفطو stack trace كاملة للـ client. هادشي خطر حيت كايبين سميات الـ packages ونسخة ديال database.

**التصحيح:** ديما حول الـ exception لـ `ErrorResponse` DTO فيه غير ميساج مفهوم وتاريخ وقوع الخطأ.

## تمرين تطبيقي
صاوب method فـ class ديال `@RestControllerAdvice` باش تعالج خطأ سميتو `InsufficientBudgetException` وترجع status ديال `422 Unprocessable Entity`.

**الجواب:** خاص الـ method تكون عندها `@ExceptionHandler(InsufficientBudgetException.class)` وترجع `ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Budget exceeded");`.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
