---
title: "علاش خاصك تصاوب Custom Exceptions"
description: "تعلم كيفاش تعوض الأخطاء العامة ديال السيستيم بـ exceptions ديال البيزنس باش يكون الكود واضح وسهل فالتصحيح."
pubDate: 2026-10-10T13:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
locale: ar
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على app ديال الشراء (procurement). واحد المستخدم بغا يـvalider طلب شراء، ولكن هاد الطلب راه تسد (closed) ديجا. إلا استعملتي `RuntimeException` عادية، الـ error handler ديالك ما غاديش يعرف واش المشكل جاي من لاباز دو دوني، ولا شي حاجة كانت null، ولا غير قاعدة ديال البيزنس تهرسات. فالاخير غادي تصيفط للمستخدم 'Internal Server Error' لي ما كتعني والو وما كاتعاونش فالتصحيح.

## المشكل ديال الـ Exceptions العامة
ملي كاتستعمل `IllegalArgumentException` فكلشي، الكود كيولي مضبب. ملي كاتشوف `throw new RuntimeException("Invalid state")` فالسيرفيس، ما كاتعرفش بالضبط أما قاعدة ديال البيزنس لي تهرسات إلا إذا قريتي الميساج. وزيد عليها أنك إلا درتي catch لـ exception عامة، تقدر تغطي على مشكل تقني خطير وأنت كيسحاب ليك غير كاتعالج خطأ بسيط ديال البيزنس.

## كيفاش تصاوب Exceptions ديال الدومين
الـ custom exceptions كيخليوك تقسم الأخطاء. بلاصة ما دير خطأ عام، صاوب كلاص سميتها مثلا `RequestAlreadyClosedException`. هكا أي واحد قرا الكود غادي يفهم شنو وقع بالضبط. فـ Jakarta EE، غالباً كنخليو هاد الـ exceptions يورثو من `RuntimeException` باش ما نبقاوش نزيدوهم فكل signature ديال الميثود.

## مثال تطبيقي: Approval ديال الطلب
ها كيفاش تطبق custom exception فـ procurement flow:

```java
public class RequestAlreadyClosedException extends RuntimeException {
    public RequestAlreadyClosedException(Long id) {
        super("Purchase request " + id + " is already closed and cannot be approved.");
    }
}

// فـ Service layer
public void approveRequest(Long requestId) {
    PurchaseRequest request = repository.findById(requestId);
    if ("CLOSED".equals(request.getStatus())) {
        throw new RequestAlreadyClosedException(requestId);
    }
    request.setStatus("APPROVED");
}
```
النتيجة: دابا الـ app ولات كفرق بين مشكل تقني (مثلا لاباز طاحت) وبين مشكل ديال البيزنس (الطلب مسدود). دابا تقدر تستعمل `@ControllerAdvice` باش تشد `RequestAlreadyClosedException` وترجع `400 Bad Request` بلاصة `500 Internal Server Error`.

## غلط شائع: الاعتماد بزاف على @Valid
بزاف ديال المطورين كيسحاب ليهم `@Valid` ولا `@NotBlank` كافيين. `@NotBlank` كتشوف غير واش النص خاوي، ولكن ما تقدرش تعرف واش الطلب فالحالة المناسبة باش يتـapprouva. الـ validation ديال input كتهتم بـ 'الشكل' ديال الداتا، ولكن الـ custom exceptions كيهتمو بـ 'المنطق' (logic) ديال البيزنس.

## تمرين تطبيقي
صاوب custom exception سميتها `InsufficientFundsException` فـ app ديال الشراء، ملي كيبغي الشاري يشري حاجة وفلوس الميزانية (budget) ما كافياش.

**التأكد:** الكلاص ديالك خاصها تورث من `RuntimeException` وتستقبل قيمة الميزانية فـ constructor باش تعطي ميساج مفصل.


## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
