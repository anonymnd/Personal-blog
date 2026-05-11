---
title: "شنو هو CI/CD؟"
description: "دليل للمبتدئين باش يفهمو كيفاش الكود كيدوز من PC ديال الديفلوبور حتى كيوصل للـ production بطريقة أوتوماتيكية."
pubDate: 2026-10-16T14:48:00.000Z
translationKey: 239-what-is-ci-cd
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل معايا واحد الفريق ديال 5 ديفلوبورات خدامين على تطبيق ديال الشراء (procurement app). واحد كيقاد الفورم ديال 'الطلب' (Request)، واحد آخر كيقاد المنطق ديال 'موافقة المدير' (Manager Approval)، وتالت كيقاد السيستيم ديال 'طلب الشراء' (Buyer Order). إلا ما كانش عندهم سيستيم، غادي يضيعو ساعات باش يجمعو الكود يدوياً، وفالاخير يلقاو بلي التعديل ديال المدير خسر الفورم ديال الطلب. هاد الروينة هي اللي كيحلها CI/CD.

## التكامل المستمر (CI)
الـ CI هي فاش الديفلوبورات كيجمعو الخدمة ديالهم فـ mainline وحدة بزاف د المرات ف النهار. بلاصة ما يتسناو سيمانات، كيديرو push لتغييرات صغيرة لـ Git. هاد الـ push كيطلق واحد السلسلة أوتوماتيكية ديال الـ build والـ tests. إلا طاح شي test، الفريق كيعرف ديك الساعة شكون هو التعديل اللي خسر الخدمة باش يصلحوه دغيا.

## التسليم المستمر vs النشر المستمر
كاين فرق بين Continuous Delivery و Continuous Deployment. الـ Delivery كتعني بلي الكود ديما واجد باش يتنشر (releasable state)، ولكن خاص بنادم يبرك على Bouton باش يدوز للـ production. أما الـ Deployment، فإلا داز الكود من كاع الـ tests، كيمشي نيشان للـ production بلا ما يتدخل حتى واحد.

## كيفاش كيخدم الـ Pipeline
هاك مثال بسيط ديال كيفاش كتكون configuration ديال pipeline:

```yaml
stages:
  - build: compile_java_app
  - test: run_unit_tests
  - deliver: push_to_staging
  - deploy: push_to_production # غير ف الـ Continuous Deployment
```

فالتطبيق ديالنا، ملي الديفلوبور كيدير push لشي تصليح فـ 'Buyer Order'، السيرفر ديال CI كيجمع الكود وكيدير tests باش يتأكد بلي 'Manager Approval' مازال خدامة مزيان.

## غلط شائع: تخلط بين الأدوات والعملية
بزاف كيصحاب ليهم بلي غير حيت ركبو Jenkins أو GitHub Actions راه داروا CI/CD. هادو غير أدوات كيعاونو، ولكن CI/CD هي ثقافة ديال الخدمة (culture) مبنية على التجميع المستمر والـ tests. إلا خدمتي بالأدوات بلا tests، راك غير كتسرع عملية إرسال الـ bugs للـ production.

## تمرين تطبيقي
سيناريو: واحد الديفلوبور دار push لكود اللي خسر الـ build. فبيئة CI/CD، شنو كيوقع مباشرة مورا الـ push؟

**الجواب:** الـ pipeline ديال CI كيتحرك، المرحلة ديال build/test كتفشل، والديفلوبور كيوصلو خبر فالحين باش يصلح الكود قبل ما يتجمع مع الخدمة ديال الآخرين.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
