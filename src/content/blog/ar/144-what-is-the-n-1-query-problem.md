---
title: "شنو هو مشكل N+1 Query؟"
description: "شرح مفصل لواحد الفخ ديال الأداء اللي كيخلي طلب واحد يدير مئات ديال لي ريكويط (queries) زايدين فـ base de données."
pubDate: 2026-10-12T15:48:00.000Z
translationKey: 144-what-is-the-n-1-query-problem
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). بغيتي تخرج ليستة فيها 50 طلب شراء، ومع كل طلب بغيتي تبين سمية manager اللي خاصو يوافق عليه. كاتجيب الطلبات، وكادير عليهم loop فـ الكود، وكتعيط لـ `request.getManager().getName()`. هنا غاتلقى فـ logs بلي كاينين 51 ريكويط مشاو لـ PostgreSQL: وحدة باش تجيب الطلبات، و 50 وحدة باش تجيب كل manager بوحدو. هذا هو مشكل N+1.

## كيفاش كيوقع هادشي (Lazy Loading)
فـ JPA و Hibernate، العلاقات ديال `@ManyToOne` غالباً كيكونوا EAGER، ولكن `@OneToMany` كيكونوا LAZY. ملي كنستعملو Lazy loading، Hibernate مكيجيبش المعلومات ديال العلاقة ديك الساعة، كيدير بلاصتها واحد 'proxy'. والريكويط SQL مكاتخرج حتى كتعيط لـ getter ديال داك proxy. إيلا كنتي كادير loop على N ديال لي entities، Hibernate كيدير 1 ريكويط لليستة و N ديال لي ريكويط للبيانات اللي مرتبطة بها.

## مثال تطبيقي
نشوفو `PurchaseRequest` و `Manager`. إيلا خدمتي بـ `findAll()` عادية:

```java
// مثال توضيحي
List<PurchaseRequest> requests = repository.findAll(); // Query 1: SELECT * FROM purchase_request
for (PurchaseRequest req : requests) {
    System.out.println(req.getManager().getName()); // Query 2 to N+1: SELECT * FROM manager WHERE id = ?
}
```
النتيجة: إيلا عندك 100 طلب، غاتدير 101 ريكويط. هادشي كيتقل التطبيق بزاف حيت كيولي كاين ضغط كبير على الشبكة.

## غلط شائع: تبديل كلشي لـ EAGER
بزاف ديال المطورين كيحاولوا يحلوا هاد المشكل بـ `FetchType.EAGER`. هادشي غلط، حيت غاتولي ديما تجيب البيانات واخا ماتكونش محتاج ليها، وهذا كيضيع الذاكرة (memory) وكيقلل الأداء فـ بلايص خرين.

## الحل الصحيح: JOIN FETCH
الطريقة الاحترافية هي تستعمل JOIN FETCH فـ JPQL. هادشي كيقول لـ Hibernate يجيب العلاقة فـ ريكويط وحدة باستعمال JOIN.

```java
@Query("SELECT r FROM PurchaseRequest r JOIN FETCH r.manager")
List<PurchaseRequest> findAllWithManagers();
```
دابا غاتخرج ريكويط وحدة فقط: `SELECT r.*, m.* FROM purchase_request r JOIN manager m ON r.manager_id = m.id`.

## تمرين تطبيقي
عندك entity سميتها `Buyer` فيها ليستة `@OneToMany` ديال `Order`. بغيتي تخرج 10 ديال لي buyers مع لي commandes ديالهم بلا ما يوقع مشكل N+1. شنو هو الكلمة (keyword) اللي خاصك تزيد فـ JPQL؟

**الجواب:** خاصك تخدم بـ `JOIN FETCH` (مثلاً: `SELECT b FROM Buyer b JOIN FETCH b.orders`).

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
