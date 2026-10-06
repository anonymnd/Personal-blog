---
title: "ربعة ديال المفاهيم ف Docker اللي خاصك ضروري تفهمهم"
description: "دليل عملي باش تفهم الـ images، containers، network و volumes بلا ما تدوخ في Docker."
pubDate: 2026-10-13T22:48:00.000Z
translationKey: 175-the-four-docker-concepts-you-actually-need-to-understand
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال الناس اللي يلاه بداو Docker كيغلطو وكيسحاب ليهم بحال Machine Virtuelle. كيضيعو الوقت وهوما كيقلبو كيفاش يدخلو لـ server ما كاينش، ولا كيتعجبو علاش الداتا ديال database كتمسح غير كيديرو restart. المشكل هو أنهم كيخلطو بين 'البلان' (blueprint) وبين 'البني' (instance).

## Images مقابل Containers
الـ Image هي بحال واحد القالب (template) ما يمكنش تبدلو. تخيلها بحال تصويرة جامدة فيها التطبيق ديالك وكلشي اللي محتاج باش يخدم. أما الـ Container فهو التطبيق ملي كيكون خدام فعلياً. تقدر تكون عندك Image وحدة ديال `postgres` ولكن تطلق منها 5 ديال الـ containers، كل واحد خدام بوحدو ولكن كاملين جاو من نفس القالب.

## الـ Kernel والـ Virtualization
الفرق بين Docker و VM هو أن Docker كيشارك الـ Linux kernel ديال الماكينة اللي خدام فيها، داكشي علاش هو خفيف بزاف. إلا كنتي خدام بـ Windows ولا Mac، Docker Desktop كيدير واحد VM صغيرة ديال Linux فـ الخلفية باش يوفر هاد الـ kernel.

## الـ Networking و Mapping ديال الـ Ports
كل container عندو réseau ديالو بوحدو. ملي كتشوف `-p 5332:5432` ، هادي كتعني أنك ربطتي port 5332 ديال PC ديالك مع port 5432 اللي كاين وسط الـ container.

واحد الحاجة مهمة: `localhost` وسط الـ container كتعني الـ container راسو، ماشي الـ PC ديالك. مثلاً فـ app ديال procurement، الـ `requester-service` ما يمكنش يوصل لـ `db-service` بـ `localhost`. خاصو يستعمل السمية ديال service اللي مكتوبة فـ Docker Compose.

```yaml
# طرف من docker-compose.yml للتوضيح
services:
  db-service:
    image: postgres
    ports:
      - "5332:5432"
  requester-service:
    build: .
    environment:
      - DB_URL=jdbc:postgresql://db-service:5432/procure
```

## الـ Volumes باش تبقى الداتا
الـ containers كيكونوا مؤقتين. إلا مسحتي container، كاع الداتا اللي وسطو كتمشي. هنا فين كيصلحو الـ Named Volumes، حيت كيربطو دوسي فـ PC ديالك مع دوسي وسط الـ container. رد بالك، الـ volumes ماشي backup؛ إلا درتي `docker compose down -v` الـ volumes كيتمسحو كاملين.

## كيفاش تدخل لـ Container خدام
باش تـ debug-ي شي حاجة، كنستعملو `docker exec -it <container_id> sh`. الـ `-i` و `-t` كيخليوك تفتح terminal وتكتب commands وسط الـ container كأنك داخل ليه.

**غلط شائع:** تحاول تتصل بـ database بـ `localhost:5432` من container آخر.
**التصحيح:** استعمل السمية ديال الـ service (مثلاً `db-service:5432`) باش تواصل بين الـ containers.

**تمرين:** عندك container خدام فـ port 8080 لداخل، وبغيتي تدخل ليه من browser ديالك بـ port 9000. شنو هو الـ flag اللي خاصك تزيد؟
**الجواب:** `-p 9000:8080`

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
