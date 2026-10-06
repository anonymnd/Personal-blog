---
title: "شنو هو الـ ORM؟"
description: "دليل للمبتدئين باش يفهمو الـ Object-Relational Mapping وكيفاش كيربط بين الـ objects ديال Java والجداول ديال PostgreSQL."
pubDate: 2026-10-12T06:48:00.000Z
translationKey: 135-what-is-an-orm
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال الشراء (procurement app). فـ Java، عندك object سميتو `PurchaseRequest` فيه ليستة ديال السلع. ولكن فـ PostgreSQL، عندك جدول `requests` وجدول `request_items`. المشكل هو أن Java كتعامل بالأوبجيكت (objects)، ولكن PostgreSQL كتعامل بالسطور (rows) والعلاقات. باش تبقى تكتب SQL لكل حاجة باش تحول البيانات من الجدول لـ Java object، غادي تضيع الوقت وغادي تغلط بزاف.

## القنطرة بين جوج عوالم
الـ ORM (Object-Relational Mapper) هو واحد التقنية كتخليك تخدم مع الداتابيز باستعمال الـ object-oriented paradigm. بلاصة ما تبقى تكتب SQL فكل بلاصة، كتخدم بالأوبجيكت ديال Java، والـ ORM هو اللي كيتكلف يترجم داكشي لـ SQL. فـ Java، كاين JPA (Jakarta Persistence API) اللي هو عبارة على قوانين (specification)، وكاين Hibernate اللي هو التطبيق (implementation) اللي كيدير الخدمة فعلياً.

## كيفاش كيخدم هادشي
فـ ORM، كل class فـ Java كتمثل جدول فـ الداتابيز. مثلاً، `PurchaseRequest` غادي نديرو ليها `@Entity`. ملي كتبغي تسجل هاد الـ object، الـ ORM كيصاوب `INSERT` statement بوحدو.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    private String requesterName;
    private Double totalAmount;
    // Getters and setters
}
```
إلا عيطتي لـ `repository.save(request)`، Hibernate غادي يحولها لـ: `INSERT INTO purchase_request (requester_name, total_amount) VALUES (?, ?);`.

## غلط شائع: مشكل N+1
واحد الغلط كيديروه بزاف ديال المبتدئين هو ملي مكيردووش البال كيفاش كيتشارجاو البيانات. إلا كانت `PurchaseRequest` عندها بزاف ديال `Item` (One-to-Many)، JPA كيدير LAZY loading بـ default. إلا درتي boucle على 10 ديال الطلبات وبغيتي تشوف السلع ديالهم، الـ ORM يقدر يدير query وحدة للطلبات و 10 ديال الـ queries للسلع. هادشي هو اللي كنسميوه N+1 problem. الحل ماشي هو ترد كلشي EAGER، ولكن تخدم بـ "JOIN FETCH" باش تجيب كلشي فدقة وحدة.

## جدول ملخص
| المفهوم | طريقة SQL | طريقة ORM |
| :--- | :--- | :--- |
| جلب البيانات | `SELECT * FROM ...` | `repository.findById(id)` |
| إضافة البيانات | `INSERT INTO ...` | `entityManager.persist(object)` |
| العلاقات | Foreign Keys | Object References |

## تمرين تطبيقي
إلا كان عندك entity سميتو `User` وواحد آخر سميتو `Profile` وكل مستخدم عندو بروفيل واحد، شنو هي الـ annotation ديال JPA اللي خاصك تخدم بها فـ class `User` باش تربطهم؟

**الجواب:** `@OneToOne`.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
