---
title: "تتبع Entity ديال JPA: من Java لـ SQL"
description: "شرح مفصل لـ lifecycle ديال Hibernate، الحالات ديال entity، وكيفاش كيتحول object ديال Java لسطر في database."
pubDate: 2026-10-07T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
seriesOrder: 14
locale: ar
tags: ["spring-architecture","learning-series"]
draft: false
---

## الهندسة ديال Persistence

باش نفهمو كيفاش object ديال Java كيولي row في database، خاصنا نفرقو بين تلاتة ديال الطبقات: **JPA** (هي المواصفات/Interface)، **Hibernate** (هو اللي كيطبق داكشي/Engine)، و **Database** (فين كيتخزن داكشي، بحال PostgreSQL).

ملي كتخدم بـ `JpaRepository` ، راك كتواصل مع abstraction ديال Spring Data اللي كتدوز الخدمة لـ `EntityManager` ديال JPA. هاد `EntityManager` كيسير واحد الحاجة سميتها **Persistence Context**—تخيلها بحال cache ديال المستوى الأول اللي كيبقى عاقل على أي entity تشرجات أو تسيفات في transaction وحدة. هاد context هو "العقل" اللي كيقرر واش التغيير اللي درتي في Java خاصو يولي `UPDATE` في SQL.

## حالات Entity و Lifecycle

أي entity كتكون في وحدة من هاد الربعة ديال الحالات بالنسبة لـ Persistence Context:

1. **New (Transient):** الـ object يلاه تكرى (`new StockItem()`) ولكن مازال ما عندوش ID في database و Hibernate ما متبعوش.
2. **Managed:** الـ entity متبوعة. أي تغيير درتيه في fields ديالها، Hibernate غادي يعيق بيه (Dirty Checking) وغادي يصيفطو لـ DB ملي يوقع flush.
3. **Detached:** الـ entity عندها ID في database، ولكن Persistence Context تسد أو الـ entity تخرجت منو. التغييرات هنا Hibernate ما كيشوفهمش حتى دير ليها merge.
4. **Removed:** الـ entity مسجلة باش تمسح.

## كيفاش خدامة `repository.save()`

Spring Data save كيعيط لـ persist إلا اعتبر entity جديدة، وإلا كيستعمل merge. بالافتراضي كيشوف version إلا كانت من نوع ماشي primitive، ومن بعد واش id null. Persistable كتخليك تحدد هاد القرار براسك. إلا التطبيق كيعطي id قبل الحفظ، خاصك استراتيجية واضحة باش تعرف entity الجديدة.

persist كيخلي instance الجديدة managed؛ وقت SQL كيتعلق بتوليد id والـ flush. merge كينسخ الحالة لـ instance managed وكيرجعها. Object اللي كان detached كيبقى detached: استعمل النتيجة اللي رجعات. حتى واحد من هاد النداءات ما كيعني أن transaction تـcommitـات.
## استراتيجيات ID وتوقيت SQL

مع Hibernate وPostgreSQL وtransaction خدامة بـ AUTO العادي، IDENTITY غالبا كتحتاج INSERT بكري باش تجيب id. ما نعمموش نفس التوقيت على كاع providers ولا flush modes ولا configurations.

SEQUENCE كتفرق إعطاء id على إدخال row. Hibernate يقدر يطلب قيمة من sequence ولا يستعمل range ديجا خصصها، حسب optimizer وallocation size. Entity تقدر يكون عندها id قبل INSERT يتـflushـا. وجود id ما كيثبتش أن row كاينة ولا أن transaction تـcommitـات.
## مثال تطبيقي: Lifecycle ديال StockItem

كل trace لتحت كتخدم كاملة داخل transaction وحدة ديال service، مع Hibernate وPostgreSQL وAUTO العادي. Entity كتبقى managed حتى تسالي transaction. بلا هاد الحدود، repository تقدر تسالي transaction ديالها قبل ما ترجع؛ setter من بعدها ما كيتحفظش أوتوماتيكيا. فمثال merge، detached entity جاية من context قديم؛ بيانات client خاصها validation وتطبقها على entity محملة بلا merge عشوائي.

نتخيلو عندنا entity سميتها `StockItem`:

```java
@Entity
public class StockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String sku;
    private Integer quantity;

    // Getters, Constructor, etc.
}
```

### تتبع 1: أول Insert
1. `StockItem item = new StockItem("BOLT-01", 100);` → **الحالة: New**.
2. `repository.save(item);` → Hibernate لقاها جديدة → عيط لـ `persist()`.
3. حيت خدامين بـ `SEQUENCE` ، Hibernate كيجيب ID (مثلا `1`) وكيعطيه لـ `item`. **الحالة: Managed**. مازال ما خرج حتى SQL `INSERT`.
4. **Flush**: ملي كتسالي transaction أو كتعيط لـ `flush()`، Hibernate كيصاوب: `INSERT INTO stock_item (id, sku, quantity) VALUES (1, 'BOLT-01', 100);`.

### تتبع 2: تحديث Managed (Dirty Checking)
1. `StockItem item = repository.findById(1L).orElseThrow();` → **الحالة: Managed**.
2. `item.setQuantity(80);` → ما عيطنا لحتى method ديال repository. Hibernate كيقارن الحالة الحالية مع نسخة (snapshot) خداها ملي شارجا الـ entity.
3. **Commit**: ملي كيوقع commit، Hibernate كيعيق بالتغيير وكيدير: `UPDATE stock_item SET quantity = 80 WHERE id = 1;`.

### تتبع 3: Merge ديال نسخة Detached
1. entity مشات لـ UI، تبدلات، ورجعات. عندها ID ولكن ما بقاتش في session → **الحالة: Detached**.
2. `StockItem detachedItem = ...; // quantity ولات 50`
3. `StockItem managedItem = repository.save(detachedItem);` → Hibernate كيعيط لـ `merge()`.
4. Hibernate كيشارج السطر من DB، كيكوبي `50` في الـ managed instance، وكيرجعها ليك.
5. **Flush**: `UPDATE stock_item SET quantity = 50 WHERE id = 1;`.

## الفرق بين Flush و Commit

Flush كينفذ SQL ديال التغييرات اللي باقين داخل transaction الحالية؛ ما كيديرش commit. فمثال PostgreSQL هنا، transaction كتشوف تغييراتها ولكن transactions العاديين الآخرين ما كيشوفوش الكتابة اللي مازال ما تـcommitـاتش. الرؤية عموما كتعلق بـ isolation وبـ DB.

فـ AUTO العادي، commit كيدير flush للتغييرات managed اللي باقين. MANUAL وبعض configurations ديال read-only عندهم شروط أخرى. Flush يقدر ينجح ومن بعد يوقع rollback ولا يفشل commit.
## تمرين

داخل transaction Hibernate خدامة بـ AUTO العادي وPostgreSQL IDENTITY، حفظ StockItem جديدة ومن بعد حيدها قبل commit. توقع INSERT بكري باش تجيب id، ومن بعد DELETE ملي suppression تـflushـا. تأكد من logs ومن أن row ما بقاتش بعد commit. عاود مع SEQUENCE ولاحظ أن جلب id ما كيحتاجش بوحدو إدخال row. هاد التوقيت تابع للإعدادات، ماشي ضمان عام ديال JPA.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
