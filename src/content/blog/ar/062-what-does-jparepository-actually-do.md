---
title: "شنو كيدير JpaRepository بالضبط؟"
description: "شرح مبسط على كيفاش Spring Data JPA كيسير البيانات فـ Database بلا ما تكتب بزاف ديال الكود."
pubDate: 2026-10-09T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال الناس اللي عاد بداو كيسحاب ليهم `JpaRepository` بحال شي صندوق سحري. المشكل كيبدا ملي كدير `.save()` وكتسنى تشوف `INSERT` فـ logs ديك الساعة، ولكن مكاتلقى والو حتى كتسالي transaction، ولا ملي كتبدل شي حاجة وماتلقاهاش تبدلات فـ database.

## الطبقة ديال التجريد (Abstraction Layer)
`JpaRepository` ماشي class كتكتب ليها implementation، ولكن هي interface اللي Spring Data JPA كيتكلف يطبقها فـ runtime. هي فالحقيقة غير غلاف (wrapper) على `EntityManager`. بلاصة ما تبقى تعاود نفس الكود ديال transactions، هاد repository كيعطيك methods واجدين بحال `save()` و `findById()` و `delete()`، وهو اللي كيحولهم لـ JPQL queries.

## كيفاش خدامة save()
كاين واحد الغلط شائع هو أن `save()` ديما كدير `INSERT`. فالحقيقة، Spring Data JPA كيشوف واش entity جديدة. إلا كان ID ماكاينش (null)، كيعيط لـ `persist()`. وإلا كان ID ديجا كاين، كيعيط لـ `merge()`. 

واحد الحاجة مهمة: `merge()` ماشي غير كيبدل السطر فـ database، ولكن كيهز المعلومات من entity اللي عطيتيه وكيديرهم فـ نسخة أخرى اللي JPA كيكون مراقبها (managed). داكشي علاش خاصك ديما تاخد النتيجة اللي رجعات save: `entity = repository.save(entity);`.

## مثال: تطبيق ديال طلبات الشراء
تخيل عندنا app ديال procurement، فين الموظف كيدير طلب شراء `PurchaseRequest`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemName;
    private String status; // PENDING, APPROVED
    // getters/setters
}

// Repository
public interface RequestRepository extends JpaRepository<PurchaseRequest, Long> {}
```

إلا درتي `save()` لطلب جديد، JPA غادي يضرب database ديك الساعة باش يجيب ID حيت استعملنا `IDENTITY`. ولكن إلا بدلتي status لـ `APPROVED` وعاودتي درتي `save()`، هنا غادي يوقع `merge()`. والـ SQL `UPDATE` يقدر يتعطل حتى يوقع flush للـ session.

## غلط شائع: نسيان قيمة الرجوع
بزاف كيديرو `repository.save(myEntity)` وكيبقاو خدامين بـ `myEntity`. إلا كانت `save` دارت `merge` ، راه `myEntity` بقات detached، والobjet اللي رجعات save هو اللي managed. أي تغيير درتيه لـ `myEntity` من بعد ماديش يتسجل.

## تمرين تطبيقي
**الحالة:** عندك entity فيها ID كيخدم بـ `SEQUENCE`. درتي `save()` لـ entity جديدة. واش `INSERT` كيطرا ديك الساعة؟

**الجواب:** لا. مع `SEQUENCE` ، JPA كيقدر يجيب غير ID من sequence ويخلي entity فـ الميموار. الـ `INSERT` كيطرا غالباً حتى كيوصل الوقت ديال flush فـ لخر ديال transaction.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
