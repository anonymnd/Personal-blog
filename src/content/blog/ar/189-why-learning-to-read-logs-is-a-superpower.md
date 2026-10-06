---
title: "علاش تعلم تقرا الـ Logs هو قوة خارقة"
description: "تعلم كيفاش تفهم الـ logs ديال Maven و Spring Boot باش تحول ساعات ديال التخمام لدقايق ديال الإصلاح الدقيق."
pubDate: 2026-10-14T12:48:00.000Z
translationKey: 189-why-learning-to-read-logs-is-a-superpower
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

تخيل راسك يلاه درتي `mvn package` لواحد l'application ديال procurement (المشتريات). الـ terminal كيطير بالكتيبة، وفجأة كيطلع ليك واحد الحيط ديال الأحمر. بزاف ديال المبتدئين كيتخلعو ولا كيبقاو يطلعو لفوق عشوائياً كيقلبو على شي خيط. المشكل هو أنك كتشوف آلاف السطور وما كتعرفش شكون فيهم اللي مهم بصح.

## كيفاش تفهم الـ Stack Trace
الـ logs ماشي غير خربيش، بل هي خريطة مرتبة بالوقت. فـ Java، أهم حاجة هي الـ stack trace. خاصك تقلب على البلاصة اللي مكتوب فيها `Caused by:`. تما فين كيكون مخبي السبب الحقيقي. فاش كتشوف الفوق ديال الـ trace، غالباً كتلقى غير الـ framework (بحال Spring) كيقول بلي وقع مشكل، ولكن `Caused by` هي اللي كتديك نيشان للسطر ديال الكود ديالك اللي دار الـ crash.

## التعامل مع logs ديال Maven
فاش كدير `mvn clean install` ، Maven كيمشي بواحد الترتيب ديال phases. إلا وقع مشكل فـ phase ديال `test` ، الـ logs غادي يصيفطوك لـ `target/surefire-reports`. وإلا كان المشكل فـ `verify` (ديال integration tests)، خاصك تشوف `target/failsafe-reports`. هاد الفرق مهم باش ما تبقاش تقلب على غلط ديال unit test فالبلاصة ديال integration tests.

## مثال تطبيقي: Class ناقصة
نفترضو l'application ديالك ما بغاتش تخدم وطلع ليك `ClassNotFoundException`.

**الـ Log :**
`Caused by: java.lang.ClassNotFoundException: com.procurement.dto.RequestDTO`
`at org.springframework.beans.factory.support.DefaultListableBeanFactory.createBean...`

**النتيجة :** بلا ما تعاود تشعل الـ IDE، غادي تفهم بلي الكلاس `RequestDTO` ما تـcompila-تش ولا ما كايناش فـ classpath. هنا كدير `mvn clean` باش تمسح `target` ومن بعد `mvn compile` باش تقاد الأمور.

## غلط شائع: فخ "طلع لفوق"
بزاف ديال المطورين كيشوفو أول error كيبان ليهم وكيسحاب ليهم هو السبب. ولكن غالباً أول ميساج كيكون غير عام بحال "Application failed to start".

**التصحيح :** ديما هبط حتى لآخر `Caused by`. تما فين كاين الساس ديال المشكل. وحاجة أخرى، رد بالك ما تبارطاجيش logs فيها passwords ديال base de données ولا API keys فـ internet.

## تمرين تطبيقي
إلا بان ليك فشل (failure) فـ phase ديال `test` فـ Maven build، فين هي أول بلاصة خاصك تشوف فيها الـ report المفصل؟

**الجواب :** شوف فـ dossier `target/surefire-reports`.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
