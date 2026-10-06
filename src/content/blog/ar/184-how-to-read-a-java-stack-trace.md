---
title: "كيفاش تقرا Java Stack Trace"
description: "تعلم كيفاش تقرا دوك السطور ديال الخطأ (Stack Trace) في Java باش تعرف بالضبط فين كاين المشكل فلكود ديالك."
pubDate: 2026-10-14T07:48:00.000Z
translationKey: 184-how-to-read-a-java-stack-trace
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

يلاه خدمتي البرنامج ديالك، وفجأة لقتي الكونسول (console) تعمرات بسطور حمرين بزاف. كيبان داكشي بحال شي خربشة، وأول حاجة كتجي لبالك هي تهبط لتحت كاع ولا تعاود تخدم الـ IDE. ولكن فالحقيقة، هاد الـ stack trace هي خريطة دقيقة كتقول ليك فين وقع المشكل وعلاش.

## كيفاش مخدومة الـ Stack Trace
الـ stack trace هي تقرير على كاع الدوال (methods) لي كانوا خدامين فاش وقع الخطأ. القراءة ديالها كتكون من الفوق (أحدث حاجة وقعات) لتحت (البداية ديال البرنامج). أول سطر هو أهم واحد: فيه نوع الخطأ (مثلا `NullPointerException`) وشرح بسيط لشنو وقع.

## كيفاش تلقى الكود ديالك
أغلب دوك السطور كيكونوا ديال Java براسها ولا ديال frameworks (بحال `spring-boot` ولا `jakarta.*`). باش تحل المشكل، خاصك تجاهل هاد السطور وتقلب على أول سطر فيه السمية ديال الـ package ديالك. تما فين كاين الخطأ فـ logic لي كتبتي.

## مثال تطبيقي
تخيل عندنا تطبيق ديال المشتريات (procurement app) فين manager كيوافق على طلب. إلا كان الـ `request` خاوي (null)، البرنامج كيوقف:

```java
public void approveRequest(Request request) {
    // Logic ديال الموافقة
    System.out.println("Approved: " + request.getId());
}
```

**النتيجة لي غتخرج:**
`java.lang.NullPointerException: Cannot invoke "Request.getId()" for null on line 12`
`at com.procure.ManagerService.approveRequest(ManagerService.java:12)`
`at com.procure.Controller.handle(Controller.java:45)`
`at org.springframework.core... (سطور خرين)`

هنا غتعرف دغيا بلي السطر 12 فـ `ManagerService.java` هو لي فيه المشكل حيت `request` كان null.

## الفخ ديال "Caused By"
فالبرامج الكبيرة، كيكون خطأ وسط خطأ. تقدر تلقى `RuntimeException` لفوق، ولكن إلا هبطتي شوية غتلقى `Caused by:`. ديما قلب على *آخر* `Caused by` كاين فالتراس، حيت تما فين كاين السبب الحقيقي ديال المشكل.

## غلط شائع: القراءة من التحت للفوق
بزاف ديال المبتدئين كيمشيو نيشان لتحت. لتحت غالبا كتكون غير الـ `main` method ولا البداية ديال السيرفر، وهادشي ماشي هو فين كيكون bug. ديما قرا من الفوق لتحت حتى تلقى السمية ديال الـ class ديالك.

## تمرين تطبيقي
إلا لقيتي `java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5` متبوعة بـ `at com.app.Utils.process(Utils.java:22)`، شنو هو المشكل؟

**الجواب:** ف السطر 22 ديال `Utils.java` الكود حاول يوصل للعنصر السادس (index 5) فواحد الـ array لي فيها غير 5 ديال العناصر.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
