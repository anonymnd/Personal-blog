---
title: "كيفاش ترجع Validation Errors نقيين"
description: "تعلم كيفاش تحول الأخطاء ديال validation في Spring Boot لردود API نقية ومفهومة للمستخدم."
pubDate: 2026-10-10T12:48:00.000Z
translationKey: 093-how-to-return-clean-validation-errors
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا الديفلوبور ديال frontend مقلق حيت الـ API ديالك كتعطي 500 Internal Server Error ومعاها stack trace طويل بزاف غير حيت المستخدم نسى ما كتبش الإيميل. الكليان ما عارفش شنو وقع، وأنت بلا ما تحس بينتي التفاصيل ديال الكود ديالك. الهدف هو نبدلو "شي حاجة خصرات" بـ "هاد الحقل ديال الإيميل ضروري".

## كيفاش خدامة الـ Validation
في Jakarta Bean Validation، كنستعملو annotations بحال `@NotBlank` و `@NotNull` باش نتأكدو من شكل البيانات. ملي كتوصل request لـ controller فيه `@Valid` وكتكون شي حاجة ناقصة، Spring كيطلع `MethodArgumentNotValidException`. هاد الـ exception كتكون معمرة بتفاصيل تقنية بزاف اللي ما صالحاش تصيفطها نيشان في JSON.

## تنظيم رد الخطأ (Error Response)
باش نقادو هادشي، خاصنا نديرو Global Exception Handler باستعمال `@RestControllerAdvice`. بلاصت ما نصيفطو الـ exception كيفما هي، كنحولوا الأخطاء لـ DTO بسيط فيه غير سمية الحقل (field) والميساج ديال الخطأ.

## مثال تطبيقي: تطبيق ديال المشتريات
نفترضو عندنا تطبيق ديال procurement فين الموظف كيصيفط طلب شراء. الـ `RequestDTO` خاصو يتأكد بلي سمية المنتج ما خاوياش.

```java
public class RequestDTO {
    @NotBlank(message = "سمية المنتج ضرورية")
    private String itemName;
    
    @NotNull(message = "الكمية ما يمكنش تكون null")
    private Integer quantity;
    // getters/setters
}
```

في الـ handler، كنخرجو الأخطاء بحال هكا:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```
**النتيجة:** إلا كانت `itemName` خاوية، الـ API غاترجع `400 Bad Request` مع `{"itemName": "سمية المنتج ضرورية"}`.

## غلط شائع: الفرق بين @NotNull و @NotBlank
بزاف كايغلطو وكيديرو `@NotNull` للـ strings. `@NotNull` كتشوف غير واش الـ object كاين ولا لا، ولكن كتقبل string خاوية (`""`). باش تضمن بلي النص فيه حروف بصح، ديما استعمل `@NotBlank`.

## تمرين تطبيقي
صاوب `ManagerApprovalDTO` فيه `isApproved` (boolean) و `comments` (String). تأكد بلي `comments` ما تكونش خاوية. كيفاش خاص الـ handler يجاوب إلا كانت `comments` خاوية؟

**الجواب:** خاص الـ handler يرجع status 400 مع JSON فيه: `{"comments": "[الميساج ديالك]"}`.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
