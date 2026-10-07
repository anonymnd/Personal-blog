---
title: "كيفاش تعرف علاش Kubernetes كيدير Restart و كيفاش كيسير Traffic"
description: "شرح عميق على الفرق بين kubelet و controller، وكيفاش تخدم بـ probes باش تحمي الـ Pod ديالك من الـ restart loops."
pubDate: 2026-10-08T23:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
seriesOrder: 56
locale: ar
tags: ["deployment-devops","learning-series"]
draft: false
---

## الفرق بين Kubelet و Controller فاش كيوقع مشكل

Kubelet node agent ماشي control-plane controller. كتعاود container حسب restartPolicy ملي process كتخرج ولا probes كتوصل failure thresholds؛ Always كتغطي حتى successful exit. Container restart غالبا كتحتافظ بنفس Pod identity.

فـ Deployment، ReplicaSet كتخلق replacement Pods بعد deletion ولا node loss معروفة وscheduler كتختار placement مناسبة. Detection وeviction كيحتاجو الوقت. Replacement كتجيب UID جديدة وIP تقدر تختلف؛ StatefulSet تقدر تعاود نفس name ثابتة. Container restart وPod replacement وstate recovery ماشي نفس الحاجة.
## أنواع الـ Probes: Startup, Readiness, و Liveness

الـ probes هما اللي كيخليو Kubernetes يداوي راسو (self-healing)، ولكن إلا غلطتي فيهم تقدر تدخل الـ Pod فـ "دوامة" ديال الـ restarts اللي ما كتساليش.

1. **Startup Probe**: هادي كتحبس الـ liveness و readiness حتى كيتأكد Kubernetes بلي الـ container ديمارا مزيان. مهمة بزاف للبرامج اللي كتاخد وقت طويل باش تطلع (بحال اللي كيشارجي موديلات ML كبار).
2. **Readiness Probe**: هادي كتقول لـ Kubernetes واش هاد الـ Pod واجد باش يستقبل traffic من الـ Service. إلا فشلت، الـ Pod كيتحيد من الـ Endpoints. الـ container كيبقا خدام، ولكن حتى شي request ما كيمشي ليه.
3. **Liveness Probe**: هادي كتشوف واش الـ container باقي حي ولا تبلوكا (deadlock). إلا فشلت، الـ kubelet كيقتل الـ container وكيدير ليه restart.

## سيناريو: Pod ديال معالجة الميديا (Media Processor)

تخيل عندنا Pod كياخد 60 ثانية باش يشارجي الموديلات فـ memory، ومرة مرة كيقطع ليه الاتصال مع storage bucket خارجي.

### الغلط اللي كيدير Loop ديال Restart
إلا درنا غير liveness probe كتشوف واش الـ storage bucket خدام، غنوقعو فهاد المشكل:
- الـ Pod كيديماري.
- الـ liveness probe كتلقى الـ bucket مقطوع $ightarrow$ كتفشل.
- الـ kubelet كيقتل الـ container.
- الـ Pod كيعاود يديماري، كيضيع 60 ثانية أخرى باش يشارجي الموديلات، وعاوتاني كيتقتل حيت الـ bucket باقي مقطوع.

### الطريقة الصحيحة (عزل الـ Traffic)
الحل هو نفرقو بين مرحلة الديماراج ومرحلة التبعيات (dependencies).

**مثال ديال Configuration (Illustrative):**
```yaml
# جزء من spec ديال Pod لمعالجة الميديا
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10 # كيعطيه حتى لـ 300 ثانية باش يطّلع
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  periodSeconds: 20
```

**تحليل النتيجة:**
- **وقت الديماراج**: الـ `startupProbe` هي اللي خدامة. الـ Liveness و Readiness كيكونوا محبوسين. الـ Pod ما غاديش يتقتل وخا ياخد 2 دقايق باش يشارجي الموديلات.
- **فاش كيقطع الـ Storage**: الـ endpoint ديال `/health/ready` كيرجع error. الـ `readinessProbe` كتفشل، و Kubernetes كيحيد الـ Pod من الـ Service. الـ Pod كيبقا خدام، وهكا كيقدر يرجع الاتصال بلا ما يضيع الوقت يعاود يشارجي الموديلات من الديسك.
- **إلا تبلوكا الـ Process**: إلا الـ Java process تبلوكا كامل، الـ `/health/live` ما غتبقاش تجاوب. الـ `livenessProbe` كتفشل، والـ kubelet كيدير restart للـ container باش يفك الـ deadlock.

## حدود الفشل والـ Rollouts

Rollout settings كتحد planned unavailability، ما كتمنعش كل outage ديال cluster failures ولا bad probes ولا shared dependencies. progressDeadlineSeconds كتقدر تعلن stall ولكن ما كتديرش rollback بوحدها. حدد alerts وrecovery action.

Probe fields خاصها تحت container فـ spec.containers ماشي root ديال Pod spec. Readiness failure كتبدل endpoints بعد threshold وpropagation؛ ما كتضمنش cancellation فورية ديال connections الموجودة وما كتوقفش background worker كتستهلك queue. Media worker خاصها pause/admission policy ديال dependency outage.
## تمرين

**السيناريو**: عندك Pod كيوقع ليه crash كل 10 دقايق حيت فيه memory leak. درتي liveness probe كتعس على الـ memory، وفاش كتوصل لـ 80% كيدير restart للـ Pod.

1. واش هاد الطريقة صحيحة باش تداوي المشكل (self-healing)؟
2. شنو كيوقع للـ traffic فاش كيدير restart؟
3. شنو الفرق بين هادشي وبين إلا فشلت readiness probe؟

**الجواب**:
1. لا. الـ liveness probes خاصهم يلقاو مشاكل اللي ما عندهاش حل من غير restart (بحال deadlock)، ماشي يسيرو memory leak. هادشي غير "فاصمة" لمشكل فـ code، ماشي self-healing حقيقي. الحل هو تصلح الـ leak ولا تزيد الـ memory limits.
2. الـ traffic كيتقطع ديك الساعة حيت الـ container كيتقتل، والـ Pod كيولي unavailable حتى كيدوز الـ readiness check ديال الـ container الجديد.
3. إلا فشلت readiness probe، الـ traffic كيتحبس ولكن الـ process كيبقا خدام، وهكا تقدر تدخل لـ Pod بـ `exec` باش تشوف فين كاين الـ leak. أما liveness failure كيمسح كاع الأدلة حيت كيدير restart للـ process.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
