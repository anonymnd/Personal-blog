---
title: "كيفاش تصمم وتقرا B-Tree Indexes في الـ Queries ديالك"
description: "شرح عميق لـ B-Tree، ترتيب الـ composite index، و selectivity باش تحسن الـ audit-log queries."
pubDate: 2026-10-07T23:48:00.000Z
translationKey: 145-what-is-a-database-index
seriesOrder: 32
locale: ar
tags: ["persistence","learning-series"]
draft: false
---

## كيفاش خدام الـ B-Tree

الـ B-Tree index ماشي غير binary tree عادية. هو multi-way balanced search tree مصمم باش ينقص من الـ disk I/O. بلاصة ما يكون عندو غير جوج ديال الدراري (children) فكل node، الـ B-Tree node كيكون فيه بزاف ديال keys و pointers. هادشي كيخلي الـ database توصل لملايين ديال السطور فخطوات قليلة بزاف.

ملي كتقلب على شي قيمة، الـ engine كيبدا من الـ root، كيقارن القيمة اللي بغيتي مع الـ keys اللي فـ node، وكيتبع الـ pointer للـ child page اللي مناسبة. هاد العملية كتبقى حتى كيوصل لـ leaf node، اللي فيه الـ pointer نيشان للسطر اللي كاين فـ table (اللي كنسميوه heap).

## الـ Selectivity وقرار الـ Scan

Selectivity ديال query كتخص النسبة المتوقعة ديال rows اللي كيطابقو predicate؛ عدد values المختلفة غير statistic كتعاون نحسبوها. إلا معظم rows كيطابقو، sequential scan تقدر تكون أرخص من بزاف heap lookups. إلا قليلين، index تقدر تعاون. حتى percentage ما كتفرضش plan: الحجم وorganization وstatistics وcache وcolumns المختارين كيأثرو.
## الـ Composite Indexing ومشكل الترتيب

فاش كدير index على بزاف ديال الـ columns (composite index)، الترتيب ديالهم مهم بزاف. الـ index كيكون مرتب lexicographically. مثلاً، إلا درتي index على `(tenant_id, created_at)`، البيانات كتكون مرتبة هي الأولى بـ tenant، وداخل كل tenant كتكون مرتبة بـ time.

تخيل هاد scenario: عندك audit log وبغيتي تجبد logs ديال tenant واحد، مفلترين بـ time range، ومرتبين من الجديد للقديم.

**الـ Query:**
`SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

### تحليل الاختيارات ديال الـ Index

1. **Index على `(created_at)`**: الـ engine غيلقى الـ time range، ولكن خاصو يفلتر logs ديال كاع الـ tenants اللي جاو فهاديك الوقيتة. I/O غيكون طالع.
2. **Index على `(tenant_id)`**: الـ engine غيلقى كاع الـ logs ديال 'T1'، ولكن خاصو يرتبهم بـ time فـ memory (filesort).
3. **Composite Index على `(tenant_id, created_at)`**: هادا هو أحسن اختيار. الـ engine كينقز نيشان لبلاصة 'T1'. وبما أن الـ entries ديال 'T1' ديجا مرتبين بـ `created_at` فـ index، الـ engine كيقرا الـ range وكيرجع النتائج مرتبة بلا ما يحتاج يدير عملية Sort بوحدها.

## مثال تطبيقي: EXPLAIN Plan Trace

نفترضو عندنا table `audit_logs` فيها مليون سطر.

**الحالة A: ماكاينش index أو كاين غير على `(created_at)`**
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **النتيجة:** `Seq Scan on audit_logs (cost=0.00..25000.00 rows=5000 width=120) -> Filter: (tenant_id = 'T1' AND created_at > '2023-01-01') -> Sort: created_at DESC`
*   **المعنى:** الـ DB قرات table كاملة ورتبات النتائج فـ RAM. هادشي ثقيل وكيستهلك memory.

**الحالة B: Composite Index على `(tenant_id, created_at)`**
`CREATE INDEX idx_tenant_time ON audit_logs (tenant_id, created_at);`
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **النتيجة:** `Index Scan using idx_tenant_time on audit_logs (cost=0.42..800.00 rows=5000 width=120) -> Index Cond: (tenant_id = 'T1' AND created_at > '2023-01-01')`
*   **المعنى:** الـ DB استعملات الـ B-Tree باش تمشي لـ 'T1'، قرات الـ range المرتب، وتفادت عملية الـ Sort بمرة.

## تكلفة الـ Write والـ Trade-offs

الـ indexes ماشي فابور. أي `INSERT` أو `UPDATE` أو `DELETE` فـ table `audit_logs` كيفرض على الـ database تحدّث الـ B-Tree. هادشي كيعني خاصها تلقى الـ leaf node المناسب وممكن تضطر تقسم الـ nodes باش تحافظ على التوازن (balance). فـ audit log اللي فيه الـ writes بزاف، كثرة الـ indexes غتثقل الـ ingestion performance.

## تمرين

Index على (status, user_id) مع equality على بجوج كتسمح lookup مركزة، وخا ترتيب WHERE تبدل. Planner تقدر تختار plan أخرى. Predicate على user_id بوحدها ناقصها equality على leading column، وتقدر تحتاج scan أوسع. PostgreSQL 18 تقدر حتى تفكر فـ B-tree skip scan إلا leading column فيها values مختلفة قليلة. راجع version وEXPLAIN بلا ما تقول index عمرها تعاون.

Plans لفوق illustrations ماشي benchmarks ولا output مضمونة. Sort تقدر تستعمل disk وindex تقدر تتقرا بالعكس. Update ديال columns ماشي indexed تقدر فبعض الحالات تستعمل HOT فـ PostgreSQL بلا تعديل كاع indexes. قيس read benefit وwrite cost بـ data ممثلة.

## باش تزيد تفهم

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL B-tree indexes](https://www.postgresql.org/docs/current/btree.html)
