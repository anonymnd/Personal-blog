---
title: "شنو كيوقع ملي كتفشل Migration؟"
description: "فهم شنو كيوقع ملي كتفشل migration ديال database وكيفاش ترجع الأمور لمجراها باستعمال Flyway."
pubDate: 2026-10-13T04:48:00.000Z
translationKey: 157-what-happens-when-a-migration-fails
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات) وبغيتي تزيد migration باش تكريي table سميتها `purchase_orders`. وسط السكريبت، وقع غلط فالسنتكس (syntax error). فجأة، application مابغاتش تخدم وطلعات ليك error كتقول 'Migration failed'. هنا غاتسول راسك: واش ديك table تكريات؟ واش database ترونات؟

## شوف أولا شنو وقع بصح
وقف release وقرا statement اللي فشلات، الخطأ والـ version ديال migration. قارن schema الحقيقية مع تاريخ Flyway، وما تفترضش بلي كلشي بقى كيف كان. Migrations اللي من بعد غالبا ما يقدروش يدوزو حتى يتحل المشكل. إلا migration كتخدم مع startup وفشلات، غالبا هاد instance ديال التطبيق ما كتوليش ready؛ ماشي بالضرورة السيستيم كامل غيتراجع بوحدو.
## فشل transaction ماشي بحال تغيير جزئي
فـ PostgreSQL، إلا migration كاملة خدامة داخل transaction، DDL العادية والتغييرات ديال history يقدرو يرجعو بجوج. ممكن ما تبقاش حتى failed row فـ history وتبقى version pending. إلا database ولا statement ما كتخدمش داخل هاد transaction، التغييرات اللي دازت تقدر تبقى وfailed entry تقدر تمنع التقدم. حتى PostgreSQL عندها statements ما كتدوزش فـ transaction، بحال CREATE INDEX CONCURRENTLY. شوف database والـ SQL والإعدادات قبل ما تختار طريقة الإصلاح.
## مثال: statement ما تقبلاتش
```sql
-- V2__add_orders.sql: deliberately invalid teaching example
CREATE TABLE purchase_orders (id INT PRIMARY KEY);
ALTER TABLE purchase_orders ADDD COLUMN status VARCHAR(50);
```

Statement الثانية فيها الغلط المقصود ADDD. فـ migration عادية كاملة transactionnelle فـ PostgreSQL، حتى table الجديدة كترجع. إلا هاد version ما نجحات حتى فشي environment مشتركة، صححها لـ ADD COLUMN وعاود من الحالة اللي تأكدتي بلي ما تبدلاتش. إلا نجحات فبلاصة أخرى، خليك مع migration الأصلية المطبقة وقلب على الفرق فالمعطيات ولا environment، ما تبدلش تاريخ release بلا دراسة.
## صلح schema قبل تاريخ Flyway
Flyway repair كتسير history. تقدر تحيد failed entries وتوافق بعض metadata؛ ما كترجعش SQL للور، وما كتحيدش tables اللي بقاو، وما كتخدمش statements الناقصين وما كتحولش script فشلات لتنفيذ ناجح. صلح التغييرات الجزئية أولا بإجراء recovery متجرب. استعمل نفس migration locations فـ repair، ومن بعد دير migrate وvalidate على حساب الحالة. ما تبدلش history row يدويا باش تخبي الفشل، وما تستعملش repair باش تغطي على migration كانت مطبقة وتبدلات.
## تمرين تطبيقي
Migration ماشي transactionnelle صاوبات table ومن بعد فشلات. واش repair بوحدها كترجع schema القديمة؟

**الجواب:** لا. شوف وصلح schema الجزئية أولا بالطريقة المتفق عليها ديال recovery. Repair تقدر من بعد تحيد failed entry باش تعاود migration متأكد منها. إلا rollback transactionnel رجعات كلشي وما بقاتش failed entry، ممكن ما تحتاجش history repair.

## باش تزيد تفهم

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
