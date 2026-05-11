---
title: "Java Records بالنسبة لـ DTOs: فوقاش كيكون الاستعمال ديالهم منطقي"
description: "تعلم كيفاش تستعمل Java Records باش تسهل الـ DTOs وعلاش ما خاصكش تستعملهم مع JPA entities."
pubDate: 2026-10-09T04:48:00.000Z
translationKey: 061-java-records-for-dtos-when-they-make-sense
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. باش تنقل هاد المعلومات من الـ Controller لـ Service layer، كنتي شحال هادي خاصك تصاوب POJO فيه fields privés، و getters، و `equals()` و `hashCode()`... هادشي كيخليك تكتب بزاف ديال السطور غير باش تهز 3 ديال المعلومات.

## شنو هما الـ Records؟
Java Records جاو فـ Java 16 باش يحيدو هاد التكرار. الـ Record هو عبارة عن data carrier ما كيتبدلش (immutable). غير كتكتب `record` في بلاصة `class` الـ compiler كيصاوب ليك automatically الـ constructor والـ getters وكلشي. هادشي كيخليهم مثاليين للـ DTOs حيت الـ DTO الهدف ديالو غير يهز الداتا من بلاصة لبلاصة بلا ما يغيرها.

## مثال تطبيقي في تطبيق الشراء
فالـ procurement app ديالنا، محتاجين `PurchaseRequestDTO` باش ناخدو سمية السلعة والكمية. عوض ما نديرو class طويلة، كنديرو record بسيط:

```java
public record PurchaseRequestDTO(String itemName, int quantity, String requesterId) {}
```

ملي الـ manager كيوافق على الطلب، الـ Controller كيستقبل JSON و Jackson كيردو record. حيت الـ record immutable، كنكونو هانيين بلي حتى واحد ما غادي يبدل `itemName` وسط الطريق قبل ما توصل للـ logic ديال الموافقة.

## الفرق بين Records و JPA Entities
واحد الغلط كيديروه بزاف ديال الناس هو ملي كيبغيو يستعملو Records كـ `@Entity` ديال JPA. هادشي ما خدامش حيت JPA كيحتاج constructor خاوي (no-args) و fields اللي ماشي final باش يخدم الـ lazy loading. الـ Records كلهم final، داكشي علاش ما كيخدموش مع Hibernate proxies. القاعدة هي: استعمل Records للـ API (DTOs) واستعمل classes عاديين للـ Database (Entities).

## جدول مقارنة

| الميزة | Java Record | Standard POJO |
| :--- | :--- | :--- |
| Immutability | كاينة (Final) | خاصك ديرها بيدك |
| Boilerplate | قليل بزاف | كثير |
| JPA Entity | ما صالحش | مثالي |
| الاستعمال | DTOs, API responses | Database Entities |

## تمرين تطبيقي
صاوب record سميتو `OrderResponseDTO` كيرجع `orderId` (String) و `status` (String).

**الجواب:** `public record OrderResponseDTO(String orderId, String status) {}`

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
