---
title: "علاش ddl-auto=validate مفيد"
description: "تعلم كيفاش تضمن بلي الـ entity mappings ديال Java متطابقين مع الـ schema ديال database بلا ما تخاطر بمسح البيانات."
pubDate: 2026-10-13T06:48:00.000Z
translationKey: 159-why-ddl-auto-validate-is-useful
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك درتي deploy لنسخة جديدة من application ديال الشراء (procurement app). زدتي column سميتها 'priority' فـ table `PurchaseRequest` باستعمال script ديال migration، ولكن نسيتي ما زدتيهاش فـ Java entity فواحد من الـ microservices. إلا خدمات الـ app وحاولت تجيب البيانات، تقدر تـ crash فوسط الخدمة. هنا فين كينفع `hibernate.hbm2ddl.auto=validate`.

## كيفاش خدامة الـ Validation
عكس `update` ولا `create-drop` اللي كيغيرو الـ structure ديال database، `validate` كيدير غير lecture seule. ملي كتبدا Spring Boot application، Hibernate كيقلب فـ `@Entity` classes وكيقارنهم مع داكشي اللي كاين فعلياً فـ database. كيشوف واش الـ tables كاينين، واش السميات ديال الـ columns صحاح، واش الـ types متطابقين. إلا لقى شي فرق، كيطلع `SchemaManagementException` وكيحبس الـ app باش ما تخدمش وهي غالطة.

## مثال تطبيقي: Purchase Request
نشوفو هاد الـ entity ديال `PurchaseRequest` اللي زدنا فيها field جديد:

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemDescription;
    private Double estimatedCost;
    // field جديد زدناه فـ Java ولكن مازال ما كاينش فـ DB
    private String requesterDepartment;
}
```

إلا درتي `ddl-auto=validate` والـ column `requester_department` ما كايناش فـ SQL table، غادي تطلع ليك فـ logs: `SchemaManagementException: Table PurchaseRequest column requester_department not found`. الـ app غادي تحبس ديك الساعة، وهادشي أحسن بزااف ملي تـ crash من بعد ملي شي user يـ submit طلب.

## غلط شائع: استعمال Update فـ Production
بزاف ديال المبتدئين كيخدمو بـ `ddl-auto=update` حيت ساهلة. ولكن `update` تقدر تزيد columns ولا تبدل constraints بلا ما ترد البال، وهادشي كيأثر على الـ performance. الحل هو تخدم بـ Flyway باش تدير الـ migrations، وتخلي `ddl-auto=validate` باش غير تأكد بلي الكود والـ DB متطابقين.

## مقارنة: Update vs Validate

| الميزة | ddl-auto=update | ddl-auto=validate |
| :--- | :--- | :--- |
| تغيير الـ DB | كيغير (كيضيف columns) | ما كيغير والو (قراءة فقط) |
| الأمان | خطر فـ Production | آمن بزاف |
| سرعة الديماراج | تقيل (كيقلب ويغير) | سريع (كيقلب فقط) |

## تمرين تطبيقي
**الحالة:** عندك entity سميتها `Buyer` فيها field `String email`. فـ database، الـ column سميتها `buyer_email`. وراك خدام بـ `ddl-auto=validate`.

**السؤال:** واش الـ application غادي تخدم عادي؟

**الجواب:** لا. Hibernate غادي يلاحظ بلي السمية ديال الـ field (اللي هي `email` بشكل افتراضي) ماشي هي السمية اللي فـ database (`buyer_email`) وغادي يوقع failure فـ validation.
