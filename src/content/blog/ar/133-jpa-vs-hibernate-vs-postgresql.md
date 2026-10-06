---
title: "شنو الفرق بين JPA و Hibernate و PostgreSQL؟"
description: "شرح بسيط للفرق بين JPA و Hibernate و PostgreSQL وكيفاش كيخدمو مجموعين."
pubDate: 2026-10-12T04:48:00.000Z
translationKey: 133-jpa-vs-hibernate-vs-postgresql
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال المشتريات (procurement app)، فين الموظف كيصيفط طلب (request) والمدير كيوافق عليه. كتعرف بلي خاصك قاعدة بيانات، ولكن كتلقى هاد المصطلحات JPA و Hibernate و PostgreSQL مخلطين في الدروس. بزاف ديال المبتدئين كيسحاب ليهم بلي خاصهم يختارو واحد فيهم، ولكن في الحقيقة هما تلاتة ديال الطبقات (layers) كيكملو بعضياتهم.

## شنو هو JPA؟
JPA (Jakarta Persistence API) ماشي برنامج ولا مكتبة كتقدر تخدم بها مباشرة، بل هي مجرد "قانون" أو مواصفات (specification). تخايلها بحال شي كتاب ديال القواعد كيقول لينا كيفاش نحولو Java objects لجداول في قاعدة البيانات باستعمال annotations بحال `@Entity` و `@Id`. الميزة ديالها هي أن الكود ديالك كيولي Portable؛ يعني إلا تبعتي قواعد JPA، تقدر تبدل الموتور اللي خدام لتحت بلا ما تعاود تكتب الكود ديال البيزنس كامل.

## شنو هو Hibernate؟
Hibernate هو الموتور اللي كيطبق داكشي اللي قال JPA. هو اللي كيتسمى JPA provider. مثلا JPA كيقول "خاصنا نقدروا نسيفطو entity لقاعدة البيانات"، و Hibernate هو اللي كيكتب الكود ديال Java اللي كيحول هادشي لـ SQL `INSERT`. Hibernate فيه حتى شي حوايج زايدين على JPA بحال caching متطور. فاش كتخدم بـ Spring Boot و `JpaRepository` غالباً Hibernate هو اللي كيكون خدام في الكواليس.

## شنو هو PostgreSQL؟
PostgreSQL هو قاعدة البيانات (RDBMS) فين كيتخزنو المعلومات فعلياً في الديسك. Hibernate كيكتب SQL، ولكن PostgreSQL هو اللي كينفذ هاد SQL وكيجيري الجداول. واحد النقطة مهمة خاصك تعرفها: وخا Hibernate كيكريي Foreign Keys في PostgreSQL، راه PostgreSQL ما كيديرش Index لهاد السوارت (FK) بوحدو، وهادشي يقدر يخلي الـ queries يكونو تقال إلا ما زدتيش الـ index بيدك.

## مثال تطبيقي: طلب شراء
ناخدو مثال ديال `PurchaseRequest` و `User`. في JPA، كنديرو علاقة `@ManyToOne` بين الطلب والمستخدم.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String item;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private User requester;
}
```

**النتيجة:** JPA حدد العلاقة، Hibernate حولها لـ `JOIN` query، و PostgreSQL خزن `requester_id` في الجدول.

## غلط شائع: مشكل EAGER
بزاف ديال الناس كيوقع ليهم مشكل "N+1" (ملي كتجيب طلب واحد، التطبيق كيمشي يدير 100 query باش يجيب المستخدمين). الغلط اللي كيديرو هو كيردو كاع العلاقات `FetchType.EAGER` باش يحلوا المشكل. هادشي خطر حيت كيطلع بزاف ديال الداتا في الـ RAM بلا فايدة. الحل الصحيح هو تخدم بـ `JOIN FETCH` في الـ repository.

## تمرين تطبيقي
شكون هي الطبقة (layer) اللي مسؤولة على تخزين الداتا في الديسك وتنفيذ أوامر SQL؟

**الجواب:** PostgreSQL.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
