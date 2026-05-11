---
title: "شنو هو Docker Volume؟"
description: "تعلم كيفاش Docker volumes كيحلو مشكل ضياع البيانات ملي كنمسحو ولا كنحدثو الـ containers."
pubDate: 2026-10-13T14:48:00.000Z
translationKey: 167-what-is-a-docker-volume
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا عندك تطبيق ديال المشتريات (procurement app) فين الموظفين كيدفعو طلبات. الـ container ديال القاعدة ديال البيانات (database) هو لي كيهز هاد الطلبات كاملين. واحد النهار، بغيتي تـ-update النسخة ديال database، مسحتي الـ container القديم وطلقتي واحد جديد. صدمة! لقيتي كاع البيانات ديال الطلبات مشاو. هادشي كيوقع حيت الـ containers كيكونوا ephemeral، يعني أي حاجة تكتبات لداخل كتمسح ملي كيتمسح الـ container.

## كيفاش خدامة هاد القضية
الـ Docker volumes هما عبارة عن دوسيات (directories) كيكونوا فـ machine hôte ولكن Docker هو لي كيسيرهم. الفرق بيناتهم وبين الـ writable layer ديال container هو أن الـ volume كيبقى خدام وخا الـ container يتمسح. ملي كدير mount لـ volume، Docker كيربط واحد المسار لداخل ديال container مع بلاصة فـ machine hôte. هكذا، ملي كتبدل container بآخر، الجديد كيقدر يرجع يربط مع نفس الـ volume ويلقى بياناتو كيفما خلاهم.

## مثال تطبيقي
نشوفو تطبيق المشتريات لي خدام بـ PostgreSQL. باش نحافظو على البيانات، كنستعملو named volume. هاك مثال صغير من `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - procurement_data:/var/lib/postgresql/data

volumes:
  procurement_data:
```

فهاد المثال، أي حاجة تكتبات فـ `/var/lib/postgresql/data` لداخل ديال container، راها فالحقيقة كتمشي لـ `procurement_data` لي كاين فـ machine hôte. واخا دير `docker compose down` وتعاود `docker compose up` ، البيانات غيبقاو كاينين.

## غلط شائع: الـ Volume ماشي هو Backup
بزاف ديال الناس كيغلطو وكيصحاب ليهم بلي الـ volumes هما backup. وخا الـ volumes كيبقاو ملي كنبدلو الـ containers، راه فالاخير غير ملفات فـ disque dur. إلا خسر الـ disque ولا شي واحد دار `docker compose down -v` (هاد `-v` كتمسح الـ volumes)، البيانات كيمشيو للأبد. خاصك ديما دير backup خارجي.

## تمرين صغير
إلا كان عندك volume سميتو `app_logs` مربوط مع `/app/logs` ومسحتي الـ container بـ `docker rm -f my_container` ، شنو كيوقع لهادوك الـ logs؟

**الجواب:** الـ logs كيبقاو محفوظين فـ volume `app_logs` فـ machine hôte، وأي container جديد ربطتيه مع نفس الـ volume غادي يلقاهم.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
