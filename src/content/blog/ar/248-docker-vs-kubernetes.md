---
title: "Docker مقابل Kubernetes: شنو الفرق بيناتهم؟"
description: "مقارنة بسيطة بين الـ containerization والـ orchestration باش تفهم كيفاش كيخدمو بجوج فـ pipeline ديال deployment."
pubDate: 2026-10-16T23:48:00.000Z
translationKey: 248-docker-vs-kubernetes
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل صاوبتي application ديال procurement (المشتريات) فين الموظف كيصيفط طلب والمدير كيوافق عليه. الخدمة خدامة ناضية فـ PC ديالك، ولكن ملي كطلعها للسيرفر، كيبداو يوقعو مشاكل حيت version ديال Java مختلفة ولا كاين شي library ناقصة. هاد المشكل ديال "خدامة عندي فـ PC" هو علاش كنستعملو containers.

## شنو هو Docker؟
Docker هو tool كيخليك تصاوب وتخدم apps وسط containers. تخيل الـ container بحال شي صندوق صغير فيه كلشي: الكود، الـ runtime، والـ tools اللي محتاج الـ app باش تخدم. فـ المثال ديالنا، Docker كيجمع الـ Spring Boot JAR والـ JRE فـ image وحدة. هكذا كنضمنو بلي الـ app غتخدم بنفس الطريقة سواء كانت فـ PC ديال developer ولا فـ serveur ديال production.

## شنو هو Kubernetes؟
إلا كان Docker كيتكلف بـ container واحد، Kubernetes (K8s) كيتكلف بـ "الجيش" ديال containers. إلا ولات الـ app ديالك مشهورة وحتاجيتي 10 ديال النسخ من "Service d'Approbation" باش تهز الضغط، صعيب تسيرهم كاملين بـ Docker بوحدو. هنا كيجي Kubernetes كـ orchestrator؛ هو اللي كينظم الـ deployment والـ scaling وكيسير هاد الـ containers فـ مجموعة ديال السيرفرات (cluster).

## كيفاش كيخدمو بجوج؟
راه ماشي "يا إما Docker يا إما Kubernetes"، بل بجوج كيكملو بعضياتهم. Docker كيصاوب الـ image وكيخدم الـ container، و Kubernetes هو اللي كيقرر فين غيتحط هاد الـ container وكيراقب واش باقي خدام.

| الميزة | Docker | Kubernetes |
| :--- | :--- | :--- |
| الهدف الأساسي | التغليف والعزل (Packaging) | التنظيم والتوسيع (Orchestration) |
| النطاق | Container واحد | Cluster ديال containers |
| إصلاح الأعطال | restart policies بسيطة | تعويض Pods بشكل متطور |

## مثال تطبيقي
تخيل الـ container ديال "Service Acheteur" طاح حيت وقع مشكل فـ الذاكرة (memory leak).
- **بـ Docker بوحدو:** الـ container كيوقف. إلا ما كنتيش داير restart policy أو ما عاودتيهش بيدك، الخدمة غتبقى حابسة.
- **بـ Kubernetes:** الـ Kubelet كيعيق بلي الـ container مات عن طريق liveness probe. Kubernetes كيقتل الـ pod اللي خاسر وكيطلق واحد جديد فـ بلاصة خاوية باش الخدمة تبقى خدامة.

## غلط شائع: خلط K8s مع CI/CD
بزاف كيصحاب ليهم بلي Kubernetes هو tool ديال CI/CD. راه Kubernetes ما كيـ build-يش الكود وما كيديرش tests؛ هو غير كيسير containers واجدين. خاصك ضروري pipeline (بحال GitHub Actions) باش يدير build لـ Docker عاد يگول لـ Kubernetes يبدل الـ image.

## تمرين تطبيقي
**سؤال:** إلا كانت عندك app صغيرة وسيرفر واحد، واش ضروري تخدم بـ Kubernetes؟
**جواب:** لا. Docker (أو Docker Compose) كافي فهاد الحالة. Kubernetes فيه تعقيدات ما كنحتاجوها غير ملي كنكونو باغيين high availability و scaling فـ بزاف ديال السيرفرات.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
