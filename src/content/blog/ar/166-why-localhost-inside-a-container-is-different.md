---
title: "علاش localhost وسط container كتكون مختلفة"
description: "فهم الفرق بين الشبكة ديال الماكينة ديالك والشبكة ديال Docker باش تحل مشاكل الاتصال."
pubDate: 2026-10-13T13:48:00.000Z
translationKey: 166-why-localhost-inside-a-container-is-different
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك تطبيق ديال المشتريات (procurement app) فين الـ backend خاصو يتصل بقاعدة بيانات PostgreSQL. خدمتي الـ database فـ container والـ backend خدمتو مباشرة فـ الماكينة (host). درتي `localhost:5432` فـ الإعدادات، ولكن التطبيق مابغاش يتصل. هادشي كيوقع حيت `localhost` ماشي عنوان عام، بل هو interface ديال loopback خاصة بـ network namespace ديال العملية اللي خدامة.

## مفهوم الـ Network Namespace
فـ Docker، كل container كيخدم فـ network namespace معزول ديالو. ملي شي عملية وسط container كتعيط لـ `localhost` أو `127.0.0.1` راها كتهضر مع راسها، ماشي مع الماكينة (host) وماشي مع containers خرين. الـ container كيسحاب ليه هو الوحيد اللي خدام فـ ديك الشبكة الافتراضية. هاد العزل هو اللي كيخليك تخدم بزاف ديال containers كلهم خدامين فـ port 80 بلا ما يوقع تضارب.

## الفرق بين Host و Container
باش تخلي الماكينة ديالك تهضر مع الـ container، كنستعملو port mapping. مثلاً `-p 5332:5432` كتقول لـ Docker: "أي حاجة جات لـ الماكينة فـ port 5332، صيفطها لـ container فـ port 5432".

| المنظور | العنوان اللي خاصك تستعمل | الهدف |
| :--- | :--- | :--- |
| Host → Container | `localhost:5332` | الـ port اللي مـappé فـ الماكينة |
| Container → راسه | `localhost:5432` | الـ port الداخلي ديالو |
| Container → Host | `host.docker.internal` | الماكينة (host) |

## مثال تطبيقي: قاعدة بيانات المشتريات
شوف هاد المثال ديال `docker-compose.yml` لنظام مشتريات:

```yaml
services:
  db:
    image: postgres
    ports:
      - "5332:5432"
  api:
    build: .
    depends_on:
      - db
```

إلا حاول الـ container ديال `api` يتصل بـ `localhost:5432` غادي يفشل، حيت الـ database كاينة فـ container آخر. Docker Compose كيدير DNS داخلي، داكشي علاش الـ `api` خاصو يستعمل `db:5432` باش يوصل لـ database.

## غلط شائع: فخ الـ localhost
**الغلط:** تستعمل `localhost` فـ ملف `.env` اللي مشترك بين الخدمة فـ الماكينة والخدمة وسط Docker.
**التصحيح:** استعمل variables d'environnement لعنوان الـ DB. دير `localhost` ملي تكون خدام بلا Docker، ودير اسم الخدمة (مثلاً `db`) ملي تكون وسط Docker.

## تمرين تطبيقي
إلا كان عندك container مـappé فيه port 8080 ديال الماكينة مع port 80 ديال الـ container، ودرتي `curl localhost:80` وسط الـ shell ديال الـ container، واش غادي تخدم؟

**الجواب:** إيه، حيت وسط الـ container، الخدمة فعلاً خدامة فـ port 80.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
