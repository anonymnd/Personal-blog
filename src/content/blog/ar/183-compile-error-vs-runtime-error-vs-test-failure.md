---
title: "الفرق بين Compile Error و Runtime Error و Test Failure"
description: "تعلم كيف تفرق بين مشاكل الكومبيل، مشاكل الـ Runtime، وفشل التيست باش تعرف تديبيغي الكود ديالك بسرعة."
pubDate: 2026-10-14T06:48:00.000Z
translationKey: 183-compile-error-vs-runtime-error-vs-test-failure
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب. درتي `mvn package` وفجأة حبس كلشي. واش نسيتي شي فاصلة منقوطة (semicolon)، ولا الداتابيز طاحت، ولا المنطق ديال الموافقة (approval logic) فيه غلط؟ باش ماتضيعش وقتك، خاصك تعرف الفرق بين هاد تلاتة ديال المشاكل.

## Compile Error: العساس ديال الكود
هاد المشكل كيوقع فاش الكومبيلر (compiler) مكيقدرش يحول الكود ديالك لـ bytecode. هادشي كيوقع فالمرحلة ديال `compile` فـ Maven. كيكون غالباً غلط فالسنتكس (syntax) أو فأنواع البيانات (types). إلا كانت عندك Compile Error، راه حتى ملف `.class` ماتصاوبش، والتطبيق أصلاً ميمكنش يخدم.

## Runtime Error: الكراش المفاجئ
هاد المشاكل كيوقعو والتطبيق خدام. الكود مكتوب صحيح من ناحية السنتكس، ولكن كاين شي عملية مستحيل تدار. فـ Java، هادو كيتسماو `Exceptions`. مثلاً، إلا التطبيق حاول يوصل لشي object ديال `Request` وهو `null` ، غادي تخرج ليك `NullPointerException`. هنا التطبيق كيوقع ليه كراش وكتشوف stack trace فـ console.

## Test Failure: غلط فـ المنطق
فشل التيست (Test failure) مختلف، حيت الكود كيـكومبيلا وكيخدم بلا ما يطيح. ولكن النتيجة ماشي هي اللي كنتي كتسنى. فاش كدير `mvn test` ، الـ plugin ديال Surefire كيخدم التيستات ديال JUnit. إلا كنتي داير assertion بلي الحالة ديال الطلب خاصها تكون "APPROVED" ولكن لقتيها بقات "PENDING" ، هنا التيست كيفشل. هادا كيتسمى bug فـ business logic ماشي crash.

## مثال تطبيقي: منطق الموافقة
شوف هاد الكود الصغير ديال الموافقة على طلب:

```java
public void approveRequest(Request req) {
    // Compile Error: إلا كتبتي 'req.status = "APPROVED"' و status كانت private
    req.setStatus("APPROVED"); 
    
    // Runtime Error: إلا كان 'req' هو null، غادي يوقع NullPointerException
    System.out.println(req.getId()); 
}
```
- **Compile Error**: تكتب `req.setStat("APPROVED")` (غلط فسمية الميثود) كيحبس الـ build.
- **Runtime Error**: تعيط لـ `approveRequest(null)` كيخلي التطبيق يطيح فـ runtime.
- **Test Failure**: دير تيست `assertEquals("APPROVED", req.getStatus())` ولكن الميثود لداخل خاوية.

## غلط شائع: الخلط بين الـ Stack Trace و Test Failure
بزاف ديال المطورين كيخلطو بين `RuntimeException` و Test failure. إلا شفتي `java.lang.NullPointerException` فـ console، راه Runtime error اللي طيح التيست. ولكن إلا شفتي `AssertionFailedError` ، راه الكود خدم ولكن النتيجة غلط.

## تمرين تطبيقي
أنا حالة هادي: درتي `mvn package` وخرج ليك فـ console: `cannot find symbol: method calculateTotal() in class Order`؟

**الجواب**: Compile Error. حيت الكومبيلر مالقاش التعريف ديال الميثود.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
