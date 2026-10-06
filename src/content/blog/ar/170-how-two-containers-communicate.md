---
title: "كيفاش كيتواصلو جوج ديال Containers"
description: "دليل للمبتدئين باش يفهمو كيفاش كيهضرو الـ containers مع بعضياتهم فـ Docker."
pubDate: 2026-10-13T17:48:00.000Z
translationKey: 170-how-two-containers-communicate
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك application ديال الشرا (procurement) فيها backend بـ Java و database ديال PostgreSQL. ملي كتشغلهم بجوج، الـ backend كيحاول يتصل بـ `localhost:5432` ولكن مابغاش يخدم. هادشي كيوقع حيت كل container عندو network namespace معزول؛ يعني `localhost` وسط الـ backend كتعني داك الـ container راسو، ماشي الـ database ولا الـ PC ديالك.

## الدور ديال Docker Networks
باش الـ containers يهضرو مع بعضياتهم، خاصهم يكونو فـ نفس الشبكة (network). Docker Compose كيدير هادشي أوتوماتيكياً وكيكريي network وحدة لجميع الـ services اللي كاينين فـ `docker-compose.yml`. هاد الشبكة فيها DNS داخلي كيخلي الـ containers يلقاو بعضياتهم غير بسميت الـ service بلا ما نحتاجو IPs اللي كيتبدلو.

## كيفاش كيخدم Service Discovery
ملي الـ backend كيصيفط request لـ `db:5432` ، الـ DNS ديال Docker كيحول كلمة `db` لـ IP privée ديال الـ container ديال database. خاصك تفرق بين الـ internal port (ديال التواصل بين containers) والـ published port (ديال التواصل من الـ PC لـ container).

## مثال تطبيقي: Procurement App
شوف هاد الطرف ديال `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres
    ports:
      - "5432:5432"
  backend:
    image: procurement-api
    environment:
      - DB_URL=jdbc:postgresql://db:5432/orders
```

هنا الـ `backend` كيتصل بـ database باستعمال `db:5432`. كون درتي `localhost:5432` فـ `DB_URL` ، الكونيكسيون غادي ترفض حيت الـ backend غيقلب على PostgreSQL وسط راسو.

## غلط شائع: التخلاط فـ الـ Ports
بزاف كيصحابلهم بلي الـ port mapping (مثلاً `8080:80`) ضروري باش الـ containers يهضرو مع بعضياتهم. فالحقيقة، الـ backend كيخدم بـ internal port `5432` وخا ماتكونش داير ليه mapping مع الـ PC. هاديك `5432:5432` كتحتاجها غير يلا بغيتي تدخل لـ database من شي برنامج فـ الـ PC ديالك (بحال pgAdmin).

## تمرين تطبيقي
يلا كانو عندك جوج services سميتهم `web` و `cache` فـ ملف Compose واحد، و `cache` خدام فـ port 6379، شنو هي الـ URL اللي خاص `web` يستعمل باش يتصل بـ cache؟

**الجواب:** `cache:6379`

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
