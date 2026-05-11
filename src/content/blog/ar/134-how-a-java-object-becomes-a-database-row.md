---
title: "كيفاش كيولي Java Object سطر في قاعدة البيانات"
description: "شرح مبسط للطريقة باش كيتحول Java entity لسطر (row) في PostgreSQL باستعمال JPA و Hibernate."
pubDate: 2026-10-12T05:48:00.000Z
translationKey: 134-how-a-java-object-becomes-a-database-row
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل عندك واحد الـ object سميتو `PurchaseRequest` في الكود ديالك. ملي كدير `repository.save(request)`، كيبان سطر جديد في PostgreSQL. بزاف ديال المبتدئين كيسحاب ليهم هادشي سحر، ولكن في الحقيقة هو عملية ديال mapping وتسيير الحالة (state management).

## الدور ديال JPA و Hibernate
الـ JPA هي غير مجموعة ديال القواعد (specification)، أما Hibernate هو الموطور (implementation) اللي كيدير الخدمة. Hibernate كيقرا annotations بحال `@Entity` و `@Id` باش يعرف كل field في Java شنو هي الـ column اللي كتقابلها في Database. هو بحال المترجم بين العالم ديال Java (Objects) والعالم ديال SQL (Tables).

## الـ Persistence Context و Dirty Checking
ملي كيكون الـ object مـ géré من طرف Hibernate، كيكون ساكن في واحد البلاصة سميتها Persistence Context. Hibernate كياخد نسخة (snapshot) من الحالة الأولى ديال الـ object. إلا بدلتي شي حاجة بـ setter، الـ "dirty checking" كيعيق بلي كاين فرق بين الحالة الحالية والنسخة اللي كانت. وملي كتسالي الـ transaction، Hibernate كيصيفط `UPDATE` غير للحوايج اللي تبدلو.

## مثال ديال تطبيق ديال الشراء (Procurement)
نشوفو مثال ديال `PurchaseRequest` اللي مرتبطة بـ `User` (اللي طلب السلعة).

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String itemDescription;
    
    @ManyToOne // هادي كتكون EAGER بـ default
    private User requester;
    
    // Getters and setters
}
```
ملي كدير save، Hibernate كيشوف `@ManyToOne` وكيجيب الـ ID ديال الـ `User` وكيحطو في الـ foreign key column اللي سميتها `requester_id` في الجدول ديال الطلبات.

## غلط شائع: مشكل N+1
بزاف كيغلطو ملي كيخليو الـ fetch plans كيفما هي. مثلاً إلا كان عندك `User` عندو `@OneToMany` ديال `PurchaseRequest` (اللي كتكون `LAZY` بـ default)، وجيتي تدور على 10 ديال users باش تشوف طلباتهم، Hibernate يقدر يدير query وحدة للـ users و 10 ديال queries خرين للطلبات. باش تحل هاد المشكل، ما تردش كلشي `EAGER` حيت غيتقال السيستيم، ولكن استعمل "join fetch".

## تمرين تطبيقي
**الحالة:** عندك entity سميتها `PurchaseRequest` وبغيتي تزيد فيها ليستة ديال tags (مثلاً "Urgent", "IT-Dept") ولكن هاد tags ماشي entities مستقلين.

**الجواب:** خاصك تستعمل `@ElementCollection`. هادي كتخليك تخزن قيم بسيطة في جدول بوحدو بلا ما تحتاج تعطي لكل قيمة identity ديال entity مستقلة.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
