---
title: "فين كيجي Kubernetes فـ Architecture ديال Deployment"
description: "الفرق بين packaging ديال containers و orchestration، وكيفاش نخدمو stateless map-tile API بـ Services."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
seriesOrder: 55
locale: ar
tags: ["deployment-devops","learning-series"]
draft: false
---

## Orchestration مقابل Packaging

بزاف ديال الناس كيخلطو بين Docker و Kubernetes. Docker هو أداة ديال packaging؛ كيصاوب لينا image ما كتبدلش (immutable) فيها الكود، runtime، و كاع داكشي لي محتاج التطبيق باش يخدم. أما Kubernetes، فهو orchestrator. هو ماشي أداة باش تبني الكود (build) أو دير tests — هادشي خدمة ديال CI pipeline. Kubernetes كياخد ديك الـ image لي صاوب pipeline و كيسير كيفاش غتخدم و تتوزع على مجموعة ديال السيرفورات (cluster).

هاد العملية كتبدا ملي الـ CI/CD pipeline كيصيفط configuration declarative (غالباً كتكون YAML) لـ Kubernetes API. الـ pipeline كيقول لـ Kubernetes: "بغيت هاد النسخة ديال الـ image تكون خدامة بهاد الـ resource limits". Kubernetes من بعد كيبقى يراقب باش يخلي الحالة ديال الـ cluster هي نيت لي طلبنا (desired state).

## سيناريو: Stateless Map-Tile API

Map-tile API كتستهدف3 replicas. Deployment كتسير rollout عبر ReplicaSets؛ controller ديالها كتخلق Pods، scheduler كتختار nodes المناسبة وkubelets كتشغل containers. Desired replicas هدف، ماشي ضمان3 available instances وقت failure ولا نقص capacity.

ClusterIP Service العادية كتقدم discovery ثابتة وكتوجه لـ ready endpoints اللي selector كتوافقهم. Pods ملي يتبدلو يقدرو يتبدلو IPs؛ clients ما يعتمدوش عليهم. Service داخلية بالافتراضي، ما كتفتحش internet بوحدها. Readiness وrollout خاصهم configuration. Tiles read-only متطابقين baked فكل image يقدرو يبقاو local؛ mutable ولا nonreplicated local state خاصها storage design.
## تطبيق عملي: Configuration Déclarative

هذا هو الـ YAML لي الـ pipeline كيصيفطو لـ cluster باش يخدم الـ map-tile API.

```yaml
# illustrative-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: map-tile-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: map-tiles
  template:
    metadata:
      labels:
        app: map-tiles
    spec:
      containers:
      - name: tile-server
        image: registry.example.com/map-tile-api:v1.2.0
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: map-tile-service
spec:
  selector:
    app: map-tiles
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

### تحليل النتيجة
1. **Desired state:** replicas: 3 كتطلب3 replicas؛ availability كتعلق بـ scheduling وstartup وreadiness ناجحين.
2. **Decoupling**: الـ Service `map-tile-service` كيقلب على أي Pod عندو label سميتو `app: map-tiles`. إلا الـ Deployment بدل شي Pod حيت دار update، الـ Service كيحدث الـ list ديالو بوحدو بلا ما يحس client بلي الـ IP تبدلات.
3. **Traffic Flow**: Client → `map-tile-service` (Port 80) → Pod عشوائي (Port 8080).

## حالات الفشل و القيود

- **مشكل فـ Image Pull**: إلا الـ pipeline صيفط config فيها image tag ما كاينش فـ registry، الـ Pods غيوليو فـ حالة `ImagePullBackOff`. Kubernetes ما يقدرش يصلح image ما كايناش، كيقدر غير يعاود يحاول يـ pull-يها.
- **نقص فـ Resources**: إلا الـ cluster ما فيهش CPU/RAM كافية باش يهز 3 ديال الـ replicas، شي Pods غيبقاو فـ حالة `Pending`. الـ Deployment عارف بلي خاصو 3، ولكن scheduler ما لقى فين يحطهم.
- **State design:** local mutable state ما كتتشاركش بوحدها. Tiles read-only متطابقين فكل image يقدرو يتخدمو local؛ mutable tiles خاصهم synchronization ولا shared storage.

## تمرين

بدل spec.replicas لـ5 وimage reference لـ version مراجعة، بالأفضل digest. Deployment كتقرب replica target وrollout. Default RollingUpdate ما كتعنيش دائما Pod وحدة كل مرة ولا بالضبط3 ready replicas مضمونة. maxUnavailable وmaxSurge وreadiness وcapacity وconcurrent failures كيأثرو.

زيد application readiness probe وresource requests مناسبة قبل الاعتماد على traffic handover. راقب rollout status وready endpoints وerror rates. Failed rollout تقدر تبقى stalled بلا rollback أوتوماتيكي؛ خاص recovery procedure واضحة. YAML minimal structural example ماشي production manifest كاملة.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
