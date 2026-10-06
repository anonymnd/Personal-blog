---
title: "فين كيجي Kubernetes فـ CI/CD"
description: "فهم الدور ديال Kubernetes كهدف ديال orchestration وسط pipeline ديال CI/CD."
pubDate: 2026-10-16T21:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال developers كيسحاب ليهم بلي Kubernetes هو أداة ديال CI/CD. كيتخايلو بلي غير كينصبو cluster، راه كلشي كيولي أوتوماتيك من التيست حتى للـ deployment. ولكن في الحقيقة، Kubernetes هو البلاصة فين كيمشي التطبيق (destination)، ماشي هو اللي كيوصلو. هاد الخلط كيجي حيت Kubernetes كيسير lifecycle ديال app، ولكن ما كيعرفش كيفاش يدير compile لكود Java ولا يخدم unit tests.

## كيفاش كيمشي الـ Pipeline
في الخدمة العادية، كلشي كيبدا بـ Git. ملي developer كيدير push لكود، واحد الأداة ديال CI (بحال Jenkins ولا GitHub Actions) كتخدم. هاد الأداة كتـ build التطبيق وكتجمعو في Docker image. ملي كتطلع image لـ registry، هنا كيبدا الدور ديال CD. هنا فين كيدخل Kubernetes: أداة CD كتقول لـ Kubernetes: "بدل version ديال image لـ 2.0". و Kubernetes كيتكلف يوزعها على الـ cluster.

## الفرق بين Orchestration و Automation
أدوات CI/CD كيديرو أوتوماتيزاسيون باش يحركو الكود، ولكن Kubernetes كيدير orchestration للخدمات. مثلا، في app ديال procurement (المشتريات)، الخدمة ديال 'Requester' تقدر تكون فيها 3 ديال replicas. إلا طاح واحد pod، الـ kubelet كيعاود يشعلو على حساب الـ restart policy. هادي كتسمى self-healing، ولكن ماشي هي CI/CD، هادي غير باش السيستيم يبقى خدام.

## مثال تطبيقي: تحديث App ديال المشتريات
تخايل بغينا نحدثو service ديال 'Approval' في سيستيم ديال المشتريات:
1. **مرحلة CI**: كود push → التيستات دازو → تصاوبات image سميتها `procurement-approval:v2`.
2. **مرحلة CD**: الـ pipeline كيبدل manifest ديال Kubernetes:
```yaml
spec:
  template:
    spec:
      containers:
      - name: approval-service
        image: procurement-approval:v2
```
3. **خدمة K8s**: كيدير rolling update، كيبدل pods v1 بـ v2 واحد بواحد باش السيرفيس ما يقطعش.

## غلط شائع: خلط Liveness Probe مع CI
كاين اللي كيسحاب ليه بلي Liveness Probe كتصلح bugs. إلا كان عندك bug في الكود، الـ Probe غادي تعاود تشعل container، ولكن الـ bug باقي تما. الـ CI هي اللي خاصها تحيد الـ bug، و Kubernetes خدمتو غير يخلي app شاعلة وخا يوقع crash.

## تمرين تطبيقي
إلا كان pipeline CI صاوب Docker image بنجاح، ولكن app ما بغاتش تخدم في Kubernetes حيت كاين غلط في variable d'environnement، شكون اللي فشل هنا؟

**الجواب**: مرحلة CD/Deployment (أو configuration)، حيت الـ image تصاوبات صحيحة، ولكن المشكل كان في الإعدادات ديال البلاصة فين تحطات (orchestration target).

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
