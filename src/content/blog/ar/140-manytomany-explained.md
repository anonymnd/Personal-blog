---
title: "شرح ديال @ManyToMany"
description: "دليل مبسط باش تفهم كيفاش تخدم بـ @ManyToMany في JPA و Hibernate مع PostgreSQL."
pubDate: 2026-10-12T11:48:00.000Z
translationKey: 140-manytomany-explained
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال الشراء (procurement)، فين واحد الطلب (Purchase Request) يقدر يكون فيه بزاف ديال السلع (Items)، وفي نفس الوقت، سلعة وحدة (مثلا 'Laptop') تقدر تكون موجودة في بزاف ديال الطلبات. إلا جربتي دير غير foreign key وحدة في جدول واحد، غادي تلقى بلي ما يمكنش تخزن ليستة ديال IDs. هنا فين كنحتاجو `@ManyToMany`.

## كيفاش خدامة هاد اللعيبة
في PostgreSQL، ما يمكنش تكون علاقة many-to-many مباشرة بين جوج جداول. خاصنا ضروري واحد الجدول ثالث كيتسمى 'Join Table'. هاد الجدول كيكون فيه غير جوج ديال foreign keys: وحدة كتشير للطلب ووحدة للسلعة. JPA كتسهل علينا هادشي؛ ملي كدير `@ManyToMany` في جوج entities، Hibernate هو اللي كيتكلف بهاد الجدول ديال الربط، كيزيد فيه السطور ملي كتزيد سلعة للطلب، وكيمسحهم ملي كتحيدها.

## مثال تطبيقي: تطبيق الشراء
ها كيفاش نطبقو هاد العلاقة بين `PurchaseRequest` و `Item`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "request_items",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<Item> items = new ArrayList<>();
}

@Entity
public class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @ManyToMany(mappedBy = "items")
    private List<PurchaseRequest> requests = new ArrayList<>();
}
```
في هاد المثال، `PurchaseRequest` هو اللي شاد العلاقة (owner). إلا زدتي `Item` في ليستة `items` ودرتي save، Hibernate غادي يزيد سطر في الجدول `request_items`.

## غلط شائع: التزامن ديال الجوايه بجوج
بزاف ديال الناس كيغلطو ملي كيزيدو element غير في جهة وحدة في الكود Java. مثلا كيدير `request.getItems().add(item)` وكيسا `item.getRequests().add(request)`. واخا Hibernate يقدر يسجلها في DB، ولكن objects اللي في الذاكرة (JVM) غيكونوا مخربقين، وهذا كيسبب مشاكل في logic ديال التطبيق.

## ملاحظة على الأداء
بشكل افتراضي، `@ManyToMany` كتخدم بـ `FetchType.LAZY`. يعني السلع ما كيتشارجاو من DB حتى كتعيط لـ `.getItems()`. رد بالك تبدل كلشي لـ `EAGER` غير باش تهنى من `LazyInitializationException` حيت غادي تولي تجيب آلاف السطور بلا فايدة وتثقل السيستيم.

## تمرين تطبيقي
**المطلوب:** عندك entity سميتها `User` و وحدة سميتها `Role`. المستخدم يقدر يكون عندو بزاف ديال الأدوار، والدور يقدر يكون عند بزاف ديال المستخدمين. شكون اللي خاصو يكون فيه `mappedBy` باش يكون `User` هو الـ owner؟

**الجواب:** الـ entity ديال `Role` هي اللي خاص يكون فيها `mappedBy = "roles"` (بافتراض أن السمية ديال field في `User` هي `roles`) باش يكون `User` هو الـ owner.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
