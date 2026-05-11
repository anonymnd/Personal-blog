---
title: "شنو الفرق بين Liveness Probe و Readiness Probe؟"
description: "تعلم الفرق بين السوندات (probes) لي كيديرو ريستارت للكونتينر ودوك لي كيتحكمو غير فالترافيك فـ Kubernetes."
pubDate: 2026-10-17T02:48:00.000Z
translationKey: 251-liveness-probe-vs-readiness-probe
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك تطبيق ديال الشراء (procurement app) وفيه واحد السيرفيس ديال 'الموافقة' (Approval Service) تبلوكا بسباب deadlock. البروسيس باقي خدام، دونك Kubernetes كيسحاب ليه بلي Pod مزيان، ولكن فالحقيقة حتى مدير ما قادر يوافق على حتى طلب. هنا فين كينفعو الـ probes باش نتفاداو هاد المشاكل لي مكاتبانش.

## شنو هي Liveness Probe
الـ Liveness Probe كتقول لـ kubelet واش الكونتينر باقي حي. إلا فشلات هاد السوندة، Kubernetes كيقتل الكونتينر وكيعاود يطلقه من جديد (restart). هادي مديورة باش نصلحو الحالات فين التطبيق كيتبلوكا داخلياً ولكن البروسيس مكيخرجش (doesn't exit).

## شنو هي Readiness Probe
الـ Readiness Probe كتعرف واش الكونتينر واجد باش يستقبل الترافيك. إلا فشلات، الـ Pod مكيتمسحش من الكلاستير، ولكن كيتحيد من الـ Service endpoints. هادشي مهم بزاف فاش كيكون التطبيق عاد كيطلع وكيتسنى يتكونيكطا مع لاباز دو دوني (DB) أو كيشارجي شي كاش كبير.

## مثال تطبيقي: تطبيق الشراء
نشوفو سيرفيس كيتكلف بـ purchase orders. غادي نديرو هاد الجوج probes فـ YAML:

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 15
```

**النتيجة:** إلا كان التطبيق باقي كيشارجي القواعد ديال الشراء من DB، `/health/ready` غاتعطي 503. السيرفيس غايحبس الترافيك لهاد الـ Pod باش المستخدمين ميشوفوش أخطاء. ملي يسالي، غاتعطي 200 ويرجع الترافيك. وإلا تبلوكا التطبيق من بعد، `/health/live` غاتفشل و Kubernetes غايدير ريستارت للـ Pod.

## غلط شائع: استعمال نفس الـ Endpoint
بزاف كيديرو نفس الـ `/health` ليهم بجوج. تخيل لاباز دو دوني طاحت مؤقتاً؛ هنا الـ Readiness خاصها تفشل (باش نحبسو الترافيك)، ولكن الـ Liveness خاصها تبقى خدامة. إلا فشلات حتى هي، Kubernetes غايبقى يدير ريستارت للكونتينر فـ loop، وهادشي ماديش يصلح DB وغادي غير يثقل الكلاستير.

## تمرين سريع
سيناريو: التطبيق ديالك كياخد 30 ثانية باش يشعل. درتي Liveness probe بـ `initialDelaySeconds: 5`. شنو غايوقع؟

**الجواب:** الـ Liveness probe غاتفشل قبل ما يشعل التطبيق، و Kubernetes غايبقى يدير ريستارت للكونتينر بلا قياس (crash loop).

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
