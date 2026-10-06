---
title: "شنو كيعنيو V1, V2 و V3 ف Flyway؟"
description: "فهم كيفاش كيخدم التسمية ديال migrations ف Flyway باش تحافظ على التناسق ديال قاعدة البيانات ديالك."
pubDate: 2026-10-13T02:48:00.000Z
translationKey: 155-what-do-v1-v2-and-v3-mean-in-flyway
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات). ديجا طلقتي النسخة الأولى، ودابا بغيتي تزيد واحد column سميتها 'status' ف table ديال `purchase_requests` باش manager يقدر يوافق على الطلب. إلا بدلتي غير schema ف PC ديالك وطلقتيها، الـ database ديال production غادي تطيح حيت ماعندهاش ديك column. هنا فين كيجي الدور ديال Flyway versioning.

## كيفاش كيخدم هاد الترتيب
ف Flyway، `V1` و `V2` و `V3` هما prefixes ديال scripts ديال migration. هاد 'V' كتعني Version. Flyway كيستعمل هاد الأرقام باش يعرف الترتيب باش غادي يطبق التغييرات. كاين واحد table سميتها `flyway_schema_history` كيقيد فيها كاع داكشي لي داز. ملي كتشعل application، Flyway كيقلب على scripts الجداد وكيمشي يطبقهم بالترتيب من الصغير للكبير.

## القواعد ديال Versioned Migrations
هاد الـ migrations كيتسماو immutable، يعني ملي كيتطبقو مابقاش عندك الحق تبدل فيهم. مثلا إلا داز `V1__Create_Request_Table.sql` ف السيرفر، ممنوع تمسو. إلا بغيتي تزيد شي حاجة، خاصك تزيد `V2__Add_Status_Column.sql`. Flyway كيحسب واحد الـ checksum لكل fichier؛ إلا بدلتي `V1` من بعد ما تطبقات، Flyway غادي يعطيك error ديال checksum mismatch ويحبس application باش مايوقعش تضارب ف الـ schema.

## مثال تطبيقي: Procurement App
نفترض بغينا نطوروا الـ database ديالنا:

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (id INT PRIMARY KEY, item VARCHAR(255));
```
`V2__add_approval_flow.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
```
`V3__add_buyer_info.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN buyer_id INT;
```
**النتيجة:** Flyway غادي يخدم V1، من بعد V2، ومن بعد V3. إلا جا شي developer جديد، الـ DB ديالو غادي تطبق هاد التلاتة بالترتيب باش يولي عندو نفس الـ state لي كاين ف production.

## غلط شائع: تبديل scripts قدام
شي developer تفكر بلي نسى واحد column ف `V1` ومشى بدل الـ fichier `V1__init_schema.sql`.
**التصحيح:** عمرك تبدل migration ديجا تطبقات. الحل هو تزيد `V4__Add_Missing_Column.sql`. هكا ك تضمن بلي كاع الـ environments غادي يمشيو ف نفس الطريق.

## تمرين تطبيقي
عندك `V1` و `V2` ديجا تطبقو. بغيتي تزيد `created_at` timestamp للـ table ديالك. شنو غادي تسمي الـ fichier، وشنو يوقع إلا سميتو `V1.5`؟

**الجواب:** سميه `V3__Add_Timestamp.sql`. تقدر تستعمل `V1.5` إلا كانت configuration ديالك كتسمح بـ decimals، ولكن العادة هي تخدم بـ integers باش يكون الترتيب واضح ومفهوم.
