---
title: "كيفاش تقرا Error ديال Maven"
description: "تعلم كيفاش تقرا وتفهم الأخطاء ديال Maven باش تعرف فين كاين المشكل فـ build ديالك."
pubDate: 2026-10-14T05:48:00.000Z
translationKey: 182-how-to-read-a-maven-error
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

تخيل راسك ساليتي واحد الـ feature فـ application ديال procurement فين manager كيـapprove واحد الطلب. درتي `mvn package` باش تخرج الـ JAR، وفجأة الشاشة ولات حمراء وعمرات بالكتابة. بزاف ديال المبتدئين كيتخلعو وكيبقاو يطلعو للفوق، ولكن الجواب غالباً ما كيكونش تما.

## كيفاش مخدومة Error ديال Maven
الأخطاء ديال Maven منظمين. ملي كيوقع فشل فـ build، Maven كيكتب ليك `BUILD FAILURE`. فوق منها مباشرة، كتلقى الـ goal اللي فشل (مثلاً `maven-compiler-plugin` ولا `maven-surefire-plugin`). السر هو تقلب على أول `[ERROR]` بانت ليك. هاد السطر هو اللي كيقول ليك واش المشكل فـ syntax، ولا شي dependency ناقصة، ولا شي test اللي ما دازش.

## كيفاش تفهم الـ Stack Trace
ملي شي test كيفشل فـ phase ديال `test` ، Maven كيعطيك stack trace طويلة. ما تقراش كلشي. قلب على `Caused by:`. تما فين كاين السبب الحقيقي علاش الكود طاح. قلب على السميات ديال الـ packages ديالك (مثلاً `com.procurement.app`). أول سطر فيه السمية ديال الـ class ديالك ورقم السطر هو فين كاين الـ bug.

## مثال تطبيقي: Dependency ناقصة
نفترض زدتي واحد الـ library باش تخرج PDF فـ application ديالك ولكن نسيتي ما زدتيهاش فـ `pom.xml`. درتي `mvn compile` وخرج ليك:
`[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0...` 
`[ERROR] symbol not found: class com.pdf.Generator`

**النتيجة:** الـ compiler مالقاش الـ class. الحل هو تزيد الـ `<dependency>` الصحيحة فـ `pom.xml` وتعاود الـ build.

## غلط شائع: نسيان الـ Reports
بزاف ديال الناس كيحاولوا يصلحو tests اللي فشلو غير من الـ console، ولكن الـ console بعض المرات ما كتعطيش كاع التفاصيل.
**التصحيح:** سير شوف الدوسي `target/surefire-reports`. Maven كيكتب تما ملفات text و XML مفصلة على كل test فشل، وكيعطيك شنو كان متوقع وشنو خرج فعلياً.

## تمرين تطبيقي
إلا بان ليك `[ERROR] Failed to execute goal org.apache.maven.plugins:maven-surefire-plugin` ، واش الكود ما بغاش يتـcompile ولا شي test اللي فشل؟

**الجواب:** شي test اللي فشل. حيت الـ compilation كيتكلف بيها `maven-compiler-plugin`.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
