---
title: "كيفاش تحول Database Model لـ JPA Entities"
description: "تعلم الطريقة الصحيحة باش تحول schéma ديال قاعدة البيانات لـ Java entities باستعمال مثال ديال تطبيق ديال الشراء (procurement)."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيتحيرو ملي كيبغيو يحولو diagramme ER لكود Java، وكيوليو غير يخمنو فين يديرو `@OneToMany` ولا `@ManyToMany`. المشكل هو كيفاش تحول cardinalités ديال database لعلاقات بين objects بلا ما تطيح في مشاكل ديال circular dependency.

## تحويل الجداول لـ Entities
كل table في الموديل الفيزيائي كتولي class في Java مديورة ليها `@Entity`. الساروت (primary key) كنعلموه بـ `@Id`. مثلا في تطبيق ديال الشراء، `Request` غتكون هي الـ entity الأساسية. خاصك تستعمل imports ديال `jakarta.persistence.*` باش تتبع المعايير الجديدة. كل column كتولي field private مع getter و setter.

## التعامل مع علاقات One-to-Many
في سيستيم ديال الشراء، `Manager` واحد يقدر يوافق على بزاف ديال `Requests`. في database، هادي كتكون foreign key في table ديال `Request`. في JPA، الـ entity `Request` هي اللي كتسمى 'owning side' حيت هي اللي هازة الساروت ديال لخر. كنستعملو `@ManyToOne` في `Request` و `@OneToMany(mappedBy = "manager")` في `Manager` باش نديرو علاقة bidirectional.

## حل مشكل Many-to-Many بـ Join Entity
إلا كانت `Request` فيها بزاف ديال `Products` و `Product` واحد يقدر يكون في بزاف ديال `Requests` ، هنا `@ManyToMany` كافية. ولكن، إلا بغيتي تزيد معلومات بحال 'الكمية' (quantity) ديال كل produit في كل طلب، خاصك تكريه entity جديدة سميتها `RequestItem`. هكا كنحولوا العلاقة لـ جوج ديال One-to-Many، وكتولي عندنا بلاصة فين نخزنو معلومات زايدة.

## مثال تطبيقي: Procurement Flow
نشوفو علاقة بين `Request` و `Buyer`.

```java
@Entity
public class Request {
    @Id @GeneratedValue
    private Long id;
    private String description;

    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private Buyer buyer;
}

@Entity
public class Buyer {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "buyer")
    private List<Request> assignedRequests;
}
```
النتيجة: table ديال `Request` غيكون فيها column سميتها `buyer_id` ، و الـ object ديال `Buyer` يقدر يوصل لجميع الطلبات ديالو عن طريق list.

## غلط شائع: نسيان mappedBy
واحد الغلط كيديروه بزاف هو ملي كينساو `mappedBy` في العلاقات bidirectional. بلا بيها، JPA كيسحاب ليه كاينين جوج علاقات مفرقين وكيحاول يكري table ديال jointure زايدة في database بلا فايدة.

## تمرين تطبيقي
السيناريو: `Department` واحد فيه بزاف ديال `Employees`. كيفاش غتـmapy الـ side ديال `Employee` في هاد العلاقة؟

الجواب: خاصك تستعمل `@ManyToOne` في الـ entity `Employee` مع `@JoinColumn(name = "dept_id")`.
