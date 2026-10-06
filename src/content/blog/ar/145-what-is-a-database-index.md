---
title: "شنو هو الـ Database Index؟"
description: "دليل مبسط باش تفهم كيفاش الـ index كيسرع جبدان ديال البيانات وشنو هما السلبيات ديالو."
pubDate: 2026-10-12T16:48:00.000Z
translationKey: 145-what-is-a-database-index
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك كتقلب على طلب شراء (procurement request) فواحد الأرشيف فيه 10,000 دوسي ديال الورق. إلا ما كانش عندك دليل، خاصك تشوف دوسي بدوسي من الأول حتى للخر—هادشي فـ database كيتسمى 'Full Table Scan'. هاد العملية تقيلة بزاف. الـ index هو بحال داك الفهرس اللي كيكون فآخر الكتوبة؛ كيعلم الـ database فين كاين المعلومة بالضبط باش تمشي ليها نيشان.

## كيفاش كيخدم هادشي
الـ index هو واحد الـ structure ديال البيانات بوحدها (غالباً كتكون B-Tree) كتحفظ القيم ديال واحد الـ column ومعاها واحد الـ pointer (عنوان) كيدينا للسطر فين كاين المعلومة فـ table. بلاصة ما تقلب table كاملة، الـ database كتقلب فـ index اللي كيكون مرتب، وهكدا كتلقى المعلومة فـ وقت قصير بزاف. ولكن، وخا كيسرع القراءة (Read)، كيرد الكتابة (INSERT, UPDATE, DELETE) تقيلة شوية حيت الـ index حتى هو خاصو يتحدث.

## مثال تطبيقي: App ديال المشتريات
نفترضو عندنا table سميتها `procurement_requests` فيها `id` و `requester_name` و `status`. إلا كنتي كدير هاد الـ query بزاف:

```sql
SELECT * FROM procurement_requests WHERE requester_name = 'Alice';
```

بلا index، PostgreSQL غادي يقلب كاع السطور. ولكن إلا درنا index:

```sql
CREATE INDEX idx_requester_name ON procurement_requests(requester_name);
```

الـ database دابا غاتصاوب ليستة مرتبة ديال السميات. ملي تقلب على 'Alice'، غاتمشي لـ index، تلقى العنوان ديال السطر، وتجبدو فـ رمشة عين.

## غلط شائع: كثرة الـ Indexes
بزاف ديال المبتدئين كيديرو index لكل column باش 'كلشي يولي سريع'. هادشي غلط. حيت كل index كياكل من المساحة ديال الديسك وكيتقّل عمليات الكتابة. إلا كترتي منهم، الـ app ديالك غاتولي تقيلة فاش تبغي تزيد بيانات جديدة.

**التصحيح:** دير index غير فـ الـ columns اللي كتستعملهم بزاف فـ `WHERE` أو `JOIN` أو `ORDER BY`.

## تمرين تطبيقي
عندك table سميتها `orders` فيها مليون سطر. ديما كتقلب بـ `order_date`. شنو هو الأمر اللي غاتستعمل باش تسرع هاد العملية، وشنو هو الضريبة اللي غاتخلص؟

**الجواب:** غاتستعمل `CREATE INDEX idx_order_date ON orders(order_date);`. الضريبة هي أن الـ SELECT غاتولي سريعة ولكن الـ INSERT و UPDATE غايوليو تقال شوية.

## باش تزيد تفهم

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
