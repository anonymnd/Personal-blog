---
title: "شنو هو Flyway؟"
description: "دليل مبسط باش تفهم كيفاش تسيّر التغييرات ديال قاعدة البيانات (Database Migrations) باستعمال Flyway."
pubDate: 2026-10-13T00:48:00.000Z
translationKey: 153-what-is-flyway
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام مع فريق فواحد l'application ديال الشراء (procurement). زدتي واحد la colonne سميتها 'status' فـ la table `purchase_requests` فـ PC ديالك. ملي صاحبك دار pull لـ code، l'application ديالو حبسات حيت la base de données اللي عندو مافيهاش ديك la colonne. باش تبقى تصيفط scripts SQL فـ WhatsApp ولا Email راهي روينة وغالطة. هنا فين كيجي Flyway باش يرجع التغييرات ديال la base de données بحال code source كيتسير بـ versioning.

## كيفاش كيخدم هاد السيستيم
Flyway كيخدم بواحد la table سميتها `flyway_schema_history`. بلاصة ما دير fichier SQL واحد كبير، كتدير scripts صغار ومترقمين (مثلاً `V1__Create_Request_Table.sql` و `V2__Add_Status_Column.sql`). ملي كتشعل l'application، Flyway كيقلب فـ dossier ديال migrations وكيقارنو مع la table ديال l'historique. كيشغل غير scripts اللي مازال ما تدارو، وهكا كاع les environnements (dev, staging, prod) كيكونوا بحال بحال.

## مثال تطبيقي: تطبيق الشراء
نفترض بغينا نزيدو خاصية الموافقة ديال manager. غادي نكرييو جوج ديال les fichiers :

`V1__init_schema.sql`:
```sql
CREATE TABLE purchase_requests (
    id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT
);
```

`V2__add_approval_column.sql`:
```sql
ALTER TABLE purchase_requests ADD COLUMN manager_approval BOOLEAN DEFAULT FALSE;
```

**النتيجة:** Flyway غادي يخدم V1 هي الأولى، ومن بعد V2. إلا كنتي ديجا داير V1 فـ serveur، Flyway غادي يعرفها بـ checksum وغادي يخدم غير V2.

## غلط شائع: تبديل scripts قدام
واحد الغلط كيديروه بزاف هو ملي كيبدلو `V1__init_schema.sql` وهو ديجا طلع l'production. Flyway كيحسب checksum لكل fichier. إلا بدلتي غير حرف واحد فـ script ديجا تخدم، Flyway غادي يلقى بلي checksum تبدلات وما غاديش يخلي l'application تخدم باش ما يوقعش خلط فـ schema.

**التصحيح:** عمرك تبدل migration versioned اللي ديجا تطلقت. دير migration جديدة (مثلاً `V3__Fix_Column_Name.sql`) باش تصحح الغلط.

## طريقة Expand and Contract
باش ما تحبسش l'application ملي تكون كتـ deployer، استعمل طريقة 'expand and contract'. بلاصة ما تبدل سمية la colonne (اللي غادي يهرس l'app)، زيد la colonne الجديدة هي الأولى (expand)، نقل data، وعاد مسح la colonne القديمة فـ version أخرى (contract).

## تمرين تطبيقي
**الحالة:** بغيتي تزيد la colonne `buyer_id` لـ la table `purchase_requests`. شنو خاص يكون سميت l'fichier إلا كانت آخر migration هي `V5`؟

**الجواب:** `V6__Add_Buyer_Id_To_Requests.sql` (أو أي سمية كتبدا بـ `V6__`).
