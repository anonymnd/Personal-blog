---
title: "علاش ما خاصكش تخلي Hibernate يتكلف بـ Schema ديال Production"
description: "تعلم علاش الاعتماد على hbm2ddl.auto فـ production خطر وكيفاش تخدم بـ Flyway باش تدير migrations منظمة."
pubDate: 2026-10-12T23:48:00.000Z
translationKey: 152-why-hibernate-should-not-manage-your-production-schema
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك كدير deploy لنسخة جديدة من application ديال الشراء (procurement app). زدتي واحد الـ column سميتها 'priority' فـ entity ديال `PurchaseRequest`. ملي كدير restart للسيرفر، كتلقى application طاحت، ولا كاع شي table تمسحات حيت وقع مشكل فـ mapping. هادشي كيوقع ملي المطورين كيخليو `ddl-auto` ديال Hibernate هو لي يغير الـ database فـ production.

## الخطورة ديال ddl-auto

Hibernate كيعطينا `hibernate.hbm2ddl.auto` فيها خيارات بحال `update` ولا `create-drop`. وخا `update` كتبان ساهلة، ولكن راه ما مضموناش. Hibernate كيحاول يتوقع شنو خاصو يغير على حساب الـ entities ديال Java. فـ production، هاد الطريقة ما فيهاش تتبع (audit). ما كتعرفش بالضبط شنو هو الـ SQL لي تخدم، وما تقدرش ترجع للور (rollback) إلا وقع مشكل.

## الحل: migrations versionnées

بلاصة ما تخلي ORM يخمّن، خدم بـ tool بحال Flyway. Flyway كيخدم بـ scripts SQL مرتبين (مثلا `V1__init.sql`, `V2__add_priority.sql`). كل script كيتسجل فـ table ديال metadata مع واحد الـ checksum. إلا بدلتي شي script ديجا داز، Flyway كيطلع error، وهكدا كتضمن أن كاع الـ environments (dev, test, prod) بحال بحال.

## مثال تطبيقي: زيادة column

نفترضو أن application ديال الشراء خاصها تعرف شكون لي وافق على الطلب. بلاصة ما تخلي Hibernate يدير `update` بوحدو، كتصاوب ملف migration:

```sql
-- V3__add_approver_to_request.sql
ALTER TABLE purchase_request ADD COLUMN approved_by VARCHAR(255);
```

ملي كتخدم application، Flyway كيشوف الـ schema table، كيلقى بلي version 3 مازال ما دازت، وكيخدم الـ SQL. النتيجة هي تغيير مضمون ومحسوب. باش تحبس Hibernate من التدخل، دير `hibernate.hbm2ddl.auto=validate`. هكدا كيتأكد غير بلي الـ entities كيتطابقو مع الـ DB بلا ما يغير فيها والو.

## غلط شائع: تبديل scripts قدام

بزاف كيسحاب ليهم يقدروا يبدلو `V1__init.sql` باش يزيدو column من بعد ما يكون script ديجا داز فـ production. Flyway غادي يلقى بلي الـ checksum تبدلات وغادي يحبس الـ application.

**التصحيح:** عمرك تبدل migration ديجا تطبقات. ديما زيد ملف جديد (مثلا `V4__fix_column.sql`).

## تمرين تطبيقي

إلا بغيتي تأكد بلي الـ database ديال production مطابقة لـ entities ديالك ولكن بلا ما تخلي Hibernate يغير الجداول، شنو هي القيمة لي خاصك تدير لـ `ddl-auto`؟

**الجواب:** `validate`.
