---
title: "الفرق بين Local و Development و Staging و Production"
description: "دليل باش تفهم الفرق بين البيئات الربعة اللي كنخدمو بيهم فالتطوير ديال السوفتوير."
pubDate: 2026-10-16T08:48:00.000Z
translationKey: 233-local-vs-development-vs-staging-vs-production
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل راسك صاوبتي ميزة جديدة فـ application ديال الشرا (procurement app) فين manager كيوافق على طلب. جربتيها فـ PC ديالك وخدامة ناضية، ولكن غير صيفطتيها للسيرفر الحقيقي، كلشي وقف حيت version ديال database كانت مختلفة. هادشي علاش كنقسمو الخدمة لبيئات (environments) مختلفة.

## البيئة المحلية (Local Environment)
هادي هي الماكينة ديالك. هي بحال واحد الصندوق ديال التجارب فين تقدر تخسر كلشي بلا ما تبرزط حد. هنا كنخدمو بـ Docker باش نقربو لداكشي اللي كاين فالسيرفر. عندك التحكم الكامل وتقدر تستعمل debugger باش تشوف الكود فين واحل. الهدف هنا هو تخدم بسرعة وتجرب.

## بيئة التطوير (Development Environment)
ملي كتصيفط الكود ديالك لـ repository مشترك، كيمشي لـ Dev. هاد السيرفر كيكون مشترك بين كاع developers باش يجمعو الخدمة ديالهم. هنا فين كتعرف واش داك الكود ديال 'الموافقة' اللي درتي ماكيضربش مع الكود ديال 'التنبيهات' اللي دار صاحبك. هاد البيئة غالبا كتكون غير مستقرة حيت التغييرات فيها كثيرة.

## بيئة التجهيز (Staging Environment)
الـ Staging هو نسخة طبق الأصل من Production. نفس السيرفرات، نفس version ديال database، ونفس الإعدادات. فـ application ديالنا، هنا فين كيجربو الـ QA (المختبرين) الطريق كاملة: Requester → Manager → Buyer. إلا خدمات فـ Staging، غالبا غتخدم فـ Production حيت البيئة هي هي.

## بيئة الإنتاج (Production Environment)
هادي هي اللي خدامين بيها الناس (Live). الدخول ليها كيكون محدود بزاف. الكود ما كيوصل ليها حتى كيدوز من كاع المراحل اللي قبل عبر pipeline ديال CI/CD. هنا الاستقرار هو أهم حاجة؛ ممنوع تجرب شي حاجة جديدة مباشرة فـ Prod.

## مثال تطبيقي: طريق الديبلويمون
| المرحلة | الفعل | النتيجة |
| :--- | :--- | :--- |
| Local | صاوبت `approveRequest()` | خدامة فـ PC ديالي |
| Dev | دمجت الكود فـ `develop` branch | تجمعات مع ميزات أخرى |
| Staging | صيفطتها لسيرفر Pre-Prod | الـ QA جربوها ولقاوها ناضية |
| Prod | صيفطتها للسيرفر Live | المستخدمين بداو كيوافقو |

## غلط شائع: كتابة الإعدادات وسط الكود
بزاف كيغلطو وكيكتبو URL ديال database بحال `localhost:5432` وسط الكود. هادي غتخدم ليك Local ولكن غتوقف ليك فـ Staging.
**التصحيح:** خدم بـ environment variables (بحال `process.env.DB_URL`) باش السيرفر هو اللي يعطي العنوان الصحيح على حسب فين كاين.

## تمرين تطبيقي
إلا لقى شي مستخدم bug فـ application اللي خدامة live، فين خاص developer يحاول يلقى المشكل ويصلحو أول مرة؟

**الجواب:** البيئة المحلية (Local environment).

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
