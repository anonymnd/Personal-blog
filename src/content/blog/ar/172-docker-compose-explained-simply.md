---
title: "شرح Docker Compose ببساطة"
description: "تعلم كيفاش تسير بزاف ديال containers باستعمال ملف YAML واحد باش تسهل الخدمة ديالك."
pubDate: 2026-10-13T19:48:00.000Z
translationKey: 172-docker-compose-explained-simply
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على application ديال الشراء (procurement). عندك backend بـ Java، و base de données PostgreSQL باش تخزن الطلبات، و Redis cache باش تسرع الخدمة. باش تخدم هادشي كامل بـ `docker run` خاصك تكتب بزاف ديال commands معطين و تعقد network. إلا نسيتي غير flag واحد، backend ما غاديش يلقى base de données و غادي يعطيك erreur.

## شنو هو Docker Compose؟
Docker Compose هو واحد الأداة اللي كتخليك تعرف و تخدم application فيها بزاف ديال containers. بلا ما تبقى تكتب commands طوال في terminal، كتستعمل ملف سميتو `docker-compose.yml`. هاد الملف هو بحال الخريطة اللي كتقول لـ Docker شنو هما images اللي يخدم و كيفاش يربط بيناتهم.

## كيفاش كيخدم هادشي؟
Compose كيكريي واحد network خاصة بالخدمات ديالك. وسط هاد network، containers ما كيخدموش بـ IP، ولكن كيخدمو بسمية service اللي درتي في YAML. مثلا، إلا سميتي base de données `db` ، backend غادي يتصل بيها عن طريق `jdbc:postgresql://db:5432/orders`. رد البال بلي containers كيهضرو بيناتهم بالـ port internal.

## مثال تطبيقي: App ديال الشراء
هاك مثال صغير ديال `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: pass
  backend:
    build: . 
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  db_data:
```

ملي كدير `docker compose up -d` كيخدمو بجوج. الـ volume اللي سميتو `db_data` كيخلي المعلومات ديالك ما يتمسحوش وخا تبدل الـ container. وإلا بغيتي تدخل لـ backend باش تشوف شنو واقع، كتخدم بـ `docker compose exec backend sh`.

## غلط شائع: الترتيب ماشي هو الاستعداد
بزاف كيصحابلهم بلي `depends_on` كتعني بلي base de données واجدة 100% باش تستقبل connections. في الحقيقة، `depends_on` كتحكم غير في ترتيب الديماراج ديال container. إلا كان backend سريع بزاف و Postgres تعطل، غادي يوقع crash. الحل هو تزيد logic ديال retry في الكود ديال Java.

## تمرين تطبيقي
إلا كان عندك service سميتو `cache` خدام بـ Redis في port 6379، وبغيتي توصل ليه من container آخر في نفس الملف، شنو هو hostname اللي خاصك تستعمل؟

**الجواب:** خاصك تستعمل `cache` كـ hostname.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
