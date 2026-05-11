---
title: "فين كيجي Docker فـ CI/CD"
description: "فهم كيفاش Docker كيكون هو الحلقة اللي كتجمع بين الـ CI والـ CD باش نضمنو أن التطبيق خدام في كاع البيئات."
pubDate: 2026-10-16T20:48:00.000Z
translationKey: 245-where-docker-fits-into-ci-cd
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل شي ديفلوبور كيقول «خدامة عندي في البيسي »، ولكن غير كتوصل لـ serveur ديال production كيطرا crash. هاد المشكل كيوقع حيت الـ serveur يقدر يكون فيه version ديال Java مختلفة ولا ناقصاه شي library. هنا فين كيجي الدور ديال Docker وسط الـ CI/CD pipeline.

## Docker كجسر ديال Packaging
في الـ CI/CD، Docker ماشي هو الأداة اللي كتدير الأوتوماتيزاسيون (بحال Jenkins ولا GitHub Actions)، ولكن هو الـ artifact اللي كنهزوه من مرحلة لمرحلة. الـ CI كتركز على build و tests، و Docker كيضمن أن البيئة اللي درنا فيها tests هي نيتها اللي غتكون في production. بلاصة ما نصيفطو الكود بوحدو، كنصاوبو Docker image فيها كاع داكشي اللي محتاج التطبيق باش يخدم.

## كيفاش كيخدم في الـ Pipeline
1. **مرحلة CI**: الديفلوبور كيدير push للكود في Git. الـ CI server كيبدا الـ build، كيدوز tests، ومن بعد كيصاوب Docker image. هاد الـ image كنعطيوها version وكنصيفطوها لـ registry.
2. **مرحلة CD**: الأداة ديال deployment كتهز ديك الـ image بالضبط وكتخدمها كـ container في الـ serveur. حيت الـ image ما كتبدلش (immutable)، مابقاش الخوف من أن شي حاجة تكون ناقصة.

## مثال تطبيقي: App ديال Procurement
نفترضو عندنا app ديال الشراء فين الموظف كيصيفط demande.
- **Build**: الـ pipeline كيـcompile الكود Java وكيجمعو في image سميتها `procurement-app:v1.2`.
- **Test**: الـ pipeline كيطلع container من هاد الـ image وكيجرب واش كولشي خدام مع database.
- **Deploy**: إلا دازو tests، كنصيفطو الـ image لـ production. دابا الـ manager يقدر يـapprove الطلبات وهو هاني أن السيستيم مستقر.

## غلط شائع: Image كبيرة بزاف
بزاف ديال الناس كيخليو أدوات الـ build (بحال Maven ولا Gradle) وسط الـ image ديال production، وهادشي كيخليها ثقيلة وناقصة في السيكيريتي.
**التصحيح**: خاصك تخدم بـ multi-stage builds. دير مرحلة للـ compilation ومرحلة تانية خفيفة كتهز فيها غير الـ JAR file لـ image فيها غير JRE.

## تمرين تطبيقي
إلا الـ pipeline فشل في مرحلة الـ « Test »، واش خاصنا نصيفطو الـ Docker image لـ registry ديال production؟

**الجواب**: لا. الـ image خاصها تصيفط لـ registry غير إلا دازو كاع الـ tests بنجاح، باش نضمنو أن غير النسخ اللي مفيهاش مشاكل هي اللي كتوصل لـ production.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
