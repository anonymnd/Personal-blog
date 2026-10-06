---
title: "علاش الداتا ديال Database كتبقى واخا كدير Restart لـ Container"
description: "فهم الفرق بين الطبقة المؤقتة ديال Container و Volumes ديال Docker اللي كتحفظ الداتا."
pubDate: 2026-10-13T15:48:00.000Z
translationKey: 168-why-your-database-data-survives-container-restarts
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

عاودتي شعلتي نفس container ديال PostgreSQL وبقاو الطلبات ديالك. هادشي عادي: restart ديال نفس container ما كيمسحش writable filesystem ديالها. خاصك تفرق بين restart وبين تحيد container وتصاوب وحدة جديدة فبلاصتها. التخزين الدائم هو اللي كيحدد شنو كيبقى من بعد هاد التبديل.
## Restart ماشي suppression
Writable layer كتخص container معينة. Stop/start ولا restart كيبقاو محافظين عليها؛ إلا حيدتي container كتضيع هاد layer. Named volume كتخزن البيانات من براها. Container جديدة تقدر تلقى ملفات database إلا ركبات نفس volume فالمسار الصحيح. هاد التخزين ما كيلغيش crash recovery وما كيعنيش تقدر تنقل الملفات بين أي versions مختلفة ديال database.
## Named volume تخزين كيسيرو Docker
بالـ local driver الافتراضية، Docker كيسير التخزين فـ host ديال engine. فـ Docker Desktop هاد host تقدر تكون VM ديال Linux، ماشي folder عادية باينة فـ Windows. Container الجديدة كتلقى البيانات إلا ركبات volume المقصودة فـ data path الصحيح. إلا بدلتي project name ديال Compose، تقدر تتخلق volume أخرى؛ السمية والإعدادات مهمين حتى هما.
## مثال: PostgreSQL 15 فالمحلي
حدد POSTGRES_PASSWORD محليا، مثلا فـ .env ما كتدخلهاش لـ Git. هاد المثال اختار PostgreSQL 15 عمدا وكيستعمل data path ديالها:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    ports:
      - "127.0.0.1:5332:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

Restart ديال db كتخلي البيانات. Compose down العادية كتحيد containers ولكن كتبقي هاد named volume، ونفس المشروع يقدر يعاود يركبها فـ up الجاية. Initialization variables كتنشئ credentials غير إلا كان data directory خاوي؛ ما كتعاودش تصفر database موجودة. قبل تبدل major version، شوف documentation الرسمية حيت layout وطريقة upgrade يقدرو يختلفو.
## Persistence ماشي backup
Volume كتخلي التخزين باقي من بعد تبديل container، ولكن ما كتخلقش نسخة مستقلة تقدر ترجع منها. Down -v تقدر تحيد ملفات هاد volume ديال المشروع. حتى مشكل فالتخزين ولا تغيير SQL بالغلط يقدر يأثر عليها. خلي backups منفصلة ديال database وجرب restore ديالها. Volume دائمة وbackup قابلة للاسترجاع كيحلو جوج مشاكل مختلفين.
## تمرين تطبيقي
شنو كيهدد البيانات اللي كاينة غير فـ layer ديال container: restart ديال نفسها ولا تحيدها؟

**الجواب:** تحيدها. Named volume مركبة مزيان تقدر تبقى، ولكن تحيد هاد volume راه عملية أخرى. إلا database اللي عاودتي صاوبتي بان ليك خاوية، شوف volume configuration الحقيقية.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
