---
title: "علاش Hibernate كيكتب SQL فبلاصتك"
description: "فهم كيفاش Hibernate كيخليك تخدم بالأوبجيكت (Objects) بلا ما تبقى تكتب SQL يدوياً فكل حاجة."
pubDate: 2026-10-12T07:48:00.000Z
translationKey: 136-why-hibernate-generates-sql-for-you
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). كل مرة مدير كيوافق على طلب، خاصك تبدل الحالة (status)، تزيد تاريخ الموافقة، وتربطها بـ ID ديال المدير. باش تبقى تكتب `UPDATE` لكل حاجة بيدك غادي تمل وغادي تغلط بزاف. هنا فين كيجي الدور ديال Hibernate.

## الفرق بين Object و Relational
Java لغة ديال الأوبجيكت، ولكن PostgreSQL قاعدة بيانات relationnelle. فـ Java عندك أوبجيكت سميتو `PurchaseRequest` فيه ليستة ديال السلعة، ولكن فـ PostgreSQL عندك طابلو ديال `requests` وطابلو آخر ديال `request_items`. Hibernate هو اللي كيدير هاد الربط (mapping) باش ما تبقاش تعاود نفس الكود ديال SQL فالحوايج البسيطة.

## السر ديال Dirty Checking
أهم حاجة كيديرها Hibernate هي 'Dirty Checking'. ملي كتجيب شي entity فوسط transaction، Hibernate كياخد ليها نسخة (snapshot). إلا بدلتي شي قيمة باستعمال setter، Hibernate كيعيق بلي كاين فرق، وكيصاوب SQL `UPDATE` بوحدو ملي كتسالي الـ transaction.

## مثال تطبيقي: الموافقة على طلب
شوف هاد الكود الصغير:

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String status;
    // getters and setters
}

// فـ Service method
PurchaseRequest request = repository.findById(1L);
request.setStatus("APPROVED"); 
// ماشي ضروري تعيط لـ repository.save() أو تكتب UPDATE SQL
```
**النتيجة:** Hibernate كيقارن الحالة الجديدة (`APPROVED`) مع القديمة (`PENDING`) وكيصيفط لـ DB:
`UPDATE purchase_request SET status = 'APPROVED' WHERE id = 1;`

## غلط شائع: استعمال EAGER بزاف
بزاف ديال المبتدئين ملي كيوقع ليهم مشكل 'N+1' (يعني Hibernate كيدير بزاف ديال لي ريكويست)، كيمشيو يبدلو كاع `@OneToMany` لـ `FetchType.EAGER`. هادشي غلط حيت كيخلي Hibernate يدير `JOIN` كبار بزاف فكل مرة، وهادشي كيتقل التطبيق.

**التصحيح:** خلي الـ `LAZY` كيفما هو، واستعمل `JOIN FETCH` غير فاش تكون محتاج دوك البيانات فعلاً فشي ريكويست محددة.

## تمرين تطبيقي
إلا جبتي entity ديال `User` وبدلتي ليها الـ email، وساليتي الـ transaction بلا ما تعيط لشي ميثود ديال update، واش الـ DB غادي تتبدل؟

**الجواب:** إيه، حيت Hibernate عندو Dirty Checking اللي كيخلي SQL UPDATE يتصاوب ويتنفذ أوطوماتيكياً.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
