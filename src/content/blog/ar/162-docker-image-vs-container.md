---
title: "شنو الفرق بين Docker Image و Container؟"
description: "فهم الفرق الأساسي بين Docker Image اللي هي مجرد قالب و Container اللي هو النسخة اللي خدامة."
pubDate: 2026-10-13T09:48:00.000Z
translationKey: 162-docker-image-vs-container
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا عندك وصفة ديال حلوة. الوصفة كتقول ليك بالضبط شنو هما المقادير وشنو دير، ولكن مايمكنش تاكل الوصفة براسها. باش تاكل الحلوة، خاصك تطبق ديك الوصفة باش تصاوب حلوة حقيقية. فـ Docker، الوصفة هي الـ Image، والحلوة هي الـ Container.

## الـ Image (القالب)
الـ Image هي عبارة عن Template مايمكنش تبدلو (read-only). فيها كاع داكشي اللي كتحتاج l'application باش تخدم: الكود، المكتبات (libraries)، والبيئة ديال التشغيل. الـ Images كيتصاوبو على شكل طبقات (layers)؛ إلا بدلتي سطر واحد فـ الكود وعاودتي الـ build، Docker كيبدل غير الطبقة اللي تأثرات. حيت الـ Image ماكتغيرش، كتضمن لينا أن نفس البيئة غتكون فـ التطوير (dev) وفـ الإنتاج (prod).

## الـ Container (النسخة الشغالة)
الـ Container هو نسخة خدامة من الـ Image. ملي كدير `docker run` ، Docker كيزيد واحد الطبقة رقيقة فوق الـ Image كتمكنو يكتب (read-write). هادشي كيخلي l'application تكتب logs أو تصاوب ملفات مؤقتة بلا ما تقيس الـ Image الأصلية. الـ Image كتكون مخزنة فـ الديسك، ولكن الـ Container كيكون خدام فـ الـ RAM وكيستعمل الـ kernel ديال Linux اللي كاين فـ السيرفر، داكشي علاش هو خفيف بزاف مقارنة بـ VM.

## مثال تطبيقي: App ديال المشتريات
نفترضو عندنا app ديال المشتريات (procurement) فين الموظف كيدفع طلب شراء. غنصاوبو Image سميتها `procurement-app:v1`.

```bash
# كنصاوبو الـ Image
docker build -t procurement-app:v1 .

# كنطلّقو جوج ديال الـ Containers من نفس الـ Image
docker run -d --name requester-instance procurement-app:v1
docker run -d --name manager-instance procurement-app:v1
```
هنا، بجوج Containers كيستعملو نفس الـ Image، ولكن كل واحد خدام بوحدو. إلا طاح الـ `manager-instance` ، الـ `requester-instance` كيبقى خدام عادي حيت كل واحد نسخة مستقلة.

## غلط شائع: تخلاط فـ البيانات (State)
بزاف ديال الناس كيسحاب ليهم أن البيانات اللي تسجلات وسط الـ Container كتبقى تما واخا نمسحو. الحقيقة هي أن الطبقة ديال الـ Container مؤقتة (ephemeral)، وأي حاجة تكرات تما كتمشي ملي كيتمسح الـ Container. باش تحافظ على البيانات، خاصك تستعمل Volumes، حيت الـ Image مايمكنش تبدل وهي خدامة.

## تمرين سريع
إلا بدلتي الكود ديالك وعاودتي درتي build لـ Image، واش الـ Containers اللي خدامين دابا غيتحدثو بوحدهم؟

**الجواب:** لا. الـ Containers كيكونوا نسخ من الـ Image اللي كانت ملي بداو. خاصك تحبس الـ Containers القدام وتطلّق جداد بـ الـ Image الجديدة.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
