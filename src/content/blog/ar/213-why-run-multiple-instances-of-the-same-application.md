---
title: "كيفاش تـscaler الـ Application وتوزع الـ Traffic بـ Load Balancer"
description: "تعلم كيفاش تزيد عدد الـ instances ديال service ديال rendering وتخرج الـ state لبرة وتختار بين L4 و L7 routing."
pubDate: 2026-10-08T13:48:00.000Z
translationKey: 213-why-run-multiple-instances-of-the-same-application
seriesOrder: 46
locale: ar
tags: ["system-design","learning-series"]
draft: false
---

## المشكل ديال الـ Vertical Scaling

ملي الـ instance الواحدة ديال service كتوصل للحد ديالها فـ CPU ولا RAM، الحل السهل هو تزيد resources (vertical scaling). ولكن هادشي عندو سقف ومكيهنيناش من مشكل "single point of failure". الحل هو الـ Horizontal scaling—يعني تخدم بزاف ديال الـ instances متشابهين باش تقسم الخدمة.

ولكن ملي كتولي عندك بزاف ديال الـ instances، كيطلع مشكل **الـ State**. تخيل user طلع document لـ Instance A، ومن بعد طلب الـ status ديالو من Instance B. الـ Instance B ماغادي تعرف والو على هاد الـ job إلا كانت الـ state مخبية غير فـ memory ولا disk ديال Instance A. باش تـscaler، خاص الـ application تكون stateless. يعني أي حاجة durable (sessions, job status, files) خاصها تخرج لـ shared store خارجي، بحال database ولا distributed cache.

## الفرق بين L4 و L7 Load Balancing

باش نوزعو الـ traffic على هاد الـ instances، كنخدمو بـ Load Balancer (LB). الاختيار بين Layer 4 (Transport) و Layer 7 (Application) كيعتمد على شحال بغينا الـ LB "يفهم" من الـ traffic.

### Load Balancing L4
الـ L4 كيخدم فـ niveau ديال TCP/UDP. كيشوف غير الـ IP address والـ port، وما كيدخلش فـ شنو كاين وسط الـ packet.
- **كيفاش كيخدم**: غير كيصيفط الـ TCP packets للـ backend instances.
- **المميزات**: سريع بزاف، وما كيستهلكش CPU بزاف حيت ما كيديرش decryption لـ SSL/TLS ولا كيحلل الـ HTTP headers.
- **العيوب**: ما عارفش شنو كاين وسط الـ request. ما يقدرش يـrouter على حساب الـ URL path ولا cookie.

### Load Balancing L7
الـ L7 كيخدم فـ niveau الـ Application (HTTP/HTTPS). كيقطع الـ connection، كيقرا الـ request، وعاد كيقرر فين يصيفطها.
- **كيفاش كيخدم**: يقدر يشوف الـ HTTP headers، الـ cookies، والـ URL path.
- **المميزات**: routing ذكي. مثلا، يقدر يصيفط requests ديال `/status` لـ pool ديال instances خفاف، و requests ديال `/render` لـ pool فيه CPU قوي.
- **العيوب**: ثقيل شوية على L4 وكيستهلك CPU كتر حيت خاصو يـparser الـ data ديال الـ application.

## خوارزميات التوزيع: Round Robin vs Least Connections

Round robin كتقسم routing selections، ما كتساويش CPU cost. L4 غالبا كتوازن connections ولا flows؛ بزاف HTTP requests فـ persistent connection يقدرو يبقاو فنفس backend. L7 تقدر تختار لكل request حسب implementation.

Least connections كتستعمل count كمؤشر، ماشي قياس ديال load الحقيقية. Connection تقدر تحمل HTTP/2 streams بزاف ولا render طويلة ولا idle keep-alive. قارن traffic وconcurrency وqueue depth قبل الاختيار. Weighted routing وbounded concurrency يقدرو يحبسوا work أكثر من قدرة render process.
## مثال تطبيقي: Document Rendering Service

تخيل عندنا service فيها جوج أنواع ديال الـ traffic:
1. `GET /status/{id}` (سريع، CPU قليل)
2. `POST /render` (ثقيل، CPU عالي)

### خطة الـ Architecture
- **External State**: نخدمو بـ PostgreSQL shared للـ metadata و S3-compatible store للـ documents. هكا أي instance تقدر تجاوب على أي request.
- **اختيار الـ LB**: نخدمو بـ L7 Load Balancer باش نديرو **Path-Based Routing**.
- **منطق التوزيع (Routing Logic)**:
    - Path `/status` → يصيفط لـ "Light Pool" (instances صغار) باستعمال **Round Robin** (حيت الـ requests متشابهين).
    - Path `/render` → يصيفط لـ "Heavy Pool" (instances CPU-optimized) باستعمال **Least Connections** (حيت وقت الـ render كيختلف).
- **Health Checks**: الـ LB كيبقى يصيفط request لـ `/health`. إلا رجعات 500 error ولا وقع timeout، الـ LB كيحيد ديك الـ instance من الخدمة حتى تولي healthy.

### قياس السعة (Capacity Measurement)
باش نعرفو فوقاش نزيدو instances، كنراقبو **Concurrent Requests per Instance**. إلا وصل المعدل فـ "Heavy Pool" لـ 80% من الـ max ديال الـ renders اللي تقدر تهز الـ instance، كنـtrigger-يو زيادة instance جديدة.

## تمرين

Memory pressure مختلفة مع counts متقاربين evidence باش تشوف request cost وconnection reuse وleaks وconcurrency، ماشي proof أن routing algorithm هي السبب. Profile memory ديال renders وحدد jobs المتزامنين. دير queue ولا فصل heavy endpoints إلا measurements كتبرر، وجرب routing مناسبة.

Shared state كتسهل stateless API هنا، ولكن stateful services حتى هما يقدرو يتوسعو بـ partitioning ولا replication. Distributed cache ماشي دائما durable storage. Health checks وscale-out كيحتاجو الوقت؛ جرب draining وretries وduplicate-work protection وcapacity وقت failure. Trigger ديال80% سياسة خاصها test، ماشي threshold عام.
