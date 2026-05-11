---
title: "الفرق بين Continuous Integration و Continuous Delivery و Continuous Deployment"
description: "شرح مبسط للفرق بين CI و CD باش تعرف كيفاش تـautomati-er الخدمة ديالك وتخرج الـsoftware بلا مشاكل."
pubDate: 2026-10-16T15:48:00.000Z
translationKey: 240-continuous-integration-vs-continuous-delivery-vs-continuous-deployment
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل معايا واحد الفريق فيه 5 ديال لي ديفلوبور خدامين على تطبيق ديال الشراء (procurement app). واحد خدام على الفورم ديال الطلب، واحد على لـapprobation ديال الماناجير، وواحد على الشاشة ديال الشاري. إلا بقاو كل واحد خدام بوحدو وجمعو الكود حتى لآخر الشهر، غادي يلقاو راسهم فـ 'merge hell' يعني صراعات كبيرة فـالكود وبزاف ديال لي bug.

## Continuous Integration (CI)
الـ CI هي فاش كاع لي ديفلوبور كيجمعو الكود ديالهم فـبلاصة وحدة (mainline) بزاف دالمرات فـالنهار. الهدف هو نلقاو المشاكل بكري. غير كيدير الديفلوبور 'push' لـ Git، واحد السيرفور كيخدم بوحدو كيدير build وكيطلق tests. إلا كان شي غلط، الفريق كيعرف ديك الساعة.

## Continuous Delivery
هنا كنزيدو خطوة من بعد الـ CI. الـ Continuous Delivery كتخلي الكود ديما واجد باش يطلع لـ production. واخا الـ build و tests كيكونوا automatic، ولكن باش الكود يوصل لـ production خاص شي حد يبرك على Bouton (manual trigger). هاد الطريقة مزيانة للشركات لي بغاو يتحكمو فـالوقت ديال launch.

## Continuous Deployment (CD)
هنا مابقاش كاين داك البوطون ديال بنادم. أي حاجة دازت من الـ pipeline ونجحات فـ tests كاملين، كتمشي نيشان لـ production بوحدها. ماكاين حتى شي تدخل بشري بين الـ commit والـ live.

## مثال تطبيقي: تطبيق الشراء
نفترضو بغينا نزيدو ميزة: 'إيميل أوتوماتيكي للشاري'.

| المرحلة | شنو كيوقع | النتيجة |
| :--- | :--- | :--- |
| **CI** | Push code → Jenkins tests | Build ناجح ولا لا |
| **Delivery** | الكود واجد → ضغطة زر | واجد لـ Prod |
| **Deployment** | Pipeline داز → Mise à jour auto | خدام عند المستخدم |

## غلط شائع: خلط الـ CD مع Orchestration
بزاف كيصحاب ليهم بلي Kubernetes هو أداة CI/CD. راه Kubernetes غير orchestrator كيسير الـ containers، ماشي هو لي كيقرر إمتى يـbuild الكود. خاصك أداة CI (بحال GitHub Actions) باش تصاوب Docker image، وعاد كتقول لـ Kubernetes يـdeploy-يها.

## تمرين صغير
**الحالة:** واحد الشركة بغات أي كود داز من tests يطلع لـ production ديك الساعة بلا ما يسنى موافقة ديال حتى حد. شنو خاصهم يستعملو؟

**الجواب:** Continuous Deployment.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
