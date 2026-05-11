---
title: "الفرق بين ddl-auto=create و update و validate"
description: "فهم كيفاش كيتعامل Spring Boot مع schéma ديال la base de données باستعمال ddl-auto فاش كيكون التطبيق خدام."
pubDate: 2026-10-13T05:48:00.000Z
translationKey: 158-ddl-auto-create-vs-update-vs-validate
locale: ar
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك زدتي واحد field سميتو 'approvalDate' فـ l'entité ديال ProcurementRequest، ولكن فاش كتشعل l'application، كطلع ليك `SQLGrammarException` حيت ديك la colonne ما كايناش فـ la base de données. هادشي كيوقع حيت الكود ديالك و la base ما مفاهمينش.

## شنو هو ddl-auto
فـ Spring Boot، la propriété `spring.jpa.hibernate.ddl-auto` هي اللي كتقول لـ Hibernate كيفاش يتعامل مع la base de données فاش يلاه كيبدا l'app. هي اللي كتربط بين les entités Java و les tables SQL.

## مقارنة بين الطرق

| القيمة | شنو كدير | فين كنستعملوها |
| :--- | :--- | :--- |
| `create` | كتمسح كلشي وكتعاود تصاوب tables جداد | فالبداية ديال المشروع |
| `update` | كتزيد داكشي اللي ناقص بلا ما تمسح والو | فـ développement local |
| `validate` | كتشوف واش كاين تطابق، وإلا كتحبس l'app | فـ Production/Staging |

## مثال تطبيقي: App ديال Procurement
نفترضو عندنا app ديال الشراء فين `Requester` كيصيفط demande. إلا كنتي داير `ddl-auto=update` وزدتي field سميتو `status` فـ `ProcurementRequest` :

```java
@Entity
public class ProcurementRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemName;
    private String status; // field جديد |
}
```

فاش كتعاود تشعل l'app، Hibernate كيدير: `ALTER TABLE procurement_request ADD COLUMN status VARCHAR(255);`. l'app كتخدم عادي و data اللي كانت ديجا كتبقى بلاصة.

## غلط شائع: استعمال update فـ Production
بزاف ديال developers كيستعملو `update` فـ production باش يهربو من scripts. ولكن `update` ما كتعرفش تبدل سمية ديال column أو تبدل type ديال data. إلا بدلتي `itemName` لـ `productName` مثلاً، Hibernate غادي يصاوب column جديدة سميتها `productName` ويخلي القديمة عامرة data بلا فايدة.

**التصحيح:** استعمل `validate` فـ production. هكا l'app ما غاديش تخدم إلا كان schéma غلط، وهادشي كيخليك تخدم بـ Flyway باش تدير migrations مقادين.

## تمرين تطبيقي
l'app ديالك فيها `ddl-auto=validate`. زدتي `managerApproval` (boolean) فـ l'entité ولكن نسيتي ما درتيش SQL script فـ la base. شنو غادي يوقع فاش تشعل l'app؟

**الجواب:** l'app ما غاديش تخدم وغادي تعطيك `SchemaManagementException` حيت la base ما متطابقاش مع l'entité.
