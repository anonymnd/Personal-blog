---
title: "فهمت أخيراً علاش Kubernetes ماشي هو CI/CD"
description: "شرح بسيط للفرق بين تسيير الكونتينرات (Orchestration) وبين الأتمتة ديال نقل الكود (CI/CD)."
pubDate: 2026-10-18T01:48:00.000Z
translationKey: 274-i-finally-understand-why-kubernetes-is-not-ci-cd
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

بزاف ديال الوقت كنت كنخلط بين Kubernetes و CI/CD حيت بجوجهم كيهضرو على الأتمتة باش الكود يوصل من PC ديال الديفلوبر للسيرفور. كنت كنصحاب بلي إلا كان عندي cluster K8s، راه عندي سيستيم ديال الديبلويمون. ولكن الحقيقة هي أن Kubernetes هو 'البلاصة' فين كيسكن التطبيق، و CI/CD هو 'الطريق' باش كيوصل التطبيق لهاديك البلاصة.

## الفرق بين Orchestration و Automation
Kubernetes هو orchestrator. الخدمة ديالو هي يحضي التطبيق: يتأكد بلي كاينين 3 ديال النسخ (replicas) خدامين، يقسم traffic، ويعاود يشعل container إلا طاح. ولكن K8s ما كيعرفش يكومبيلي الكود، ما كيعرفش يدير tests، وما كيعرفش فوقاش تدفع الكود لـ GitHub. هنا فين كيجي الدور ديال CI/CD. الـ CI (Continuous Integration) هي اللي كاتبني الكود وتستيه، والـ CD (Continuous Deployment) هي اللي كتقول لـ Kubernetes: 'هاك نسخة جديدة ديال image، بدلها'.

## مثال ديال تطبيق ديال الشراء (Procurement App)
تخيل تطبيق فين الموظف كيصيفط طلب شراء (Request). العملية كيفاش كدوز في CI/CD:
1. **مرحلة CI**: الديفلوبر كيصلح مشكل في 'الموافقة' (Approval). Jenkins أو GitHub Actions كيديرو tests وكيصاوبو image سميتها `procurement-app:v2`.
2. **مرحلة CD**: الـ pipeline كيغير الملف ديال Kubernetes باش يولي يخدم بـ `v2` بلاصة `v1`.
3. **مرحلة Kubernetes**: K8s كيشوف التغيير، كيبدل النسخ وحدة بوحدة (rolling update) باش التطبيق ما يوقفش، وكيخلي الخدمات ديال 'المدير' و 'المشتري' خدامين.

## غلط شائع
بزاف ديال الناس كيحاولوا يستعملوا Kubernetes Jobs باش يديروا build للكود. هذا غلط حيت K8s مصاوب باش يسير خدمات خدامة ديما، ماشي باش يدير cycle ديال (source → build → test → deploy).

**طريقة غلط**: دير script shell وسط Pod كيدير `git pull` و `mvn package` كل ساعة.
**طريقة صحيحة**: استعمل أداة CI متخصصة باش تصاوب image، ومن بعد استعمل `kubectl set image` باش تطلعها لـ cluster.

## تمرين تطبيقي
إلا كان الـ pipeline ديالك وقف في المرحلة ديال 'Unit Test'، واش هاد المشكل من Kubernetes ولا من CI؟

**الجواب**: مشكل من CI. حيت Kubernetes مازال ما وصلاتو حتى image جديدة، حيت الـ pipeline حبس قبل ما يوصل لمرحلة الديبلويمون.
