---
title: "كيفاش تخدم Backend و Database بـ Docker Compose"
description: "تعلم كيفاش تخدم Backend و Database مجموعين باستعمال Docker Compose باش تربط بيناتهم بسهولة."
pubDate: 2026-10-13T20:48:00.000Z
translationKey: 173-how-to-run-backend-database-with-docker-compose
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل صاوبتي Backend بـ Java و Database ديال PostgreSQL. كلشي خدام مزيان فـ PC ديالك، ولكن ملي كتحاول تخدمهم فـ containers، الـ backend كيوقع ليه crash حيت مالقاش الـ database فـ 'localhost'. هادشي كيوقع حيت كل container عندو network namespace ديالو بوحدو؛ يعني 'localhost' وسط الـ backend كتعني غير داك الـ container راسو، ماشي الـ container ديال الـ database.

## مشروع واحد وشبكة مشتركة
Compose كتصف services والشبكات والتخزين فـ configuration وحدة. فالشبكة الافتراضية ديال المشروع، services كيتلقاو بالسمية. Backend كتستعمل db والـ port الداخلية 5432. Port mapping ديال host كتخص client من برا هاد الشبكة؛ ما كتحتاجهاش غير باش backend تهضر مع database.
## مثال Compose مع Spring Boot
نفترض عندك Dockerfile ديال backend خدامة وكتشعل التطبيق فـ port 8080. حدد POSTGRES_PASSWORD محليا. هادو environment variables ديال datasource فـ Spring Boot، ماشي DB_URL عشوائية خاصك تكتب ليها binding بوحدك:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d procurement"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: .
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/procurement
      SPRING_DATASOURCE_USERNAME: app
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    depends_on:
      db:
        condition: service_healthy

volumes:
  db_data:
```
## الاتصال والبيانات اللي كتبقى
Backend كتتصل بـ jdbc:postgresql://db:5432/procurement وبنفس credentials ديال app اللي كتنشئ database جديدة خاوية. Host كيفتح backend فـ localhost:8080. فهاد مثال PostgreSQL 15 كنركبو db_data فالمسار المبين. Compose down العادية كتبقي volume. إلا كانت فيها بيانات، حتى credentials القديمة كتبقى؛ تبديل initialization variables ما كيبدلهاش.
## الترتيب ماشي ضمان ديال disponibilité
Healthcheck وservice_healthy كيتسناو إشارة الصحة ديال database قبل startup الأولى ديال backend. Depends_on العادية على شكل list غير كترتب التشغيل. Readiness ما كتضمنش بلي database غتبقى خدامة ديما ولا بلي كل migration ديال التطبيق سالات. Backend باقي خاصها retry مناسب ديال الاتصال والتعامل مع الأخطاء فوقت التشغيل. بني وشعل المشروع الموجد بـ docker compose up --build.
## تمرين تطبيقي
بغيتي تشوف logs ديال database، ومن بعد تفتح shell. شنو تستعمل لكل حاجة؟

**الجواب:** `docker compose logs -f db` كتتبع logs ديال service. `docker compose exec db sh` كتفتح shell داخل container اللي خدامة. ماشي نفس الأداة، وما خاصكش تدخل container غير باش تقرا standard output ديالها.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
