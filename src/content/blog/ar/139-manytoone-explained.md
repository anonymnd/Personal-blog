---
title: "شرح @ManyToOne ببساطة"
description: "شرح مفصل كيفاش نربطو بزاف ديال Entities مع Entity وحدة باستعمال @ManyToOne في JPA."
pubDate: 2026-10-12T10:48:00.000Z
translationKey: 139-manytoone-explained
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال الشري (procurement). عندك بزاف ديال `PurchaseRequest` (طلبات الشراء)، ولكن كل طلب خاصو يكون تابع لـ `Department` (قسم) واحد. إلا درتي غير ID ديال القسم كـ long في Java، غادي تضطر تكتب SQL join كل مرة باش تجيب سمية القسم. هنا فين كينفعنا `@ManyToOne` باش نقدرو نديرو `request.getDepartment().getName()` بسهولة.

## كيفاش خدامة @ManyToOne
في JPA، هاد annotation كتقول لينا بلي بزاف ديال السطور في جدول واحد مرتبطين بسطر واحد في جدول آخر. في PostgreSQL، هادشي كيترجم لـ Foreign Key (FK) في الجدول اللي فيه `@ManyToOne`. ردو البال بلي JPA كيدير `FetchType.EAGER` بشكل تلقائي، يعني Hibernate كيجيب المعلومات ديال القسم في نفس الوقت اللي كيجيب فيه الطلب.

## مثال تطبيقي: طلبات الشراء
ها كيفاش نربطو الطلب مع القسم باستعمال `jakarta.persistence`:

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemDescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;
    
    // Getters and setters
}

@Entity
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // Getters and setters
}
```
**النتيجة:** في PostgreSQL، الجدول ديال `purchase_request` غادي يكون فيه column سميتو `dept_id` كيشير لـ ID ديال `department`. استعملنا `FetchType.LAZY` باش ما نجيبوش معلومات القسم من الداتابيز حتى نحتاجوهم فعلياً.

## غلط شائع: مشكلة N+1
بزاف ديال المطورين كيخليو `EAGER` أو كيبدلو كلشي لـ `EAGER` باش يهربو من `LazyInitializationException`. المشكل هو إلا جبتي 100 طلب، Hibernate يقدر يدير query وحدة للطلبات و 100 query أخرى باش يجيب كل قسم بوحدو، وهذا كيتقل application.

**الحل:** ديما استعمل `FetchType.LAZY` واستعمل "Join Fetch" في JPQL (مثلاً: `SELECT r FROM PurchaseRequest r JOIN FETCH r.department`) باش تجيب كلشي في query وحدة.

## تمرين تطبيقي
**سيناريو:** عندك Entity سميتها `Product` و وحدة أخرى سميتها `Category`. بزاف ديال المنتجات كينتميو لـ category وحدة. شكون فيهم اللي خاصو يكون فيه `@ManyToOne` ؟

**الجواب:** الـ `Product` هي اللي خاص يكون فيها `@ManyToOne` حيت هي اللي كتهز الـ foreign key ديال الـ category.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
