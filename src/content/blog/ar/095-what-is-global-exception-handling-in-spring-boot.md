---
title: "شنو هي Global Exception Handling في Spring Boot؟"
description: "تعلم كيفاش تجمع كاع تسيير الأخطاء (errors) في بلاصة وحدة باستعمال @ControllerAdvice باش تهنى من التكرار ديال try-catch."
pubDate: 2026-10-10T14:48:00.000Z
translationKey: 095-what-is-global-exception-handling-in-spring-boot
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال المشتريات (procurement app). في كل ميثود ديال Controller—سواء كنتي كتصيفط طلب ولا كتأكد شي كوموند—كتلقى راسك كتعاود نفس الـ try-catch باش تعامل مع `ResourceNotFoundException` ولا `InvalidRequestException`. هاد التكرار كيخلي الكود ديالك مرون وصعيب في الصيانة. هنا فين كتنفع Global Exception Handling اللي كتخليك تجمع هاد المنطق كامل في بلاصة وحدة.

## كيفاش خدامة @ControllerAdvice
Spring Boot كتعطينا واحد الـ annotation سميتها `@ControllerAdvice`. هادي بحال شي « عساس » كيبقى حاضي كاع الـ controllers. ملي كيوقع شي خطأ (exception)، Spring كيقلب على شي ميثود فيها `@ExceptionHandler` وسط الكلاس اللي دايرة `@ControllerAdvice`. إلا لقاها، كينفذها هي عوض ما يخلي السيرفر يخرج ديك الصفحة البايخة ديال 500 Internal Server Error.

## كيفاش تطبق Global Handler
خاصك تصاوب كلاس خاصة. ومن الأحسن تصاوب واحد الـ object ديال Error Response باش اللي كيستعمل الـ API ديالك يوصلو JSON منظم، ماشي stack trace طويلة اللي تقدر تفضح معلومات سرية على السيرفر ديالك.

```java
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleNotFound(ResourceNotFoundException ex) {
        ErrorDetails error = new ErrorDetails("NOT_FOUND", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGeneral(Exception ex) {
        ErrorDetails error = new ErrorDetails("SERVER_ERROR", "وقع خطأ غير متوقع");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## مثال تطبيقي: طلب شراء
تخايل مدير بغا يوافق على طلب شراء بـ ID ما كاينش. السيرفيس غادي يلوح `ResourceNotFoundException`. بلا ما نحتاجو نديرو try-catch في الـ controller، الـ `GlobalExceptionHandler` كيشد هاد الخطأ وكيرجع 404 مع ميساج: `{"code": "NOT_FOUND", "message": "Request ID 123 not found"}`. هكا الـ controller كيبقى نقي ومركز غير على الخدمة ديالو.

## غلط شائع: تبيين الـ Stack Traces
بزاف ديال الناس كيغلطو وكيرجعو الـ `Exception` كاملة ولا الـ stack trace في الـ response. هادشي خطر حيت كيبين بنية الكود والـ libraries اللي خدام بيهم للمخترقين. ديما حول الخطأ لـ DTO بسيط.

## تمرين تطبيقي
صاوب handler لواحد الـ exception سميتها `InsufficientFundsException` اللي ترجع status 400 Bad Request.

**التأكد:** الميثود ديالك خاص تكون فيها `@ExceptionHandler(InsufficientFundsException.class)` وترجع `HttpStatus.BAD_REQUEST`.

## شنو كتغطي كلمة global هنا؟
Controller advice كيدخل فالتعامل ديال Spring MVC مع exceptions؛ ما كيشدش كل خطأ فـ security filters ولا background jobs ولا processes خرين. هاد الحدود حتى هي خاصها handlers ديالها. فهاد المثال، الوراثة من `ResponseEntityExceptionHandler` كتخلي معالجة MVC العادية باقية، بحال الأخطاء ديال JSON والـ validation. زيد handlers خاصة بقواعد الخدمة قبل ما ترجع 500 غير فالأخطاء اللي ما كنتيش متوقعها.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
