---
title: "شنو كيوقع ملي كيطيح (Crash) كونتينر فـ Kubernetes؟"
description: "شرح كيفاش Kubernetes كيتعامل مع المشاكل ديال الكونتينرات باش يرجعهم يخدمو بوحدهم."
pubDate: 2026-10-17T00:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل عندك تطبيق ديال الشراء (procurement app) وفيه واحد السيرفيس ديال 'طلبات الشراء'. فجأة، وقع مشكل ديال الذاكرة (memory leak) والكونتينر طاح. تقدر تظن بلي السيستيم كامل حبس، ولكن فـ Kubernetes، ملي كيطيح كونتينر، كتبدا عملية ديال الإصلاح التلقائي.

## الدور ديال Kubelet
أول واحد كيتدخل ملي كيوقع crash هو الـ kubelet، اللي هو واحد العميل (agent) كيكون خدام فكل نود (node). الـ kubelet كيبقى حاضي الـ container runtime. يلا خرج البروسيس بواحد الكود ديال الخطأ (non-zero status)، الـ kubelet كيعيق بيه ديك الساعة. ما كيبقاش يقلب علاش طاح، ولكن كيشوف الـ `restartPolicy` اللي محددة فـ Pod spec.

## أنواع الـ Restart Policies
Kubernetes عندو 3 ديال الطرق باش يقرر واش يعاود يشعل الكونتينر:
- `Always`: كيعاود يشعلو كيفما كان السبب.
- `OnFailure`: كيشعلو غير يلا طاح بسباب خطأ.
- `Never`: كيخليه طافي وما كيدير والو.

## الفرق بين Liveness و Readiness
شي مرات الكونتينر ما كيطيحش ولكن كيتبلوكا (deadlock). هنا فين كنحتاجو الـ probes. الـ Liveness Probe كتقول لـ Kubernetes واش الكونتينر باقي صحيح. يلا فشلات، Kubernetes كيقتلو وكيعاود يشعلو. أما الـ Readiness Probe، فهي غير كتحكم واش الكونتينر يستقبل trafik من السيرفيس ولا لا، وما كتعاودش تشعل الكونتينر.

## مثال تطبيقي: Pod ديال طلبات الشراء
شوف هاد المثال الصغير:
```yaml
spec:
  containers:
  - name: request-app
    image: procurement-req:v1
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
    restartPolicy: Always
```
يلا طاح `request-app` بسباب segmentation fault، الـ kubelet غادي يشعلو من جديد. ويلا تبلوكا التطبيق وبقى شاعل، الـ probe ديال `/healthz` غادي تفشل، و Kubernetes غادي يفرض عليه restart.

## غلط شائع: CrashLoopBackOff
بزاف ديال الناس كيشوفو `CrashLoopBackOff` وما كيعرفوش شنو هي. هادي كتوقع ملي الكونتينر كيشعل وكيطيح ديك الساعة. Kubernetes باش ما يرهقش النود، ما كيبقاش يشعلو بسرعة، ولكن كيدير واحد الوقت ديال الانتظار (10s, 20s, 40s...) قبل ما يحاول مرة أخرى.
**التصحيح:** ما تبقاش غير تعاود تشعل الـ Pod. شوف الـ logs باستعمال `kubectl logs <pod-name>` باش تعرف المشكل الحقيقي (مثلا شي variable ناقصة).

## تمرين تطبيقي
يلا كان عندنا Pod فيه `restartPolicy: OnFailure` والتطبيق سالا الخدمة ديالو بكود 0 (يعني نجح)، واش Kubernetes غادي يعاود يشعل الكونتينر؟

**الجواب:** لا، حيت كود 0 كيعني بلي الخدمة سالات بنجاح ماشي بسباب خطأ.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
