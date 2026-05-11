---
title: "علاش Hibernate كيكريي طابلات زايدين"
description: "فهم كيفاش طرق الربط ديال collections و l'héritage كتخلي Hibernate يكريي tables de jointure بلا ما تطلب منهم."
pubDate: 2026-10-09T13:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك درتي علاقة `@ManyToMany` عادية ف الكود Java ديالك، ولكن ملي مشيتي تشوف la base de données، لقيتي واحد الطابلة تالتة ما كرييتيهاش نتا. كيبان بحال إلا Hibernate كيدير اللي بغا، ولكن هاد الطابلات الزايدين هما الطريقة باش كيتعالج الربط بين البيانات (relational mapping).

## ميكانيزم ديال Join Table
ف la base de données، العلاقة ديال many-to-many ما يمكنش تدار غير بـ column وحدة ف وحدة من الطابلات. باش ما يكونش تكرار ديال البيانات وتبقى la base normalisée، Hibernate كيكريي 'Join Table'. هاد الطابلة كتخدم بحال قنطرة، فيها غير les clés primaires ديال جوج ديال entities. إلا خدمتي بـ `@ManyToMany` بلا ما تحدد `@JoinTable` annotation، Hibernate كيكرييها راسو بسمية افتراضية بحال `Entity1_Entity2`.

## الربط ديال l'héritage
حاجة أخرى كتخلي Hibernate يكريي طابلات زايدين هي `@Inheritance`. إلا خدمتي بـ `InheritanceType.JOINED`، Hibernate كيكريي طابلة أساسية لـ parent class وطابلات بوحدهم لكل subclass. كل طابلة ديال subclass كيكون فيها غير داكشي اللي خاص بها و foreign key كيرجع لـ parent. هاد الطريقة مزيانة من ناحية التنظيم ولكن كتزيد عدد الطابلات ف la base.

## مثال تطبيقي: App ديال الشراء
تخايل عندنا système ديال الشراء فين `PurchaseRequest` تقدر يكون فيها بزاف ديال `Item`s، و `Item` واحد يقدر يكون ف بزاف ديال requests.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany
    private List<Item> items;
}

@Entity
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
```

**النتيجة:** Hibernate غادي يكريي 3 ديال الطابلات: `purchase_request` و `item` وواحد الطابلة مخبية سميتها `purchase_request_items`. هادي هي اللي كتربط بين الطلبات والسلع.

## غلط شائع: استعمال ManyToMany بزاف
بزاف ديال developers كيخدمو بـ `@ManyToMany` وخا تكون `@OneToMany` كافية. هادشي كيكريي طابلات زايدين اللي كيتقلو les requêtes.

**التصحيح:** إلا كانت العلاقة فعلاً one-to-many (مثلاً Request فيها بزاف ديال LineItems، ولكن LineItem كينتمي لـ Request وحدة)، خدم بـ `@OneToMany` و `@ManyToOne`. هكدا foreign key كيكون نيشان ف الطابلة ديال child، وما كتحتاجش لديك الطابلة القنطرة.

## تمرين تطبيقي
إلا كان عندك entity `User` و entity `Role` بيناتهم `@ManyToMany` وبغيتي الطابلة ديال الربط تكون سميتها `user_roles` ماشي السمية اللي كيعطي Hibernate، شنو هي l'annotation اللي خاصك تزيد؟

**الجواب:** خاصك تزيد `@JoinTable(name = "user_roles")` فوق الـ collection field ف l'entity.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
