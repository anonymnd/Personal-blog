---
title: "Entity vs DTO: علاش خاصنا بجوج؟"
description: "تعلم كيفاش تفرق بين السكيما ديال قاعدة البيانات والبيانات لي كتصيفط فـ API باستعمال Entities و DTOs."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 057-entity-vs-dto-why-do-we-need-both
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال المشتريات (procurement app). الـ Entity ديال `PurchaseRequest` فيها معلومات داخلية حساسة، بحال الـ audit log ولا الـ ID ديال القاعدة. إلا صيفطتي هاد الـ Entity نيشان من الـ controller، غادي تكون كشف السكيما ديال الـ DB ديالك للمستخدم، وتقدر تسرب معلومات لي ما خاصوش يشوفها.

## الدور ديال الـ Entity
الـ Entity هي مراية ديال الجدول لي كاين فـ database. فـ Spring Boot، كنستعملو `jakarta.persistence` باش نحددوا السكيما ونحكمو فـ دورة حياة البيانات. الـ Entities مصاوبين باش يتسيفاو فـ DB، وعادة كيكون فيهم علاقات معقدة (بحال `@OneToMany`) لي تقدر تدير مشاكل ديال recursion فاش كتحول البيانات لـ JSON.

## الدور ديال الـ DTO
الـ DTO (Data Transfer Object) هو عبارة عن Java Record ولا POJO بسيط، الخدمة ديالو هي ينقل البيانات بين الطبقات. الـ DTO ما عندوش علاقة بـ persistence. كيخليك تصاوب الشكل ديال البيانات لي محتاجو الـ frontend بالضبط. مثلا، الـ Entity فيها object ديال `User` كامل، ولكن الـ DTO يقدر يكون فيه غير `userName` كـ string.

## مثال تطبيقي: طلب شراء
نشوفو حالة فين manager كيوافق على طلب شراء. الـ Entity فيها كاع التفاصيل، ولكن الـ DTO كيصيفط غير لي مهم.

```java
// موديل ديال الـ Database
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item;
    private Double amount;
    private String internalAuditNote; // معلومة حساسة!
}

// موديل ديال الـ API (DTO)
public record PurchaseRequestDTO(String item, Double amount) {}
```

فاش الـ controller كيتوصل بطلب، كيحول الـ DTO لـ Entity عاد كيعيط لـ `repository.save()`. هكا كنضمنو بلي `internalAuditNote` ما يقدرش يبدلها المستخدم من الـ API.

## غلط شائع: ترجع الـ Entity نيشان
بزاف ديال المطورين كيرجعو الـ Entity فـ `@RestController`. هادشي كيؤدي غالبا لـ `LazyInitializationException` حيت Jackson (لي كيحول لـ JSON) كيحاول يوصل لبيانات lazy-loaded والـ session ديال DB تكون تسدات.

**التصحيح:** ديما حول الـ Entity لـ DTO فـ service layer قبل ما ترجعها لـ controller.

## تمرين تطبيقي
إلا كانت عندك Entity ديال `User` فيها `password` و `email` وبغيتي تعرض لستة ديال المستخدمين فـ صفحة عامة، واش تستعمل Entity ولا DTO؟

**الجواب:** خاصك تستعمل DTO لي ما فيهش الـ `password` باش تحمي الخصوصية.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
