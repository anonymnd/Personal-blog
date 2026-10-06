---
title: "كيفاش الكود ديالك كيمشي من الـ Laptop لـ Server"
description: "شرح مبسط كيفاش الكود ديالك كينتقل من البي سي ديالك حتى كيوصل للسيرفر فين كيشوفوه الناس."
pubDate: 2026-10-16T10:48:00.000Z
translationKey: 235-how-your-code-goes-from-laptop-to-server
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل راسك ساليتي واحد الميزة جديدة فـ application ديال الشرا (procurement app) فين المدير كيوافق على الطلبات. كلشي خدام مزيان فـ laptop ديالك، ولكن كيفاش هاد الكود كيوصل للمستخدمين فـ internet؟ هاد العملية ماشي غير copy-paste، بل هي طريق منظمة كنسميوها CI/CD.

## البداية مع Git
كلشي كيبدا بـ Git. ما كنصيفطوش الملفات فـ email، ولكن كنديرو commit للتغييرات فـ repository محلي. ملي كدير push لهاد التغييرات لـ GitHub مثلاً، نتا ماشي غير كتخزن الكود، ولكن كتعطي إشارة (trigger) للسيرفر ديال الأوتوماتيزاسيون بلي كاين كود جديد خاصو يتراجع.

## CI: التكامل المستمر
ملي كيوصل الكود، الـ CI pipeline كيبدا يخدم. كيجبد الكود، كيـ compile-يه، وكيجرب tests أوتوماتيكية. فـ application ديالنا، الـ CI كيتأكد بلي البوطون ديال 'الموافقة' خدامة وما خسراتش العملية ديال 'طلب الشراء'. إلا كان شي غلط، الـ pipeline كيوقف تما باش الكود الخاسر ما يوصلش للسيرفر.

## CD: الفرق بين Delivery و Deployment
الـ Continuous Delivery كتعني بلي الكود ديما واجد باش يتلونصا، ولكن خاص بنادم يورك على بوطون باش يدوز لـ production. أما الـ Continuous Deployment، فـ هي ملي كيدوز الكود من tests بنجاح، كيمشي نيشان للسيرفر بلا ما يتدخل حتى واحد.

## التغليف و Kubernetes
باش نضمنو بلي الكود غيخدم فـ السيرفر بحال كيف خدم فـ laptop، كنستعملو Docker باش نديروه فـ container. ومن بعد كيجي Kubernetes باش ينظم هاد الـ containers. إلا طاح شي container، الـ kubelet كيعيق بيه وكيعاود يـ restart-يه على حساب الـ restart policy. هادشي هو اللي كنسميوه self-healing.

## غلط شائع: خلط الـ CI مع الـ Deployment
بزاف ديال المبتدئين كيسحاب ليهم بلي tool ديال CI (بحال Jenkins) هو اللي كيشغل الـ app. فـ الحقيقة، الـ CI tool غير كيسير الطريق. أما التشغيل الحقيقي كيكون وسط container كيسيرو Kubernetes.

## تمرين تطبيقي
**الحالة:** درتي push للكود، والـ build داز مزيان، ولكن الـ app مازال ما تبدلاتش فـ السيرفر. فين خاصك تقلب أول حاجة؟

**الجواب:** خاصك تشوف المرحلة ديال Deployment أو تشوف الحالة ديال pods فـ Kubernetes باش تعرف واش الـ container الجديد ما بغاش يخدم أو واش نسيتي ما وركتيش على بوطون الـ release.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
