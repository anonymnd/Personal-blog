---
title: "كيفاش تخدم وتصلح Application Stack بـ Docker Compose"
description: "تعلم كيفاش تنسق بين Recipe API و PostgreSQL، مع التركيز على الـ healthcheck والـ diagnostic tools."
pubDate: 2026-10-08T06:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
seriesOrder: 39
locale: ar
tags: ["docker","learning-series"]
draft: false
---

## تنسيق الـ Recipe API Stack

ملي كتكون خدام بـ backend ومعاه database، المشكل الكبير ماشي هو كيفاش تطلق الـ containers، ولكن كيفاش تضمن أن الـ application ما تطيحش حيت الـ database مزال ما واجداش. واخا `depends_on` كتحكم في الترتيب ديال الشعلة، ولكن ما كتعطيكش ضمانة أن السوفتوير اللي لداخل ديال الـ container واجد باش يستقبل connections.

## مثال تطبيقي (Worked Configuration)

فهاد السيناريو، غادي نخدمو بـ Recipe API و PostgreSQL. غادي نستعملو ملف `.env` خارجي باش ندوزو الـ credentials، باش ما نكتبوش secrets وسط الـ YAML.

**ملف .env (مثال)**
```env
DB_USER=recipe_admin
DB_PASSWORD=secure_password_123
DB_NAME=recipe_db
```

**docker-compose.yml**
```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
```

## الميكانيزم: الفرق بين Startup و Readiness

كون درنا غير `depends_on: [db]`، Docker غادي يشعل الـ container ديال PostgreSQL ومن بعدو مباشرة يشعل الـ API. ولكن PostgreSQL كياخد شي ثواني باش يـ initialize الـ data directory ديالو ويبدا يسمع (listen) للطلبات. الـ API غادي يحاول يتكونيكتا، غادي يفشل، وغالبا غادي يطفا بـ `ConnectionRefused`.

ملي زدنا `healthcheck` للـ service `db` استعملنا `pg_isready`—هادي tool مديورة خصيصاً باش تشوف واش PostgreSQL واجد بلا ما تحتاج دير authentication كاملة. دابا الـ `api` service كيستعمل `condition: service_healthy` ، يعني كيبقى يتسنى حتى يرجع الـ healthcheck ديال `db` بـ exit code ناجح (0).

## كيفاش تـ diagnose الـ Stack

وخا كاين الـ healthchecks، كيبقاو يوقعو مشاكل (مثلا credentials غلط). باش تعرف فين كاين المشكل، خاصك تخرج من وجهة نظر الـ host وتدخل لـ namespace ديال الـ container.

#### 1. تحليل الـ Logs
باش تعرف علاش الـ API ما بغاش يشعل، كنتبعو الـ logs:
`docker compose logs -f api`

إلا لقيتي `FATAL: password authentication failed for user "recipe_admin"` ، عرف بلي الـ environment variables اللي عطيتي للـ API ماشي هما اللي عطيتي للـ DB.

#### 2. الـ Inspection التفاعلي
ملي الـ logs ما كيكونوش كافيين، كنستعملو `docker exec -it`. هاد command كتحل terminal وسط الـ container اللي خدام دابا.

باش تأكد واش الـ database واصلة من جيهة الـ API:
`docker compose exec api ping db`

باش تيستي الـ connection يدوياً من وسط الـ DB container:
`docker compose exec db pg_isready -U recipe_admin -d recipe_db`

إلا رجعات `pg_isready` بلي الـ connections مقبولين وسط الـ DB container ولكن الـ API مزال كيـ fail، المشكل غالباً كيكون في الـ connection string (URL) أو الـ network bridge، ماشي في الـ database process.

## حالات الفشل والنتائج

*   **`start_period` غلط**: إلا كانت قصيرة بزاف والـ DB تقيل في الشعلة، الـ healthcheck يقدر يسالي الـ `retries` ديالو قبل ما توجد الـ DB، وهادشي كيخلي الـ API ما يشعلش كاع.
*   **Port غلط في الـ URL**: إلا استعملتي `localhost:5432` في `SPRING_DATASOURCE_URL` غادي يفشل. وسط الـ container network، `localhost` كيعني الـ API container راسو. خاصك تستعمل سمية الـ service `db:5432`.
*   **Zombie Containers**: إلا كانت الـ API كطيح وتعاود تشعل بزاف، `docker compose up` يقدر يبقى يعاودها. استعمل `docker compose stop` باش تحبس كلشي وتـ diagnose على خاطرك.

## تمرين

باش تجرب local TCP port بلا ما تفترض netstat ولا ss موجودين، خدم docker compose exec db pg_isready -h 127.0.0.1 -p 5432 -U recipe_admin -d recipe_db. Success كتقول 127.0.0.1:5432 accepting connections مع exit0. كتثبت readiness فهاد interface المحلية، ماشي authentication ديال API ولا network reachability. جرب datasource connection بوحدها بـ tool موجودة ولا diagnostic container فنفس network.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
