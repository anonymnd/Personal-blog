---
title: "شنو كيوقع من بعد ما كدير Push للكود؟"
description: "شرح مبسط للمسار اللي كيدوز منو الكود من Git حتى كيولي خدام فالسيرفور."
pubDate: 2026-10-16T18:48:00.000Z
translationKey: 243-what-happens-after-you-push-code
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل راسك ساليتي واحد الميزة (feature) فواحد التطبيق ديال الشراء (procurement app) فين المدير كيوافق على الطلب. درتي `git push origin main` وفجأة لقيتي الكود ديالك ولا خدام. بالنسبة للمبتدئين، هادشي كيبان بحال السحر، ولكن هو فالحقيقة سلسلة ديال الخطوات مبرمجة كتسمى CI/CD pipeline.

## الـ Trigger و l'Intégration Continue (CI)
ملي كدير push للكود لـ GitHub، السيرفور كيصيفط إشارة (webhook) لواحد الأداة ديال CI. هاد الأداة كتهز الكود وكبدا عملية الـ 'Build'. هنا كيتجمع الكود وكيتم تشغيل tests باش نتأكدو بلي التغيير اللي درتي فالموافقة ما خسرش الفورمولير ديال الطلبات. إلا كان شي test خاسر، العملية كتحبس تما باش ما يطلعش كود فيه مشاكل للسيرفور.

## الفرق بين Continuous Delivery و Deployment
ملي كينجح الـ build، الكود كيدوز لمرحلة التوصيل. فـ Continuous Delivery، الكود كيتوجد ولكن خاص بنادم يبرك على زر 'Deploy' باش يطلع للـ production. أما فـ Continuous Deployment، كلشي كيكون أوتوماتيكي؛ إلا دازو tests، الكود كيطلع نيشان للسيرفور بلا ما يتدخل حتى واحد.

## Docker و Kubernetes
باش نضمنو بلي التطبيق غيخدم بنفس الطريقة فكاع البلايص، الـ pipeline كيدير ليه packaging فـ Docker image. هاد image كتمشي لـ Kubernetes. خاصك تعرف بلي Kubernetes ماشي هو اللي كيبني الكود، ولكن هو اللي كيسير (orchestrate) هاد الـ containers وكيفرقهم على السيرفورات.

## الـ Self-healing و مراقبة الصحة
ملي كيولي التطبيق خدام، Kubernetes كيبقى عاس عليه. كيستعمل 'Liveness Probe' باش يشوف واش التطبيق طاح؛ إلا طاح، كيعاود يدماري الـ container. وكاين 'Readiness Probe' اللي كيتأكد بلي التطبيق واجد 100% عاد كيبدا يصيفط ليه الناس اللي داخلين للموقع، باش ما يطلعش ليهم error 500 وهو عاد كيشعل.

## غلط شائع: خلط CI مع Orchestration
بزاف كيسحاب ليهم بلي Kubernetes هو اللي كيدير tests. فالحقيقة، أداة CI (بحال Jenkins) هي اللي كدير tests وكتصاوب الـ image، و Kubernetes خدمتو غير يسير داك الـ container ملي كيولي واجد.

## تمرين تطبيقي
إلا كانت Liveness Probe كتعطي failure بزاف المرات لواحد الـ pod فالتطبيق ديالك، شنو غيدير Kubernetes؟

**الجواب:** غادي يعاود يدماري (restart) الـ container على حساب الـ restart policy اللي محددة باش يحاول يرجع الخدمة.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
