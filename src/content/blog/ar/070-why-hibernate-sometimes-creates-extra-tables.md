---
title: "علاش الـ Value Collections والـ Associations كيحتاجو جداول زايدة"
description: "شرح معمق لـ @ElementCollection و الـ embeddables والفرق بين الـ value types والـ entities في JPA."
pubDate: 2026-10-07T06:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
seriesOrder: 15
locale: ar
tags: ["spring-architecture","learning-series"]
draft: false
---

## الفرق بين الـ Value Types والـ Entities

في JPA، كاين فرق كبير بين **Entity** و **Value Type**. الـ Entity عندها هوية (Identity) يعني Primary Key اللي كيخلينا نتبعوها، نعدلوها، ونرجعو ليها من أي بلاصة في السيستيم. أما الـ Value Type، فهي كتعرف غير بالمعلومات اللي فيها. إلا لقيتي جوج Value Types عندهم نفس الداتا، راه كيتعبرو نفس الحاجة.

تخيل معايا `Product` (منتج). الـ `Supplier` (المورد) هو Entity حيت المورد كاين بوحدو وخا ميكونش مرتبط بشي منتج معين، وعندو ID ديالو. ولكن `Dimensions` (العبارات: الطول، العرض، العمق) أو لستة ديال `ColorLabels` (الألوان: أحمر، زرق) راهم Value Types. ما عندهم حتى معنى إلا إذا كانوا مرتبطين بمنتج معين.

## الدور ديال @ElementCollection

Mapping العادي ديال @ElementCollection كيخزن basic values ولا embeddables فجدول مربوط بالـ owner. هادا اختيار ديال mapping، ماشي أن DB ما تقدرش تخزن array ولا JSON فعمود واحد؛ هاد البدائل عندها mapping وtrade-offs ديال queries مختلفين.

Association كتشير لـ entities عندهم هوية مستقلة. Collection ديال values ما كتعطيش هوية entity مستقلة لكل قيمة؛ كيتبعو owner. الجدول ديالهم يقدر يبقى عندو primary key وunique constraints وindexes. حذف parent عبر lifecycle ديال entity كيحذف values التابعة؛ bulk ولا native deletes خاصك تراجع constraints والتنظيف ديالهم.
## مثال تطبيقي: عبارات وألوان المنتج

ها كيفاش كنصاوبو منتج فيه مجموعة ديال الألوان (Strings) ومجموعة ديال العبارات (Dimensions).

```java
import jakarta.persistence.*;
import java.util.*;

@Embeddable
public record Dimensions(double height, double width, double depth) {}

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private Set<String> colors = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_dimensions", joinColumns = @JoinColumn(name = "product_id"))
    private Set<Dimensions> dimensions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Supplier supplier;

    // Getters, Constructor
}

@Entity
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyName;
    // Getters, Constructor
}
```

### كيفاش كيبان هادشي في Database

إلا سجلنا منتج عندو ID `101` وألوان `{"Red", "Blue"}` وعبارات `Dimensions(10, 20, 30)`، الداتا غتكون بحال هكا:

**جدول `product`**
| id | name | supplier_id |
| :--- | :--- | :--- |
| 101 | Desk | 50 |

**جدول `product_colors`**
| product_id | color |
| :--- | :--- |
| 101 | Red |
| 101 | Blue |

**جدول `product_dimensions`**
| product_id | height | width | depth |
| :--- | :--- | :--- |
| 101 | 10.0 | 20.0 | 30.0 |

**جدول `supplier`**
| id | company_name |
| :--- | :--- | 
| 50 | OfficeCorp |

### شنو كتعني الجداول

هاد rows كيوصفو values تابعين للـ product، ماشي entities عندهم id مستقل. نسخ لون لمنتج آخر كيصاوب occurrence أخرى ديال القيمة، ما كينقلش هوية entity. SQL بالضبط وconstraints كيتعلقو بالـ mapping.

## مشاكل شائعة (Pitfalls)

إلا categories خاصهم id مشترك وتعديل مستقل وreferences من بزاف products، صاوب Category كـ entity. Relation تقدر تكون many-to-one ولا many-to-many ولا link entity، حسب domain. String label مكررة بوحدها ما كتفرضش entity.

بدل collection managed الموجودة بحذر بلا ما تبدل wrapper ديال Hibernate عشوائيا. تكلفة SQL كتعلق بنوع collection وequality ديال values وmapping ونسخة provider. clear/addAll ماشي دائما أسرع، وحذف قيمة وحدة فـ Java ما كيضمنش DELETE وحدة فـ SQL. شوف logs ديال تغييرات ممثلة قبل optimization.
## تمرين

Product كيخزن وصف ديال garantie بحال 12 شهر للقطع و36 شهر للخدمة. فهاد model هما values بلا id ديال عقد ولا lifecycle مستقل. اختار WarrantyPeriod كـ embeddable فيه durationMonths وcoverageType داخل @ElementCollection.

إلا حيدتي period من collection managed داخل transaction، من بعد flush وcommit خاص القيم المحفوظة توافق اللي بقاو. SQL ديال الحذف ولا إعادة الإدخال كتعلق بالـ mapping؛ راقبها بلا ما تضمن statement معينة. إلا garantie ولات عقد زبون كيتدار بشكل مستقل، عاود فكر فـ entity identity.

المثال كيستعمل record embeddable اللي كيدعمو Hibernate 6.6؛ راجع provider وspecification قبل ما تنقلو. Snippets ديال entities هما files منفصلين وناقصين accessors وhelpers ديال construction. فـ PostgreSQL، foreign key ما كتخلقش index بوحدها على referencing columns. شوف keys الموجودة وquery plans قبل ما تزيد index على product_id؛ scan ديال table صغيرة يقدر يبقى فعال.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
