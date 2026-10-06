---
title: "علاش محتاجين Database Migrations؟"
description: "شرح كيفاش كايحلّو migrations المشاكل ديال التغيير اليدوي في schéma ديال database فاش كيكون خدام بزاف ديال الناس على مشروع واحد."
pubDate: 2026-10-12T22:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على application ديال الشراء (procurement app). زدتي واحد column سميتها `priority` في table ديال `PurchaseRequest` في PC ديالك. كلشي خدام مزيان. صيفطتي الكود لصاحبك، ولكن application عندو تبلوكات حيت database ديالو مافيهاش ديك column. هاد المشكل ديال "خدام عندي في PC" هو علاش خاصنا migrations.

## المشكل ديال التغيير اليدوي
فاش كيبقاو developers يلونصيو scripts SQL بيديهم، كايوقع الروينة. شي واحد كينسى ما يلونصيش script، ولا جوج د الناس كيبدلو نفس table بطرق مختلفة. وحتى `hibernate.hbm2ddl.auto=update` ما صالحاش في production حيت ما كتعرفش تعامل مع تغييرات صعيبة بحال تبديل سمية column بلا ما يضيعو البيانات. هي غير كاتشوف واش mapping متوافق مع schema، ماشي واش التغيير آمن.

## Version Control لـ Schema
الـ migrations كايتعاملو مع schema بحال إلا كود. أدوات بحال Flyway كايخدمو بـ scripts فيهم version (مثلا `V1__Create_Request_Table.sql` و `V2__Add_Priority_To_Request.sql`). هاد scripts كيكونوا في Git. فاش كاتنوض application، tool كايشوف واحد table ديال metadata في database باش يعرف شنو لي ديجا تطبق، وكايزيد يلونصي غير scripts الجداد بالترتيب.

## مثال تطبيقي: زيد شكون وافق على الطلب
نفترضو بغينا نعرفو شكون لي وافق (approve) على طلب الشراء. بلا ما نمشيو نبدلو database بيدينا، كانصاوبو script جديد:

```sql
-- V3__Add_Approver_To_Request.sql
ALTER TABLE purchase_requests 
ADD COLUMN approved_by VARCHAR(255);
```

فاش كانديبلويو هادشي في server ديال staging، Flyway كايلقى بلي `V1` و `V2` ديجا دازو، إذن كايخدم غير `V3`. النتيجة هي أن schema كاتكون بحال بحال في كاع environments بلا تمارة.

## غلط شائع: تبديل migrations قدام
بزاف د الناس كايغلطو وكيمشيو يبدلو `V1__Create_Table.sql` من بعد ما تكون ديجا مشات لـ production. الـ tools ديال migration كايخدمو بـ checksums باش يتأكدو بلي script ماتبدلش. إلا بدلتي شي ملف قديم، tool غايعرف بلي checksum تبدلات وما غايخليش application تخدم باش ما يوقعش تضارب.

**التصحيح:** عمرك ماتبدل migration ديجا تدار ليها merge. دير version جديدة (مثلا `V4`) باش تصحح الغلط.

## تمرين تطبيقي
إلا بغيتي تبدل سمية column من `req_date` لـ `request_date` في production بلا ما تحبس الخدمة، واش خاصك تبدل script لي صاوبتي في الأول؟

**الجواب:** لا. خاصك تصاوب script ديال migration جديد بـ version جديدة باش تبدل السمية ويبقى كلشي synchronized.
