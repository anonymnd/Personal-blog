---
title: "Docker Ports, localhost و Service Discovery فـ موديل واحد"
description: "شرح مفصل على الفرق بين ports لي كنفتحو فـ host، و namespace ديال container، وكيفاش Compose DNS كيخدم باش يتواصلو services بيناتهم."
pubDate: 2026-10-08T04:48:00.000Z
translationKey: 164-what-does-port-mapping-mean
seriesOrder: 37
locale: ar
tags: ["docker","learning-series"]
draft: false
---

## كيفاش نفهمو الـ Networking فـ Docker

أكبر غلط كيوقعو فيه الناس فـ البداية هو مكيفرقوش بين فين السيرفيس كيكون خدام (listening) وكيفاش كنوصلو ليه. باش تفهم هادشي، خاصك تفرق بين الـ Host Network والـ Container Network Namespace.

كل container كيكون عندو namespace ديالو بوحدو. هادشي كيعني أن عندو interface réseau virtuelle و loopback address (`127.0.0.1`) ديالو. إلا كان شي برنامج وسط container خدام فـ `localhost:8080` ، راه خدام فـ loopback ديال داك container ماشي ديال الماكينة (host). يعني إلا جربتي تدخل لـ `localhost:8080` من browser فـ الماكينة ديالك، ما غاديش تخدم حيت loopback ديال host بوحدو وديال container بوحدو.

## Port Mapping: القنطرة لي كتربطهم

فـ Compose bridge العادي، 5332:5432 كتربط host port 5332 بـ container port 5432. Process خاصها فعلا تسمع فداك port وinterface مناسبة بحال 0.0.0.0. EXPOSE غير documentation، ما كتخلقش listener ولا publishing. إلا process مربوطة غير بـ loopback ديال container، publishing تقدر ما تخدمش.

فـ local development DB استعمل 127.0.0.1:5332:5432؛ بلا address تقدر تتنشر فـ كاع interfaces ديال host. Containers فنفس Compose network كيوصلو لـ db:5432 بلا DB port منشورة. هاد الشرح كيتعلق بالـ bridge العادية، ماشي host networking ولا shared namespace.
## Service Discovery والتواصل الداخلي

الـ port mapping مهم للمطور ولا للمستخدم لي برا، ولكن بالنسبة لـ containers لي فـ نفس الـ network، هادشي ما كيهمهمش.

ملي كنخدمو بـ Docker Compose، Docker كيصاوب bridge network. كل service فـ `docker-compose.yml` كيولي عندو DNS entry بسميتو. الـ containers كيهضرو مع بعضياتهم باستعمال هاد السميات و **الـ ports الداخلية**، بلا ما يدوزو من الـ network ديال host.

## مثال تطبيقي: Search API و Database

نتخيلو عندنا Search API (مخدومة بـ Java/Spring) خاصها تكونيكطا مع PostgreSQL database.

### Configuration (`docker-compose.yml` مثال توضيحي)
```yaml
services:
  db:
    image: postgres:15
    ports:
      - "127.0.0.1:5332:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}

  search-api:
    image: search-api:latest
    ports:
      - "8088:8080"
    environment:
      # ركز هنا: كنستعملو سمية السيرفيس 'db' والـ port الداخلي 5432
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/postgres
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}
    depends_on:
      - db
```

### تحليل كيفاش كيدوز الـ Traffic

1. **User → API:** المستخدم كيدخل لـ `http://localhost:8088`. الـ host كيصيفط request لـ container ديال `search-api` فـ port `8080`.
2. **API → Database:** الـ `search-api` محتاجة data. كتقلب على hostname سميتو `db` عن طريق DNS ديال Docker، كتعرف الـ IP الداخلي ديال container، وكتكونيكطا لـ port `5432`. ما كتستعملش `localhost:5332` حيت `localhost` وسط container ديال API كيعني API براسها ماشي الـ host.
3. **Developer → Database:** المطور كيستعمل tool (بحال pgAdmin) فـ الماكينة ديالو. كيكونيكطا لـ `localhost:5332`. Docker كيصيفط هادشي لـ container ديال `db` فـ port `5432`.

### حالات فين كيوقع مشكل (Failure Cases)
- **إلا درتي `localhost:5432` فـ config ديال API:** الـ API غادي تقلب على Postgres وسط container ديالها هي. وبما أن Postgres ما كاينش تما، غادي تعطيك connection refused.
- **إلا درتي `localhost:5332` فـ config ديال API:** الـ API غادي تقلب على شي حاجة خدامة فـ port 5332 وسط container ديالها. حتى هادي ما غاديش تخدم.
- **إلا حيدتي `ports` من السيرفيس `db`:** الـ API غتبقى تخدم عادي حيت راهم فـ نفس الـ network. ولكن المطور ما غاديش يقدر يكونيكطا بـ tool من الماكينة حيت ما بقاتش القنطرة (mapping).

## تمرين تطبيقي

**السيناريو:** عندك service سميتها `cache` خدامة فـ port `6379` و service سميتها `app` خدامة فـ port `80`. بغيتي `app` توصل لـ `cache` ، وبغيتي تقدر تخدم `redis-cli` من الماكينة ديالك باش تشوف شنو كاين فـ cache.

**الأسئلة:**
1. شنو خاص يكون الـ `ports` mapping ديال service `cache` فـ `docker-compose.yml` ؟
2. شنو هي connection string لي خاص `app` تستعمل باش توصل لـ `cache` ؟
3. إلا بدلتي mapping لـ `7000:6379` ، واش connection string ديال `app` غادي تبدل ؟

**الأجوبة:**
1. `6379:6379` (أو أي port آخر فـ host).
2. `cache:6379`.
3. لا. الـ `app` كتخدم بالـ network الداخلي؛ ما كيهمهاش الـ port لي مفتوح فـ host (`7000`).

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
