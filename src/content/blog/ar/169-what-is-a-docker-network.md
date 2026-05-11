---
title: "شنو هو Docker Network؟"
description: "شرح بسيط كيفاش كيهضرو containers ديال Docker بيناتهم ومع العالم الخارجي باستعمال الشبكات الوهمية."
pubDate: 2026-10-13T16:48:00.000Z
translationKey: 169-what-is-a-docker-network
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا عندك تطبيق ديال الشراء (procurement app) فيه frontend كيسيفط طلب لـ backend API، وهاد API خاصها تهضر مع قاعدة بيانات PostgreSQL. إلا كانوا هادشي كامل فـ containers مفرقين، راه كيكونوا معزولين على بعضياتهم فالبداية. ما تقدرش تخدم بـ 'localhost' حيت كل container عندو network namespace ديالو بوحدو؛ يعني 'localhost' وسط container كتعني غير داك container راسو، ماشي الماكينة (host) ولا containers خرين.

## الفكرة ديال العزل (Isolation)
Docker كيخدم بـ network namespaces باش يضمن أن containers ما يبرزطوش بعضياتهم. فالعادة، أي container كيكون فـ bridge network. هاد bridge هو عبارة عن شبكة وهمية كتخلي containers اللي فـ نفس الماكينة يهضرو بيناتهم، ولكن كيبقاو معزولين على الشبكة الحقيقية ديال الماكينة إلا إذا فتحنا ports محددين.

## الفرق بين Bridge و Host
أغلب الناس كيخدمو بـ `bridge` حيت كيدير شبكة داخلية خاصة. ولكن إلا بغيتي container يشارك الشبكة ديال الماكينة نيشان بلا عزل، كتخدم بـ `host` network. ولكن bridge أحسن من ناحية السيكوريتي.

## كيفاش كيهضرو containers فـ Compose
ملي كتخدم بـ Docker Compose، هو كيصاوب network بوحدو للخدمات (services) ديالك. بلا ما تبقى تقلب على IP addresses اللي كيتبدلو كل مرة، كتخدم بسمية الخدمة (service name) كأنها هي hostname.

```yaml
services:
  db:
    image: postgres
  api:
    image: procurement-api
    depends_on:
      - db
```
فهاد المثال، الـ `api` container باش يوصل لـ database كيخدم بسمية `db` والـ port هو `5432`.

## مابين Port ديال الماكينة و Port ديال Container
باش تدخل لـ container من المتصفح ديالك، خاصك دير mapping للـ ports. مثلاً `-p 5332:5432` كتعني أن أي حاجة مشات للـ port 5332 فالمكينة ديالك، Docker غادي يصيفطها للـ port 5432 اللي كاين وسط container.

## غلط شائع: مشكل localhost
بزاف ديال الناس كيغلطو وكيكتبو `localhost:5432` وسط الكود ديال API باش يتصلو بـ DB. حيت الـ API راه فـ container بوحدو، غادي يقلب على DB وسط راسو وما غادي يلقاهاش.
**التصحيح:** خدم بسمية الخدمة (مثلاً `db:5432`) باش تهضر مع container آخر.

## تمرين تطبيقي
إلا كانو عندك جوج containers فـ نفس الـ bridge network سميتهم `web` و `app` و الـ `app` خدام فـ port 8080، كيفاش الـ `web` يقدر يعيط لـ API ديال `app`؟

**الجواب:** كيصيفط request لـ `http://app:8080`.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
