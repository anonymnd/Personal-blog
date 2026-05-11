---
title: "شنو هما Kubernetes Pods؟"
description: "دليل للمبتدئين باش يفهمو أصغر وحدة ديال النشر في Kubernetes وكيفاش كيسيرو الـ containers."
pubDate: 2026-10-17T01:48:00.000Z
translationKey: 250-what-are-kubernetes-pods
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك تطبيق خدام بـ containers، ولكن محتاج شي عملية مساعدة (helper process)—بحال شي حاجة كتجمع الـ logs أو proxy—باش يخدم مزيان. إلا نشرتيهم مفرقين، يقدر كل واحد يمشي لسيرفر مختلف، وهادشي كيخلي التواصل بيناتهم تقيل ومعقد. هنا فين كيجي الدور ديال Kubernetes Pods.

## الفكرة ديال الـ Pod
الـ Pod هو أصغر حاجة تقدر تنشرها في Kubernetes. بلاصت ما تلوح container واحد بوحدو، كتجمع واحد أو بزاف ديال الـ containers فـ Pod واحد. هاد الـ containers اللي فـ نفس الـ Pod كيشاركو نفس الـ IP address ونفس الـ ports، ويقدروا يشاركو حتى الـ storage. كيتعاملو بحال إلا راهم فـ ماشين وحدة، وكيهضرو بيناتهم بـ `localhost`.

## كيفاش كيخدم الـ Pod لداخل
Kubernetes ما كيسيرش الـ containers مباشرة، بل كيسير الـ Pods. كاين واحد الـ agent سميتو `kubelet` فـ كل node، هو اللي كيتأكد بلي الـ containers اللي مكتوبين فـ الـ Pod specification خدامين مزيان. إلا طاح شي container، الـ kubelet يقدر يعاود يشعلو على حساب الـ restart policy. ولكن خاصك تعرف بلي الـ Pods ephemeral (مؤقتين)؛ إلا تمسح الـ Pod، ما كيتمش إصلاحو ولكن كيجي Pod جديد فبلاصتو.

## مثال تطبيقي: تطبيق ديال المشتريات (Procurement)
تخيل تطبيق ديال المشتريات فيه container سميتو 'Request-UI' كيتكلف بالواجهة، و container آخر سميتو 'Log-Sidecar' كيصيفط الـ logs لسيرفر آخر. خاصهم يبقاو مجموعين باش يشاركو نفس ملفات الـ logs.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: procurement-pod
spec:
  containers:
  - name: request-ui
    image: procurement-ui:v1
  - name: log-sidecar
    image: fluentd:latest
```
النتيجة: بجوج الـ containers كيخدمو فـ نفس الـ node وبـ IP وحدة. الـ UI كيكتب الـ logs فـ volume، والـ sidecar كيقراهم ديك الساعة.

## غلط شائع: تجميع بزاف ديال الحوايج فـ Pod واحد
بزاف ديال الناس كيغلطو وكيجمعو خدمات ما عندهاش علاقة ببعضياتها (بحال database و frontend) فـ Pod واحد. هادشي كيخالف مبدأ الـ microservices. إلا كانت الـ database خاصها تكبر (scale) بوحدها بعيد على الـ UI، خاص كل وحدة تكون فـ Pod ديالها.

## تمرين صغير
إلا كان عندنا Pod فيه جوج containers وواحد منهم طاح، واش الـ Pod كياخد IP جديدة ملي كيعاود يشعل داك الـ container؟

**الجواب:** لا. الـ IP ديال الـ Pod كتبقى هي هي؛ غير الـ container اللي طاح هو اللي كيعاود يشعلو الـ kubelet.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
