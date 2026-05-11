---
title: "واش Kubernetes أداة ديال CI/CD؟"
description: "توضيح الفرق الأساسي بين orchestration ديال containers وبين pipelines لي كيديرو الأتمتة ديال integration و delivery."
pubDate: 2026-10-16T22:48:00.000Z
translationKey: 247-is-kubernetes-a-ci-cd-tool
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا صاوبتي application ديال procurement (المشتريات) فين الموظف كيصيفط طلب و manager كيوافق عليه. قدرتي تجمع هاد app فـ Docker image. دابا، وقع ليك خلط حيت كتسمع الناس كيهضرو على Kubernetes و CI/CD فدقة وحدة، وبغيتي تعرف واش غير تـinstaller Kubernetes كافي باش تـautomatiser كاع عملية الـ release ديالك.

## الفرق الأساسي
Kubernetes ماشي أداة ديال CI/CD، بل هو orchestrator ديال containers. بينما أدوات CI/CD كيركزو على *الطريق* لي كيدوز منو الكود من pc ديال developer حتى للسيرفر، Kubernetes كيركز على *البلاصة* فين غايحط الكود. هو لي كيسير فين غايخدمو containers، كيفاش يكبرو (scale)، وكيفاش يعاودو يخدمو إلا طاحو. Kubernetes ما كيعرفش يدير tests unitaires، ولا يـcompile الكود ديال Java، ولا يـtrigger build ملي تدير push لـ GitHub.

## كيفاش كيخدم هاد السيستيم
فـ pipeline ديال app ديال المشتريات، الأدوار مقسمة. أداة CI (بحال Jenkins ولا GitHub Actions) هي لي كتكلف بالـ build و tests. ومن بعد، أداة CD هي لي كتقول لـ Kubernetes باش يبدل الـ image بـ version جديدة.

| الميزة | أداة CI/CD | Kubernetes |
| :--- | :--- | :--- |
| الهدف الأساسي | أتمتة الـ pipeline | تسيير الـ workloads |
| الخدمة | Build, Test, Deploy | Scheduling, Scaling, Healing |
| شنو كيشعلها | Git Push / Merge | API Request / Controller |

## مثال تطبيقي: Trigger ديال Deployment
نفترضو الـ app ديالك خدامة فـ Pod. باش تدير mise à jour، ما كتخدمش بـ Kubernetes باش 'تبني' (build) الـ app. بلاصتها، الـ pipeline كيدير هاد الأوامر:

```bash
# أداة CI كتبني الـ image وكتصيفطها لـ registry
docker build -t procurement-app:v2 .
docker push procurement-app:v2

# الجزء ديال CD كيقول لـ Kubernetes يبدل الـ image
kubectl set image deployment/procurement-deploy app=procurement-app:v2
```
النتيجة: Kubernetes كيدير rolling update، كيبدل pods القدام بـ جداد بلا ما تحبس الخدمة.

## غلط شائع: تخلط بين Self-Healing و CI
بزاف كيصحاب ليهم حيت Kubernetes كيقدر يعاود يشعل container إلا طاح (بواسطة Liveness Probes)، راه 'كيصلح' الكود. هادشي غلط. Kubernetes كيضمن أن infrastructure تبقى خدامة، ماشي كيصلح bugs. إلا كان عندك NullPointerException، Kubernetes غايعاود يشعل الـ pod، ولكن غايطيح عاوتاني. خاصك ضروري CI/CD pipeline باش تصيفط version مصححة ديال الكود.

## تمرين تطبيقي
سيناريو: درتي push لواحد التغيير فـ GitHub، و الـ app دابا خدامة فـ cluster. شنو هي الحاجة لي دارتها أداة CI/CD وشنو هي لي دارها Kubernetes؟

**الجواب:** أداة CI/CD هي لي تكلفات بالـ trigger، وبناء الـ Docker image، والأمر ديال mise à jour ديال cluster. أما Kubernetes فهو لي تكلف بتوزيع الـ pods وتأكد أن version الجديدة بقات خدامة.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
