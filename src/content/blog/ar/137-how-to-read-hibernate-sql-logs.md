---
title: "كيفاش تقرا الـ SQL Logs ديال Hibernate"
description: "تعلم كيفاش تقرا الـ SQL لي كيخرج Hibernate باش تعرف فين كاين الثقل ومشاكل N+1 queries."
pubDate: 2026-10-12T08:48:00.000Z
translationKey: 137-how-to-read-hibernate-sql-logs
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

كتبتي code نقي فـ JPA repository ولكن application ديالك تقيلة. كتشك بلي Hibernate كيدير مئات ديال لي requête لواحد الطلب واحد، ولكن حيت SQL مخبي مورا abstraction layer، راك غادي غير عما. باش تفهم واش الـ fetch plans ديالك خدامين مزيان، خاصك ضروري تعلم تقرا هاد الـ logs.

## كيفاش تخدم الـ SQL Output
باش تشوف شنو واقع لداخل، خاصك تقاد `application.properties`. إلا درتي `spring.jpa.show-sql=true` غادي يبان ليك SQL فـ console ولكن كيكون مرون. باش تردو مقاد، زيد `spring.jpa.properties.hibernate.format_sql=true` و باش تشوف القيم (values) لي كيدوزو، خدم `logging.level.org.hibernate.orm.jdbc.bind=trace`.

## فهم الطريقة باش كيخرج الـ Log
ملي كتشوف الـ logs، كتلقى واحد الـ pattern: كاين `SELECT` ومن بعد منها سطور ديال `binding parameter`. Hibernate كيخدم بـ prepared statements باش يحمي الـ app و يزيد السرعة. عوض ما يحط القيم نيشان، كيدير علامات استفهام (?). الـ trace logs هما لي كيقولو ليك كل علامة باش تعوضات. إلا بانو ليك بزاف ديال SELECT متشابهين غير الـ IDs لي مبدلين، عرف بلي عندك مشكل N+1.

## مثال تطبيقي: Application ديال الشراء
تخيل عندك app ديال procurement فيها `PurchaseRequest` وكل طلب فيه بزاف ديال `RequestItem`. إلا جبتي 10 ديال الطلبات ودرتي عليهم loop باش تطبع items، الـ logs غادي يبانو بحال هكا:

```sql
-- requête وحدة باش تجيب الطلبات
SELECT * FROM purchase_request;
-- 10 ديال لي requête باش تجيب items ديال كل طلب
SELECT * FROM request_item WHERE request_id = 1;
SELECT * FROM request_item WHERE request_id = 2;
... (وهكا كمل)
```
هادشي كيبين بلي كاين مشكل Lazy Loading. الحل هو تخدم `JOIN FETCH` فـ JPQL باش تجمع كلشي فـ requête وحدة.

## غلط شائع: استعمال EAGER بزاف
بزاف ديال developers ملي كيشوفو هاد الـ logs كيمشيو يبدلو `@OneToMany` لـ `fetch = FetchType.EAGER`. هادشي غلط حيت Hibernate غادي يولي يجيب الـ collection ديما واخا ما محتاجهاش، وهادشي كيتقل الـ app ملي كتكبر data. الصحيح هو تخليها `LAZY` وتخدم fetch joins غير فاش تحتاجها.

## تمرين تطبيقي
إلا شفتي `binding parameter [1] as [101]` متبوعة بـ `SELECT` فـ table سميتها `request_item` شنو كيعني هادشي؟

**الجواب:** Hibernate كيدير requête باش يقلب على items لي مرتبطين بالـ ID رقم 101.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
