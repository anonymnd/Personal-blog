---
title: "كيفاش كيحافظو الفرق على نفس schéma ديال Database"
description: "تعلم كيفاش توحد structure ديال base de données بين بزاف ديال les environnements باستعمال Flyway و pattern expand/contract."
pubDate: 2026-10-13T07:48:00.000Z
translationKey: 160-how-teams-keep-the-same-database-schema
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

تخيل معايا فريق فيه 5 ديال developers. Alice زادت واحد la colonne سميتها 'priority' فـ table ديال requests فـ pc ديالها. ملي Bob دار pull لـ code، l'application ديالو تبلوكات حيت la base de données اللي عندو مافيهاش ديك la colonne. هاد المشكل ديال 'schema drift' كيوقع بزاف فـ les applications ديال procurement فين requester كيصيفط demande و خاص la structure تكون هي هي عند كلشي.

## كيفاش خدامين les migrations versionnées
باش نحلو هاد المشكل، كنستعملو أدوات بحال Flyway. بلاصة ما نبقاو نصيفطو SQL dumps، كنكتبو scripts ديال migration مرتبين (مثلا: `V1__create_requests_table.sql`, `V2__add_priority_column.sql`). Flyway كيدير واحد la table ديال metadata باش يعرف شنو اللي تـexecuta. ملي كتشعل l'app، Flyway كيشوف واش كاين شي version جديدة و كيطبقها بالترتيب. ملي كيدوز script، كيتسجل ليه checksum؛ إلا بدلتي شي script داز ديجا، Flyway غادي يعطيك erreur باش ما يوقعش خلط.

## مثال تطبيقي: تحديث طلبات الشراء
نفترضو بغينا نبدلو la colonne `status` من texte لـ ID باش manager يـapprouver الطلب.

1. **V3__add_status_id.sql**: `ALTER TABLE requests ADD COLUMN status_id INT;`
2. **V4__migrate_data.sql**: `UPDATE requests SET status_id = 1 WHERE status = 'PENDING';`
3. **V5__drop_old_status.sql**: `ALTER TABLE requests DROP COLUMN status;`

النتيجة: la base de données كتبدل شوية بشوية بلا ما يضيع data وبلا ما تحبس l'app.

## Pattern Expand and Contract
فـ les systèmes اللي خاصهم يبقاو خدامين ديما، ما يمكنش نطفيو l'app باش نديرو migration. هنا كنستعملو 'Expand and Contract'. أولا كانديرو **Expand** (كنزيدو la colonne الجديدة)، من بعد كنـdeployiw code اللي كيكتب فـ بجوج، وفـ اللخر كانديرو **Contract** (كنمسحو la colonne القديمة) ملي كنأكدو أن code القديم مابقاش خدام.

## غلط شائع: تبديل scripts قدام
بزاف ديال developers كيبغيو يصححو غلط فـ `V1__init.sql` من بعد ما يكون ديجا طلع لـ production. هادشي كيدير checksum mismatch.
**التصحيح**: عمرك تبدل migration ديجا تـmergat. دير version جديدة (مثلا `V6__fix_typo.sql`) باش تصحح الغلط.

## تمرين تطبيقي
إلا كان عندك `V1` و `V2` ديجا تطبقو، ومسحتي `V1` بالغلط من dossier ديال projet، شنو غادي يدير Flyway ملي تعاود تشعل l'app؟

**الجواب**: غادي يعطيك erreur حيت l'historique اللي فـ la base de données ما بقاش مطابق لـ les scripts اللي كاينين فـ code.
