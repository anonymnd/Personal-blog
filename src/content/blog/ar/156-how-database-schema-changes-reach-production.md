---
title: "كيفاش كيوصلو تغييرات الـ Database Schema للـ Production"
description: "دليل على كيفاش تسير التغييرات ديال قاعدة البيانات باستعمال migrations versionnées و pattern expand/contract باش تفادى الـ downtime."
pubDate: 2026-10-13T03:48:00.000Z
translationKey: 156-how-database-schema-changes-reach-production
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل معايا خدام على application ديال procurement (المشتريات). بغيتي تبدل السمية ديال column من `request_status` لـ `approval_state` فـ table سميتها `PurchaseRequests`. إلا بدلتي السمية نيشان وطلقتي الـ code، الـ version القديمة ديال app اللي باقي خدامة فـ production غادي تـ crash حيت غتبقى تقلب على السمية القديمة، والـ version الجديدة غتقلب على الجديدة. هنا فين كاين المشكل ديال database migrations.

## كيفاش كيخدمو الـ Versioned Migrations
باش نحلّو هاد المشكل، كنستعملو أدوات بحال Flyway. بلاصة ما تبقى تلونصي SQL scripts بيدك، كدير ملفات مسمنين بحال `V1__init.sql` و `V2__add_column.sql`. Flyway كيدير table سميتها `schema_version` فـ database. ملي كتـ start الـ app، Flyway كيشوف شنو هما السكريبتات اللي تلونصاو. إلا لقى `V2` مازال ما تلونصا، كينفذو مرة وحدة. وكيستعمل checksums باش يتأكد بلي السكريبت اللي تلونصا ما تبدلش؛ إلا بغيتي تصحح شي حاجة، خاصك تزيد `V3`.

## الـ Pattern ديال Expand and Contract
باش ما نحبسوش الـ service، كنخدمو بـ 'Expand and Contract'. بلاصة ما نديرو تغيير واحد كيمسح القديم، كنديرو 3 ديال المراحل:
1. **Expand**: كنزيدو column جديدة `approval_state` وكنخليو `request_status`. الـ app كتكتب فـ بجوج.
2. **Migrate**: كنحولو data من column القديمة للجديدة.
3. **Contract**: ملي كلشي كيولي خدام بالـ version الجديدة، كنمسحو `request_status`.

## مثال تطبيقي: زيادة Buyer ID
نفترضو بغينا نربطو `PurchaseRequest` مع `Buyer` معين.

**Migration V3__add_buyer_id.sql**:
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id BIGINT;
-- ملاحظة: كنخليوه nullable فـ الأول باش ما نبلوكيوش الـ table
```
**النتيجة**: الـ database دابا ولات كتقبل field جديد بلا ما تهرس لينا داكشي اللي خدام. من بعد كنحدثو الـ code ديال app.

## غلط شائع: تبديل migrations قدام
بزاف ديال developers كيحاولوا يبدلو `V1__init.sql` باش يصلحو غلط مورا ما تلونصات فـ production. هادشي كيدير checksum mismatch error، و Flyway مكيخليش الـ app تـ start.
**التصحيح**: ديما زيد script جديد (مثلا `V4__fix_typo.sql`) باش تبدل شي حاجة فـ schema اللي ديجا كاين.

## تمرين تطبيقي
عندك table سميتها `orders` وبغيتي تبدل column من `VARCHAR` لـ `TEXT`. باستعمال expand/contract، شنو هي أول حاجة خاصك دير فـ SQL؟

**الجواب**: تزيد column جديدة بنوع `TEXT` (Expand) بلاصة ما تبدل الـ column اللي كاينه نيشان.
