---
title: "شنو كيدير docker exec -it ؟"
description: "شرح مبسط كيفاش تدخل لوسط container خدام باش تقلب المشاكل وتصلحهم."
pubDate: 2026-10-13T18:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك application ديال procurement (شراء) خدامة فـ container. واحد الموظف صيفط طلب، ولكن manager مابغاش يـ-valider. شفتي logs ولكن مالقيتي والو واضح. هنا خاصك تدخل « لداخل » ديال container اللي خدام دابا باش تشوف واش شي fichier de configuration ناقص ولا تجرب واش connection مع database خدامة من وسط container نيت. هنا فين كنحتاجو `docker exec -it`.

## كيفاش خدامة exec
كاين فرق كبير بين `docker run` و `docker exec`. الـ `run` كيكريي container جديد من image، ولكن `exec` كتخليك تزيد command وسط container ديجا خدام. هي كتستغل القدرة ديال host باش يدخل لـ namespaces (ديال process و network) اللي معزولين فـ container.

## شنو كيعنيو -it
الـ `-i` (interactive) كتخلي الـ STDIN محلول باش تقدر تكتب. والـ `-t` (tty) كتعطيك pseudo-terminal، يعني كتولي تشوف prompt (بحال root@container:/#) والألوان، وكتحس براسك خدام فـ terminal حقيقي. بلا بيهم، تقدر تلونصي command ولكن ماتقدرش تهضر مع shell بحال Bash.

## مثال تطبيقي: تقليب المشكل فـ App ديال الشراء
نفترضو الـ container سميتو `procurement-app` وبغيتي تشوف واحد الـ log كاين فـ `/var/log/app.log`.

```bash
# ندخلو لـ container باستعمال bash
docker exec -it procurement-app /bin/bash

# دابا حنا لداخل ديال container:
root@a1b2c3d4e5f6:/# cat /var/log/app.log
# [LOG]: Connection to DB failed at 10.0.0.5
exit
```
النتيجة: دخلتي لوسط البيئة، عرفتي بلي كاين مشكل فـ network، وخرجتي لـ machine ديالك.

## غلط شائع: exec مقابل run
بزاف ديال الناس كيغلطو وكيديرو `docker run -it image /bin/bash` باش يـ-debug-يو service خدام. `docker run` كيشعل container *جديد*، يعني ماغاديش تلقى فيه نفس الـ state ولا نفس الـ logs ديال container اللي فيه المشكل. ديما استعمل `exec` يلا كان container ديجا خدام.

## تمرين تطبيقي
كيفاش تقدر تلونصي command ديال `ls -la` وسط container سميتو `buyer-service` بلا ما تدخل لـ shell interactive ؟

**الجواب:** `docker exec buyer-service ls -la`. (هنا ماحتاجينش `-it` حيت غير command وحدة وغاتسالي).

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
