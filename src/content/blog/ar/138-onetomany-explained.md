---
title: "شرح @OneToMany ببساطة"
description: "شرح مفصل كيفاش تخدم بـ @OneToMany في JPA مع Hibernate و PostgreSQL."
pubDate: 2026-10-12T09:48:00.000Z
translationKey: 138-onetomany-explained
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال procurement (المشتريات)، فين كاين Manager واحد كيسير بزاف ديال Purchase Requests. عندك les entités واجدين، ولكن ملي كتجي تجيب Manager، كتلقى راسك ماعارفش كيفاش توصل للـ list ديال requests ديالو بلا ما تكتب SQL queries بيدك. هنا فين كنحتاجو `@OneToMany`.

## كيفاش خدامة هاد اللعيبة
في JPA، `@OneToMany` كتعني أن entity وحدة مرتبطة بزاف ديال entities خرين. هاد العلاقة كتكون **LAZY** بشكل افتراضي. يعني Hibernate ماكيمشيش يجيب list ديال requests من PostgreSQL حتى كتعيط لـ getter method (مثلا `manager.getRequests()`). هادشي كيدار باش ما نعمروش الـ memory بحوايج ما محتاجينهمش دابا.

## مثال تطبيقي: نظام المشتريات
في التطبيق ديالنا، الـ `Manager` (واحد) عندو بزاف ديال `PurchaseRequest` (بزاف). باش ما نكريوش table ديال jointure زايدة، كنخدمو بـ `mappedBy` باش نقولو لـ JPA بلي `PurchaseRequest` هي اللي شادة العلاقة عن طريق `@ManyToOne`.

```java
@Entity
public class Manager {
    @Id @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<PurchaseRequest> requests = new ArrayList<>();
}

@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;
}
```
**النتيجة:** ملي كتسيف Manager مع list ديال requests، Hibernate كيسيف manager هو الأول، ومن بعد كيسيف requests وكيدير `manager_id` كـ foreign key كيشير لـ ID ديال manager.

## غلط شائع: مشكل N+1
بزاف ديال developers كيوقعو في مشكل N+1 ملي كيديرو loop على بزاف ديال Managers باش يجيبو requests ديالهم. Hibernate كيدير query وحدة باش يجيب N ديال managers، ومن بعد كيدير N ديال queries باش يجيب requests ديال كل واحد.

**الحل:** بلا ما ترد fetch type هو `EAGER` (حيت كيتقل السيستيم)، خدم بـ `JOIN FETCH` في JPQL query ديالك: `SELECT m FROM Manager m JOIN FETCH m.requests`.

## ملاحظة على PostgreSQL
خاصك تعرف بلي واخا JPA كيكريي Foreign Key في PostgreSQL، هاد الأخيرة ما كديرش index عليه بوحدها. إلا كنتي كتقلب بزاف على requests باستعمال manager، خاصك تزيد index لـ `manager_id` بيدك باش يبقى السيستيم سريع.

## تمرين تطبيقي
إلا كان عندك entity سميتو `Buyer` و entity آخر سميتو `Order` (واحد Buyer كيشد بزاف ديال Orders)، شكون فيهم اللي خاصو يكون فيه `mappedBy` باش تكون العلاقة bidirectionnelle؟

**الجواب:** الـ `Buyer` هو اللي خاص يكون فيه `@OneToMany(mappedBy = "buyer")` حيت `Order` هي اللي شادة الـ foreign key.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
