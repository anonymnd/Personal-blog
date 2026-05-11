---
title: "كيفاش كيخدمو ملفات Flyway Migration"
description: "شرح مفصل للطريقة باش Flyway كيسير نسخ قاعدة البيانات وكيفاش كينفذ التغييرات."
pubDate: 2026-10-13T01:48:00.000Z
translationKey: 154-how-flyway-migration-files-work
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام ففريق، واحد صاحبك زاد column ديال 'status' فجدول الطلبيات (procurement requests)، ولكن نتا فالمكينة ديالك مازال ما عندكش هاد التغيير. ملي غتخدم application، غتوقع crash حيت Java entity ما متطابقاش مع schema ديال DB. هنا فين كيجي Flyway باش يحل هاد المشكل، كيتعامل مع تغييرات DB بحال إلا كانت code versioned.

## كيفاش كيخدم الـ Versioning
Flyway كيخدم بواحد السمية محددة للملفات. مثلا: `V1__Create_Request_Table.sql`. حرف `V` كيعني أنها versioned migration، والرقم `1` هو النسخة، ودوك جوج underscores `__` كيفرقو بين النسخة والوصف. Flyway كيكري جدول سميتو `flyway_schema_history` فـ DB، هاد الجدول هو اللي كيقيد فيه كاع السكريبتات اللي تخدمو والـ checksum ديالهم.

## طريقة التنفيذ والـ Checksums
ملي كتخدم application، Flyway كيقلب على ملفات migration وكيقارنهم مع داك الجدول `flyway_schema_history`. إلا لقى شي ملف (مثلا `V2__Add_Manager_Approval.sql`) ما كاينش فـ الجدول، كينفذو مرة وحدة فقط. باش يضمن أن الملف ما تبدلش، كيحسب ليه checksum (بصمة رقمية). إلا بدلتي شي حاجة فـ `V1` وهو ديجا تخدم فـ production، Flyway غيعيق بلي checksum تبدل وغيوقف application باش ما يوقعش تضارب فـ البيانات.

## مثال تطبيقي: App ديال الشراء
نفترضو بغينا نطوروا schema ديال سيستيم ديال الشراء:

**V1__Initial_Setup.sql**
```sql
CREATE TABLE procurement_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester VARCHAR(100)
);
```
**V2__Add_Approval_Column.sql**
```sql
ALTER TABLE procurement_requests ADD COLUMN manager_approved BOOLEAN DEFAULT FALSE;
```
**النتيجة:** فـ أول مرة، Flyway غيخدم V1 عاد V2. ملي تعاود تخدم app، غيشوفهم ديجا كاينين فـ history وغينقزهم.

## غلط شائع: تبديل سكريبتات قدام
بزاف ديال الناس كيغلطو وكيمشيو يبدلو `V1` باش يصححو غلط ملي كيكون `V2` ديجا تخدم. هادشي كيعطي checksum error.
**التصحيح:** عمرك تبدل migration versioned ديجا تخدمات. الحل هو تزيد ملف جديد، مثلا `V3__Fix_Typo_In_Table.sql` باش تصحح الغلط.

## تمرين تطبيقي
إلا كان عندك `V1__init.sql` و `V2__update.sql` ديجا تخدمو، وزدتي ملف `V1.5__extra.sql` واش Flyway غيخدمو؟

**الجواب:** لا، حيت Flyway فـ العادة كيتجاهل أي migration النسخة ديالها صغر من آخر نسخة تخدمات. بما أن 1.5 صغر من 2، ما غيخدموش إلا إذا فعلتي 'outOfOrder' فـ الإعدادات. ولكن من الأحسن ديما تزيد النسخ بشكل تصاعدي (مثلا V3) باش تفادى الصداع.
