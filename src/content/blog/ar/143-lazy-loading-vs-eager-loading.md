---
title: "كيفاش تحل مشكلة N+1 Query في JPA"
description: "دليل تقني باش تنقص من عدد الطلبات لقاعدة البيانات باستعمال fetch plans و entity graphs."
pubDate: 2026-10-07T22:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
seriesOrder: 31
locale: ar
tags: ["persistence","learning-series"]
draft: false
---

## شنو هي مشكلة N+1؟

مشكلة N+1 كتوقع ملي التطبيق كيدير طلب واحد (Query) باش يجيب البيانات الأساسية (Parent)، ومن بعد كيدير N ديال الطلبات باش يجيب البيانات المرتبطة (Related entities) لكل سطر. هادشي كيوقع غالباً حيت `FetchType.LAZY` هو اللي خدام (وهو الديفولت في `@OneToMany`) أو ملي كيكون `FetchType.EAGER` ولكن الطريقة باش كنطلبو البيانات كتخلي Hibernate يدير select لكل عنصر بوحدو.

تخيل عندنا سيستيم ديال Tickets de support. عندنا `Ticket` و `User` (مول التيكيت). إلا جبنا 10 ديال التيكيتات وبغينا نعرفو شكون مول كل وحدة فوسط loop، Hibernate غادي يدير query وحدة للتيكيتات و 10 ديال الـ queries للمستخدمين.

## مثال تطبيقي: جلب التيكيتات

### الـ Entities

```java
@Entity
public class Ticket {
    @Id
    @GeneratedValue
    private Long id;
    private String subject;

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;

    // Getters, Constructor
}

@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;

    // Getters, Constructor
}
```

### السيناريو A: فين كاين المشكل (N+1)

ملي كنستعملو `findAll()` عادية أو JPQL بحال `SELECT t FROM Ticket t`:

1. `SELECT * FROM ticket;` → كيرجع لينا 10 ديال السطور.
2. فكل تيكيت، الكود كيعيط لـ `ticket.getOwner().getUsername()`.
3. Hibernate كيشوف بلي الـ `User` مازال ما تجابش من الداتابيز، فكيدير: `SELECT * FROM user WHERE id = ?;` (كتعاود 10 المرات).

**مجموع الطلبات: 11**

### السيناريو B: الحل باستعمال Fetch Plan

باش نحلّو هاد المشكل، ما كنبدلوش الـ mapping في الـ entity (حيت كيكون static)، ولكن كنبدلو الطلب (Query) باش يكون dynamic باستعمال `JOIN FETCH`.

```java
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT t FROM Ticket t JOIN FETCH t.owner")
    List<Ticket> findAllWithOwner();
}
```

**شنو كيوقع دابا:**
1. `SELECT t.*, u.* FROM ticket t INNER JOIN user u ON t.owner_id = u.id;` → كيجيب كلشي فدقة وحدة.

**مجموع الطلبات: 1**

## مشكل الـ Pagination و تكرار السطور

الـ `JOIN FETCH` كيحيد N+1، ولكن كيدير مشكل إلا كانت عندنا `@OneToMany` (مثلاً `Ticket` → `Comment`).

إلا درنا join fetch لـ collection، الداتابيز كترجع Cartesian product. إلا كانت تيكيت وحدة فيها 5 ديال الكومنتيرات، غادي يرجعو 5 ديال السطور لنفس التيكيت. إلا زدنا `Pageable` لهاد الـ query، Hibernate ما يقدرش يدير limit في الداتابيز حيت غادي يقطع الكوليكسيون. داكشي علاش كيجيب **كاع** السطور للميموار ويدير pagination في Java، وهادشي يقدر يسبب `OutOfMemoryError` إلا كانت الداتا كبيرة.

**الحل ديال Collections:** دير fetch على جوج مراحل. جيب الـ IDs ديال الـ parents هوما اللولين بالـ pagination، ومن بعد جيب الـ parents و الـ collections ديالهم باستعمال `IN` clause أو تريكل `batch size`.

## مقارنة ملخصة

| الاستراتيجية | عدد الطلبات | تأثير الميموار | فوقاش تستعملها |
| :--- | :--- | :--- | :--- |
| Lazy Loading | 1 + N | قليل | ملي كتجيب عنصر واحد |
| Eager Mapping | 1 + N (غالباً) | طالع | علاقات ديما محتاجهم |
| Join Fetch | 1 | متوسط | صفحات أو تقارير محددة |
| Entity Graph | 1 | متوسط | ملي كتبغي تحكم فـ fetch ديناميكياً |

## تمرين

**سؤال:** عندك `User` وعلاقة `@OneToMany` مع `Order`. بغيتي تخرج ليستة paginated فيها 20 مستخدم والطلبيات ديالهم. علاش `@Query("SELECT u FROM User u JOIN FETCH u.orders")` مع `Pageable` خطيرة، وشنو هو الحل الصحيح؟

**الجواب:** خطيرة حيت الـ join كيدير تكرار ديال المستخدمين على حساب شحال من order عندهم، وهادشي كيخلي Hibernate يدير pagination في الميموار (كتطلع Warning HHH000104). الحل هو تجيب الـ IDs ديال 20 مستخدم هوما اللولين بالـ pagination، ومن بعد دير query ثانية فيها `WHERE u.id IN :ids` مع `JOIN FETCH` باش تجيب الـ orders ديال دوك 20 مستخدم.

11-query trace كتفترض10 owners مختلفين ما محملينش وpersistence context خدامة ملي كتقراهم. Owners مشتركين ولا loaded كيقللو count. EAGER كتطلب availability ماشي JOIN معينة ولا N+1 دائما. Entity graph كتعبر على fetch requirements ما كتضمنش query وحدة. استعمل LEFT JOIN FETCH إلا tickets بلا owner خاصهم يبقاو. Collection fetch pagination تقدر warning ولا in-memory ولا failure حسب configuration؛ حافظ على page order فـ two-step وجرب actual SQL.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
