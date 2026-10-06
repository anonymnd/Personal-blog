---
title: "الفرق بين Docker Container و Virtual Machine"
description: "مقارنة تقنية كتشرح علاش الـ containers كيشاركو الـ kernel ديال host بينما الـ VMs كيديرو محاكاة ديال hardware كامل."
pubDate: 2026-10-13T21:48:00.000Z
translationKey: 174-docker-container-vs-virtual-machine
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك باغي تلونصي application ديال procurement (المشتريات) فين كاين portal ديال requester، و dashboard ديال manager، و system ديال buyer. كل وحدة فيهم محتاجة version مختلفة ديال Java و Python. إلا خدمتي بـ Virtual Machines (VMs)، السيرفور ديالك غادي يتقال بزاف حيت غادي تضطر تخدم 3 ديال أنظمة تشغيل (OS) كاملة. هنا فين كيبان الفرق الكبير بين الـ containers و الـ VMs.

## الفرق في البنية (Architecture)
الـ Virtual Machine هي عبارة عن محاكاة كاملة للـ hardware. كيكون فيها نسخة كاملة من نظام التشغيل (Guest OS)، و نسخة وهمية من الـ hardware، و التطبيق. الـ Hypervisor هو اللي كيسير هاد الـ VMs، وهادشي كيخلي كل VM تاكل بزاف ديال RAM و CPU غير باش يبقى الـ OS خدام.

أما Docker container، فهو عبارة عن abstraction في الطبقة ديال التطبيق. بلاصة ما يهز OS كامل، كيشارك الـ Linux kernel ديال الماكينة اللي خدام فيها (host). كيهز غير الكود ديال التطبيق و داكشي اللي محتاج باش يخدم (dependencies). هادشي كيخلي الـ containers خفاف بزاف و كيشعلو في ثواني.

## كيفاش كيتعاملو مع الموارد
حيت الـ VMs عندهم kernel ديالهم بوحدهم، كيكونوا معزولين تماماً، وهذا مزيان للأمان ولكن كيستهلك بزاف. الـ containers كيخدمو بـ Linux namespaces و cgroups باش يعزلو العمليات (processes) ولكن كيبقاو يهضرو مع نفس الـ kernel.

| الميزة | Virtual Machine | Docker Container |
| :--- | :--- | :--- |
| نظام التشغيل | OS كامل (Guest) | كيشارك Kernel ديال Host |
| وقت التشغيل | دقائق | ثواني |
| الحجم | Gigabytes | Megabytes |
| العزل | على مستوى Hardware | على مستوى Process |

## مثال تطبيقي: App ديال المشتريات
إلا بغينا نلونصيو الـ app ديالنا بـ Docker، كنصاوبو image (لي هي template) لكل service. وملي كنديرو `docker run` كنصاوبو container (لي هو instance خدامة).

```bash
# كنلونصيو service requester في port 5332 ديال host و 5432 ديال container
docker run -p 5332:5432 procurement-requester:latest
```
النتيجة: الـ application كتشعل دغيا. الـ OS ديال host كيسير الـ RAM بطريقة ذكية حيت ما محتاجش يشعل kernel جديد لكل service.

## غلط شائع: مشكل localhost
بزاف ديال الناس كيغلطو و كيحاولو يتصلو بـ container آخر باستعمال `localhost`. في الـ VM، `localhost` هي الـ VM براسها. ولكن في Docker، `localhost` كتعني الـ network namespace ديال داك الـ container بوحدو. باش الـ Manager service يهضر مع الـ Requester service، خاصك تستعمل السمية ديال service اللي درتي في Docker Compose، ماشي `localhost`.

## تمرين تطبيقي
سؤال: إلا كنتي محتاج تخدم application اللي كطلب kernel ديال OS مختلف تماماً (مثلاً أداة ديال Windows kernel على سيرفور Linux)، واش تستعمل Docker container ولا VM؟

الجواب: خاصك تستعمل Virtual Machine، حيت الـ containers كيشاركو الـ kernel ديال الـ host و ما يمكنش يخدمو بـ kernel مختلف عليه.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
