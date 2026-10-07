---
title: "كيفاش تطور Schema ديال Production بـ Flyway بلا ما تبقى تخمن"
description: "تعلم كيفاش تسير migrations ديال database بالترتيب، وتخدم بـ expand-contract باش ما تحبسش السيرفيس، وكيفاش تعامل مع الـ failures."
pubDate: 2026-10-08T02:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
seriesOrder: 35
locale: ar
tags: ["schema-migrations","learning-series"]
draft: false
---

## علاش ddl-auto=update خطر فـ Production

فاش كنكونو يلاه بادين فـ development، `spring.jpa.hibernate.ddl-auto=update` كيبان ساهل حيت كيبدل tables بوحدو باش يجيوا مع Java entities. ولكن فـ production، هادشي خطر بزاف. Hibernate كيدير غير محاولة تقريبية (best-effort guess)، وما يقدرش يدير rename لشي column ولا يغير constraints بطريقة دقيقة. وإلا وقع مشكل، غادي يخلي database فـ حالة ما معروفاش وما عندك حتى trace باش تعرف شنو وقع.

الحل هو تخدم بـ `ddl-auto=validate`. فهاد الحالة، Hibernate ما كيقيس والو فـ database، غير كيتأكد بلي schema اللي كاين فـ DB هو نيت اللي كاين فـ code. إلا لقى شي حاجة ناقصة ولا type ماشي هو هاداك، application ما غاديش تـ startup. هكا كتضمن بلي app ما غاديش تخدم بـ database version ماشي هي هذيك.

## كيفاش Flyway كيضمن لينا Consistency

Flyway كيعوض التخمين بـ history table سميتها `flyway_schema_history`. بلاصة ما نخليو framework يخمن، حنا كنكتبو scripts SQL واضحين.

### كيفاش كيخدم الـ Versioning
Flyway كيعرف الـ migrations من السمية ديال file: `V<Version>__<Description>.sql` (مثلا `V1__Create_user_table.sql`).
1. **Execution**: Flyway كيقلب على scripts فـ classpath وكيقارنهم مع table ديال history.
2. **Checksums**: فاش كيتطبق script، Flyway كيحسب ليه واحد الـ checksum (hash ديال content).
3. **Immutability**: فاش `V1` كيتطبق فـ production، ممنوع تبدلو. إلا بدلتي غير حرف واحد فـ `V1__Create_user_table.sql` من بعد ما تـ apply، Flyway غادي يلقى checksum mismatch فـ المرة الجاية اللي تـ startup فيها app وغادي يوقف كلشي.

## سيناريو: إضافة `displayName` ضروري (Required)

إضافة colonne مطلوبة لـ users عامرة كتفشل إلا rows القديمة ناقصين values. زيد display_name nullable، ومن بعد deploy code اللي كيعمّرها فكل row جديدة وكيقبل القديمة. Old writers باقيين يقدرو يدخلو null، يعني backfill مرة وحدة ما كافيش.

حيد ولا عدل كاع old writers قبل invariant الأخيرة. عمّر rows بقيمة مقبولة فـ domain وراقب واش username null ولا طويلة بزاف، وتأكد ما بقا null. فـ table كبيرة خدم batches مراقبين وقابلين للاستئناف. من بعد فرض NOT NULL ملي versions اللي باقي خدامين متوافقين.

```sql
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
-- Backfill only after writers reliably populate the new field.
UPDATE users SET display_name = username WHERE display_name IS NULL;
-- Later, after compatibility and null checks:
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
```

هاد SQL كتخص مراحل migration وdeployment مفصولين بوضوح؛ الفصل بوحدو ما كيضمنش compatibility. PostgreSQL تقدر ترجع DDL transactional العادية وbackfill بجوج إلا migration فشلات؛ جمع statements ما كيخلقش دائما partial schema. المراحل باش نتحكمو فـ compatibility والتشغيل. بعض DBs وoperations عندهم transaction behavior آخر.
## التعامل مع الـ Failures و Transactional DDL

فاش كيوقع failure فـ migration، النتيجة كتختلف على حسب الـ DB:

- **PostgreSQL**: أغلب الـ DDL كيكون transactional. إلا `V3` فشل فـ النص، كلشي كيرجع (rollback) و الـ history table كيبقى فـ `V2`. كتصلح script وكتعاود تـ restart.
- **MySQL/Oracle**: الـ DDL كيدير implicit commit. إلا كان script فيه 3 ديال `ALTER TABLE` وفشل الثالث، الـ 2 لولين كيبقاو applied.

### المشكل ديال `repair`
فاش كتفشل migration فـ DB ماشي transactional، Flyway كيسجل ديك version بلي `failed`. app ما غاديش تخدم حتى تحل هاد المشكل.

بزاف ديال الناس كيسحاب ليهم `flyway repair` هو شي button ديال "Undo". **`flyway repair` ما كيرجعش الـ SQL اللي تـ apply**. هو غير كينقي `flyway_schema_history` باش يحيد الـ failed entries ولا يقاد checksums. إلا كان script ديالك زاد column عاد فشل، خاصك تمسح ديك column بـ SQL يدويًا عاد دير `repair` وتـ restart app.

## تمرين

باش تبدل total_amount بـ grand_total، زيد colonne الجديدة nullable. Deploy code متوافقة كتزامن بجوج values فالوقت اللي versions متعايشين، ومن بعد حيد old writers ولا وفر synchronization مجربة. دير backfill وreconciliation وتأكد من values. بدل reads لـ grand_total وما توقفش الاعتماد على total_amount حتى كاع writers وrollback versions متوافقين. حيد القديمة فـ migration لاحقة مراجعة.

تغيير code مرحلة deployment، ماشي SQL migration سميتها Update_app. ما تحيدش column نصف مصاوبة عشوائيا بعد failure؛ شوف الحالة واختار recovery كتحتافظ بـ data. repair كتبدل history ماشي DB. ddl-auto=validate ما كتثبتش كاع constraints ولا indexes ولا business rules. خلي migrations اللي تطبقو بلا تبديل وزيد migration جديدة للتطوير.

## باش تزيد تفهم

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
