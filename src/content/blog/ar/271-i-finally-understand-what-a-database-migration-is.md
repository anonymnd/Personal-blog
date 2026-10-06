---
title: "فهمت أخيراً شنو هي الـ Database Migration"
description: "دليل باش تفهم كيفاش كايتغير schéma ديال la base de données بلا ما يضيعو لينا المعلومات."
pubDate: 2026-10-17T22:48:00.000Z
translationKey: 271-i-finally-understand-what-a-database-migration-is
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا عندك application ديال الشراء (procurement) فين الموظفين كايصيفطو طلبات. فالبداية، table ديال `PurchaseRequest` كان فيها غير `description` و `amount`. من بعد شهر، المدير قاليك خاص كل طلب يكون فيه `department_id` باش نعرفو الميزانية ديال كل قسم. إلا بدلتي غير l'entité Java ودرتي restart لـ app، غادي يوقع crash حيت la table فـ SQL مازال ما فيهاش ديك la colonne. هنا فين كايجي الدور ديال migrations.

## فكرة الـ Versioning
كنت كايسحاب لي بلي migrations هي غير 'تحديث' ديال la base. ولكن دابا فهمت بلي هي بحال Git ولكن للـ schema. بلاصة ما تبقى تصيفط ملف `.sql` كبير لصحابك، كاتصيفط ليهم مجموعة ديال scripts صغار ومرقمين. كل script كايحول la base من version A لـ version B. la base de données كاتكون فيها واحد la table ديال metadata (بحال `flyway_schema_version`) باش تعرف شنو لي تخدم وشنو لي بقى.

## كيفاش كاتخدم هاد العملية
ملي كاتشعل l'application، l'outil ديال migration كايقلب فواحد الدوسي على scripts. كايقارن الملفات لي لقى (مثلاً `V1__init.sql`, `V2__add_dept.sql`) مع la table ديال metadata. إلا لقى la base فـ version 1 ولكن الكود فيه version 2، كايخدم script `V2` أوطوماتيكياً قبل ما تخدم l'application كاملة.

## مثال تطبيقي: إضافة تتبع الأقسام
نفترض بغينا نزيدو `department_id` لـ table ديال الطلبات. كانصاوبو ملف migration بحال هكا:

```sql
-- V2__Add_Department_To_Requests.sql
ALTER TABLE purchase_requests 
ADD COLUMN department_id BIGINT NOT NULL DEFAULT 1;
```
النتيجة: كاع الطلبات لي كانوا ديجا كاينين كايوليو تابعين للقسم رقم 1، والطلبات الجداد خاص يكون فيهم ID ديال القسم. l'app كاتخدم عادي حيت Java و SQL ولاو متطابقين.

## غلط شائع: تبديل scripts قدام
بزاف ديال الناس كايغلطو وكايمشيو يبدلو `V1__init.sql` من بعد ما تكون la base ديجا تطلقات فـ production. حيت l'outil كايشوف بلي `V1` تخدمات، ما كايشوفش التغييرات الجداد. باش تصلح هادشي، ما خاصكش تقيس migration قديمة، ولكن خاصك تزيد ملف جديد، مثلاً `V3__Fix_Init_Table.sql`.

## تمرين تطبيقي
الوضعية: بغيتي تبدل سميت la colonne من `amount` لـ `total_price` فـ table ديال `purchase_requests`. شنو هي الطريقة الصحيحة؟

**الجواب:** تصاوب ملف migration جديد (مثلاً `V4__Rename_Amount.sql`) فيه `ALTER TABLE purchase_requests RENAME COLUMN amount TO total_price;` بلا ما تمس script لي صاوبتي فالبداية.
