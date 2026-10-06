---
title: "شن كيدير @GeneratedValue بالضبط"
description: "شرح كيفاش JPA كيتكلف بـ primary key والفرق بين الطرق باش كيتصاوبو."
pubDate: 2026-10-09T11:48:00.000Z
translationKey: 068-what-generatedvalue-actually-does
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيسحاب ليهم بلي `@GeneratedValue` غير كتقول لقاعدة البيانات « صاوبي رقم »، ولكن الحقيقة هي أن كاين تنسيق معقد بين Java و Database. المشكل كيبان ملي كتلقى بلي application ديالك كتصيفط `INSERT` قبل ولا بعد الوقت اللي كنتي متوقع، على حساب strategy اللي ختاريتي.

## كيفاش خدامة
`@GeneratedValue` هي annotation ديال JPA اللي كتعطي المهمة ديال تحديد primary key لـ persistence provider (بحال Hibernate). بلا ما تبقى تعيط لـ `setId()` بيدك، provider هو اللي كيحدد القيمة على حساب `GenerationType`. هادشي كيضمن بلي كل ID يكون فريد بلا ما تضطر تحسب آخر رقم وصلتي ليه فـ code.

## مقارنة بين الطرق

| Strategy | كيفاش خدامة | التأثير على Performance |
| :--- | :--- | :--- |
| IDENTITY | auto-increment فـ DB | كتحبس batch inserts |
| SEQUENCE | sequence object فـ DB | سريعة وكتدعم batching |
| TABLE | table خاصة بـ IDs | تقيلة بزاف |
| AUTO | provider هو اللي كيختار | مكاتكونش مضمونة بين DBs |

## مثال تطبيقي: App ديال المشتريات
تخيل عندنا `PurchaseRequest` فين كل طلب خاصو ID. إلا خدمنا بـ `SEQUENCE` ، Hibernate كيقدر « يحجز » مجموعة ديال IDs قبل ما يصيفط البيانات لـ DB.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "proc_seq")
    @SequenceGenerator(name = "proc_seq", sequenceName = "purchase_request_seq", allocationSize = 50)
    private Long id;
    
    private String itemDescription;
    // Getters and setters
}
```
فـ هاد الحالة، إلا بغيتي تسجل 10 ديال الطلبات، Hibernate يقدر يعيط لـ DB مرة وحدة باش ياخد 50 ID، وهادشي كينقص من الضغط على الشبكة.

## غلط شائع: الفخ ديال Identity
بزاف كيخدمو بـ `GenerationType.IDENTITY` وكيستغربو علاش `saveAll()` تقيلة. حيت `IDENTITY` كتفرض على Hibernate يدير `INSERT` ديك الساعة باش يعرف الـ ID اللي عطاتو DB، وما كيقدرش يتسنى حتى لـ flush phase.

**التصحيح:** بدل لـ `SEQUENCE` إلا كانت DB ديالك كتدعمها (بحال PostgreSQL) باش تستافد من batching.

## تمرين تطبيقي
إلا كنتي خدام بـ `GenerationType.AUTO` وبدلتي DB من H2 لـ MySQL، علاش يقدر يتغير السلوك ديال IDs؟

**الجواب:** حيت `AUTO` كتخلي provider يختار. H2 تقدر تخدم بـ sequence، ولكن MySQL تقدر تبدل لـ identity ولا table، وهادشي كيغير الطريقة باش كيتعطاو IDs.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
