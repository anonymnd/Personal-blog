---
title: "كيفاش خدامة الـ Self-Healing في Kubernetes"
description: "شرح بسيط كيفاش Kubernetes كيعرف بلي كاين مشكل في الـ containers وكيصلحو بوحدو باش التطبيق يبقى خدام."
pubDate: 2026-10-17T03:48:00.000Z
translationKey: 252-how-kubernetes-self-healing-works
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا عندك تطبيق ديال الشريان (procurement app) وفيه واحد السيرفيس ديال 'تقديم الطلبات' طاح مع 3 ديال الليل حيت وقع ليه memory leak. بلا orchestration، السيستيم غيبقى طافي حتى يفيق شي مهندس ويعاود يشعلو بيده. هنا فين كتجي الخدمة ديال الـ self-healing في Kubernetes باش ترد هاد العملية أوتوماتيكية.

## الميكانيزم ديال Control Loop
Kubernetes خدام بواحد المبدأ سميتو 'Desired State'. نتا كتقول للـ cluster: "بغيت 3 ديال النسخ (replicas) من procurement-api". الـ Control Plane كيبقى حاضي 'Actual State' (شنو واقع دابا). إلا طاح شي node ولا شي process سكت، الـ reconciliation loop كتعيق بلي كاين فرق وكتدير الإجراء اللازم باش ترجع الحالة كيف بغيتيها.

## الـ Liveness و Readiness Probes
باش Kubernetes يعرف واش كاين مشكل، كيستعمل probes. الـ Liveness Probe كتقول ليه واش الـ container باقي حي؛ إلا لقاها ميتة، كيقتلو ويعاود يشعلو. أما الـ Readiness Probe، كتشوف واش الـ container واجد باش يستقبل traffic. إلا كان الـ pod عاد كيشعل، الـ readiness probe كتفشل، و Kubernetes كيحيدو من الـ Service باش المستخدمين ما يشوفوش error 500.

## مثال تطبيقي: تطبيق الشريان
نشوفو مثال ديال `approval-service`:

```yaml
# طرف من الكود ديال Pod spec
spec:
  containers:
  - name: approval-service
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```
إلا الـ `approval-service` تبلوكا، الـ endpoint ديال `/healthz` ما غيبقاش يجاوب. مورا 20 ثانية، الـ kubelet كيعيق وكيدير restart للـ container. النتيجة هي أن السيرفيس كيقطع غير شوية وكيرجع، بلا ما يطيح السيستيم كامل.

## غلط شائع: تخلط بين Liveness و Readiness
بزاف ديال الناس كيديرو نفس الـ endpoint ليهم بجوج. مثلا إلا كانت base de données طايحة، الـ Liveness probe غتفشل و Kubernetes غيبقى يعاود يشعل التطبيق (CrashLoopBackOff)، وهادشي ما غيحلش مشكل الـ DB. الصحيح هو تستعمل Readiness probe للمشاكل ديال الـ DB؛ هكا التطبيق كيبقى شاعل ولكن ما كيدوزش ليه traffic حتى ترجع الـ DB.

## تمرين تطبيقي
سيناريو: الـ pod ديالك كيطيح حيت كياخد 60 ثانية باش يشارجي واحد الـ cache كبير، ولكن الـ liveness probe كتبدا تقلب مورا 5 ثواني وكتقتلو. شنو خاصك تبدل في الـ configuration؟

الجواب: خاصك تزيد Startup Probe ولا تزيد في الـ `initialDelaySeconds` ديال الـ Liveness probe باش تعطيه الوقت يشارجي الـ cache قبل ما يبدا Kubernetes يقلب عليه.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
