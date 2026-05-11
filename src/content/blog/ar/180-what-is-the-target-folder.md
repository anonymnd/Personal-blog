---
title: "شنو هو هاد target Folder؟"
description: "دليل بسيط باش تفهم فين كايحط Maven الكود لي تـcompila و لي كايتسمى artifacts."
pubDate: 2026-10-14T03:48:00.000Z
translationKey: 180-what-is-the-target-folder
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

تخايل راسك يلاه كتبتي أول Class ديال Java فـ projet Maven، درتي build، وفجأة بان ليك واحد dossier سميتو `target`. تقدر تسول راسك واش نتا لي كرييتيه بالغلط ولا واش هادشي شي حاجة ديال السيستيم خاصك تجاهلها. هاد الدوسي هو القلب ديال Maven، ولكن بالنسبة للمبتدئين كايجيهم بحال شي 'صندوق أسود' كايدخل ليه الكود وكيخرج منو binary files.

## علاش كاين هاد Target Directory
فـ Maven، كاين فرق كبير بين الكود لي كتكتب (لي كاين فـ `src`) وبين داكشي لي كايتـgénérer. الدوسي `target` هو البلاصة لي Maven كايحط فيها كاع داكشي لي صاوب خلال الـ build process. بلاصة ما يعمر ليك الدوسيات ديال السورس بـ `.class` files، Maven كايجمعهم كاملين هنا. هادشي كايخلي Git يتبع غير الكود ديالك ماشي داكشي لي كايتـgénérer بوحدو.

## شنو كاين لداخل ديال Target
ملي كادير شي commande بحال `mvn package` ، Maven كايعمر هاد الدوسي بـ بزاف ديال السوب-دوسيات:
- `classes`: فيه الـ `.class` files ديال l'application ديالك.
- `test-classes`: فيه الكود ديال tests لي تـcompila.
- `surefire-reports`: هنا فين كايتحطو النتائج ديال unit tests.
- `failsafe-reports`: هنا فين كاينين النتائج ديال integration tests.
- الـ JAR ولا WAR file: هاداك الملف النهائي لي كايتـpackage باش تـdeployih.

## مثال تطبيقي: App ديال الطلبيات
تخايل عندك app ديال procurement فين واحد `Requester` كايصيفط `PurchaseRequest`. كتبتي الكود فـ `src/main/java`. ملي كادير `mvn compile` ، Maven كايحول الـ `.java` لـ bytecode.

**النتيجة:** غاتلقى `target/classes/com/app/PurchaseRequest.class`. وإلا درتي `mvn package` ، غايبان ليك ملف سميتو `procurement-app-1.0.jar` فـ الـ root ديال `target`. هاد الـ JAR هو لي كايتحط فـ السيرفور.

## غلط شائع: تبدل الكود فـ target
بزاف ديال الناس كايحاولوا يصلحوا شي bug بـ أنهم يبدلو شي حاجة وسط `target`. هاد الدوسي مؤقت، يعني أي حاجة بدلتها تما غاتمحي ملي دير `mvn clean` ولا `mvn compile`. ديما بدّل الكود فـ `src`.

## تمرين تطبيقي
**سؤال:** شنو هي الـ commande ديال Maven لي كتمسح الدوسي `target` كامل باش تبدا build جديد ونقي؟

**الجواب:** `mvn clean`. هادي كتمسح الدوسي كامل، وكتخلي Maven يعاود يـcompila كلشي من الزيرو.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
