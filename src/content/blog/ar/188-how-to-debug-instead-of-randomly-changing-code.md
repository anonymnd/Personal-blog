---
title: "كيفاش تديبيغي (Debug) بلا ما تبقى تبدل فلكود عشوائياً"
description: "تعلم طريقة منظمة باش تلقى المشاكل فلكود باستعمال stack traces و debugger بلا ما تبقى تجرب وتغلط."
pubDate: 2026-10-14T11:48:00.000Z
translationKey: 188-how-to-debug-instead-of-randomly-changing-code
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

تخيل عندك bug فمشروع Java خدام بـ Maven. كتبدل شي variable، كتعاود تلونصي l'app، وكتلقاها باقة خاسرة. كتمسح سطر، كتزيد print، وكتعاود تلونصي. هاد الطريقة ديال 'جرب وشوف' كتضيع الوقت وكتزيد مشاكل خرين بلا ما تحل المشكل الأصلي.

## علاش خاصنا نخدمو بطريقة منظمة؟
التبدال العشوائي ديال الكود كيوقع حيت ما كنعرفوش بالضبط فين كاين المشكل. باش تحبس هاد التخمام، خاصك تحول من 'كنظن المشكل هنا' لـ 'أنا عارف المشكل هنا'. خاصك تعزل البلاصة لي فيها l'erreur قبل ما تقيس أي حاجة فـ la logique. إلا بدلتي الكود قبل ما تفهم، غادي تمسح الدلائل لي غتخليك تعرف السبب.

## كيفاش تقرا الـ Stack Trace
ملي كيوقع crash فـ `mvn test` أو `spring-boot:run` كطلع واحد listة طويلة ديال errors سميتها stack trace. ما تخلعكش الطول ديالها. قلب على أول بلاصة كيبان فيها smia ديال package ديالك (مثلاً `com.procurement.app`).

شوف لتحت فين مكتوبة `Caused by:`; تما فين كاين السبب الحقيقي. مثلاً، إلا كانت طلبية شراء (procurement request) ما بغاتش تسجل، تقدر تلقى `NullPointerException` فـ `RequestService.java:42`. هكا كتعرف بالضبط السطر لي فيه المشكل.

## خدم بـ Breakpoints بلاصة print
عوض ما تبقى تزيد `System.out.println()`، خدم بـ debugger. دير breakpoint فـ السطر لي فيه المشكل. ملي يوقف البرنامج، تقدر تشوف كاع les variables شحال فيهم ديال القيم فديك اللحظة.

**مثال تطبيقي:**
فـ application ديال procurement، manager كيوافق على طلبية، ولكن status كيبقى 'PENDING'.
- **الطريقة الغالطة:** تبقى تبدل فـ la logique ديال update وتلونصي السيرفر 5 دالمرات.
- **الطريقة الصحيحة:** دير breakpoint فـ `ApprovalService.approve()`. شوف l'objet `request`. تقدر تلقى بلي `requestId` جا null، يعني المشكل كاين فـ Controller ماشي فـ Service.

## غلط شائع: السحور ديال `mvn clean`
بزاف ديال developers كيديرو `mvn clean` كل مرة كيبدلو فيها الكود، كيسحاب ليهم غادي يحيد 'bugs خفية'. `mvn clean` كيمسح غير dossier `target` (النتائج ديال build)، ولكن ما كيصلحش الأخطاء لي فـ source code. إلا بقى المشكل مورا clean، راه المشكل فـ Java ماشي فـ compilation.

## تمرين تطبيقي
**الوضعية:** `mvn test` عطاك `NoSuchMethodError` فـ شي test class، ولقيتي l'erreur فـ `target/surefire-reports`.

**السؤال:** واش تبدا تبدل سميات methods باش تشوف واش تخدم، ولا تشوف stack trace باش تقلب على conflict فـ versions ديال libraries؟

**الجواب:** شوف stack trace. `NoSuchMethodError` غالباً كتعني بلي كاين مشكل ديال versions فـ `pom.xml` ماشي مشكل فـ la logique ديال الكود.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
