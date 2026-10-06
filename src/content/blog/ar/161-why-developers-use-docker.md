---
title: "علاش المطورين كيخدمو بـ Docker"
description: "شرح كيفاش Docker كيهنينا من مشكل 'خدام عندي في البي سي' عن طريق عزل البيئة ديال الخدمة في containers."
pubDate: 2026-10-13T08:48:00.000Z
translationKey: 161-why-developers-use-docker
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك صاوبتي application ديال procurement فين الموظف كيصيفط طلب شراء. كلشي خدام مزيان في البي سي ديالك، ولكن غير كتحطها في السيرفر ديال test، كيبداو المشاكل حيت السيرفر فيه Java 11 وأنت خدمتي بـ Java 17، أولا ناقصاه شي library. هاد التناقض هو علاش Docker ولا ضروري.

## كيفاش كيخدم: Image و Container
Docker كيخليك تجمع app ديالك مع كاع داكشي اللي محتاجة باش تخدم في واحد القالب سميتو **Image**. ملي كتشغل هاد الـ image، كتولي **Container**. الفرق بينو وبين الـ VM هو أن الـ container كيشارك الـ kernel ديال Linux اللي كاين في السيرفر، داكشي علاش كيكون خفيف وسريع. في Windows ولا Mac، Docker Desktop كيخدم واحد VM صغيرة ديال Linux باش يوفر هاد الـ kernel.

## تهني من صداع البيئة (Environment)
ملي كتكتب `Dockerfile` ، كتضمن أن أي مطور معاك في الفريق أو أي سيرفر غيخدم بنفس النسخ ديال البرامج. مثلا، إلا كانت app محتاجة PostgreSQL، ما غاديش تقول للمطور الجديد 'انستالي هاد النسخة'، بل كتعطيه configuration اللي كطلع ليه داكشي واجد.

## مثال تطبيقي: App ديال procurement
نشوفو مثال فين عندنا app Java مرتبطة بـ database في ملف `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    ports:
      - "5532:5432"
  app:
    build: .
    depends_on:
      - db
```
هنا، باش تدخل لـ database من البي سي ديالك كتخدم بـ port `5532` ، ولكن الـ app لداخل ديال Docker كتوصل لـ database عن طريق السمية `db` والـ port `5432`.

## غلط شائع: مشكل localhost
بزاف ديال الناس كيغلطو وكيحاولو يتصلو بـ `localhost:5432` من وسط الـ container ديال app باش يوصلو لـ db. في Docker، `localhost` كتعني الـ container راسو، ماشي السيرفر ولا container آخر.

**التصحيح:** خاصك تستعمل السمية ديال service اللي درتي في Compose (مثلا: `jdbc:postgresql://db:5432/procurement`).

## تمرين تطبيقي
إلا بغيتي تدخل لـ container خدام دابا باش تشوف شي log file، شنو هي command اللي خاصك تخدم بها؟

**الجواب:** `docker exec -it <container_id> sh` (أو `bash`) ، حيت `-it` هي اللي كتخليك تواصل مع الـ terminal ديال الـ container.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
