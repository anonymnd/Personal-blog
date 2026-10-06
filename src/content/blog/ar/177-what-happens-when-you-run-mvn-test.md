---
title: "شنو كيوقع ملي كانديرو mvn test؟"
description: "شرح مفصل على كيفاش Maven كايتعامل مع التستات وشنو هو الدور ديال Surefire plugin."
pubDate: 2026-10-14T00:48:00.000Z
translationKey: 177-what-happens-when-you-run-mvn-test
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك يلاه ساليتي واحد الميزة جديدة فـ application ديال الشراء (procurement app) فين manager كايوافق على طلب. نتا متأكد من الكود ديالك، ولكن خايف تكون خسرتي شي حاجة فـ logic ديال الطلب. كتكتب `mvn test` فـ terminal، ولكن ماعارفش بالضبط شنو كايوقع لداخل باش Maven يتأكد بلي كلشي خدام.

## الترتيب ديال Lifecycle
ملي كادير `mvn test` ما كيمشيش Maven نيشان للتستات. كاين واحد الترتيب ضروري. قبل ما يوصل لـ `test` phase، Maven كايخدم `validate` و `compile` و `process-test-resources`. هادشي كايعني بلي الكود ديالك كيتحول لـ bytecode و الملفات ديال configuration كايتحطو فبلاصتهم عاد كيبدا التست.

## الدور ديال Surefire Plugin
Maven بوحدو ما كايعرفش كيفاش يخدم Java test، داكشي علاش كايعتمد على Maven Surefire Plugin. هاد plugin كايقلب فـ `src/test/java` على أي class سميتها كتسالي بـ `Test.java` أو `Tests.java`. من بعد، كايحل JVM بوحدها باش يخدم هاد التستات، باش يكون التست معزول على العملية ديال build.

## مثال تطبيقي: الموافقة على الطلب
نشوفو مثال ديال `RequestServiceTest` اللي كايتأكد واش manager يقدر يوافق على طلب:

```java
@Test
void testApproveRequest() {
    Request req = new Request("Laptop", 1200);
    boolean result = service.approve(req, "Manager_1");
    assertTrue(result);
}
```

ملي كادير `mvn test` الـ Surefire كايخدم هاد الميثود. إلا داز كلشي مزيان، كايطلع ليك success. إلا كان مشكل، Maven كايصاوب rapports فـ `target/surefire-reports`. تما فين كتلقى الـ stack trace اللي كاتوريك بالضبط فين كاين المشكل فـ الكود.

## غلط شائع: الفرق بين Test و Package
بزاف ديال الناس كايسحاب ليهم بلي `mvn test` كاتصاوب ملف JAR. هادشي غلط. إلا بغيتي JAR خاصك تخدم `mvn package`. وخا `mvn package` حتى هي كاتخدم التستات (حيت `test` جزء من `package`)، ولكن `mvn test` كايحبس غير فالتستات وما كايجمعش الكود.

## تمرين تطبيقي
سؤال: إلا بغيتي تخدم التستات ولكن بغيتي تمسح كاع داكشي اللي تـcompila قبل باش تبدا من الزيرو، شنو هي command اللي خاصك تخدم؟

الجواب: `mvn clean test`. حيت `clean` كايتمسح الدوسي `target` كامل، و Maven كايضطر يعاود compile كلشي.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
