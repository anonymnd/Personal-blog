---
title: "علاش مخصكش ترجع JPA Entities نيشان فـ API ديالك"
description: "تعلم علاش خاصك تفرق بين الموديل ديال لاباز دو دوني والرد ديال API باستعمال DTO باش تفادى مشاكل السيكيريتي و l'erreur ديال serialization."
pubDate: 2026-10-09T02:48:00.000Z
translationKey: 059-why-returning-jpa-entities-directly-from-an-api-can-be-a-bad-idea
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على app ديال الشرا (procurement). عندك واحد l'entité سميتها `PurchaseRequest` فيها السمية ديال اللي طلب، الحاجة اللي بغا، وواحد الحقل سميتو `auditLog` كيكون داخلي. إلا رجعتي هاد l'entité نيشان من `@RestController` ، Jackson غادي يحول كلشي لـ JSON، وهكا غادي تخرج معلومات سرية ديال audit لليوزر بلا ما تحس.

## الفخ ديال Serialization
فاش Spring Boot كيرجع entity، Jackson كيحاول يقرا كاع les getters. إلا كانت عندك علاقة دائرية (circular reference)—مثلا `PurchaseRequest` مرتبطة بـ `User` وهاد الـ `User` عندو ليستة ديال `PurchaseRequests`—غادي يوقع ليك `StackOverflowError` حيت البرنامج كيبقى يدور فـ حلقة مفرغة.

## تسريب بنية لاباز دو دوني
les Entities تصاوبو باش يتعاملو مع لاباز دو دوني، ماشي مع الكليان. إلا عطيتيهم نيشان، كتولي الـ API ديالك مربوطة بـ structure ديال الجداول. إلا بدلتي سمية ديال شي column باش تنظم لاباز، غادي تهرس الـ API لݣاع الناس اللي خدامين بيها (mobile app ولا web).

## الحل هو DTO
الـ Data Transfer Objects (DTOs) كيكونوا بحال واحد العازل. بلاصت ما ترجع l'entité، كتحولها لـ Java Record بسيط. هكا كتتحكم بالضبط شنو بغيتي تخرج للناس.

```java
// JPA Entity
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item;
    private String internalNotes; // هادي خاصها تبقى مخبية
    // getters/setters
}

// DTO (Record)
public record PurchaseRequestDTO(Long id, String item) {}

// فـ Controller
@GetMapping("/{id}")
public PurchaseRequestDTO getRequest(@PathVariable Long id) {
    PurchaseRequest entity = repository.findById(id).orElseThrow();
    return new PurchaseRequestDTO(entity.getId(), entity.getItem());
}
```

## غلط شائع: الاعتماد على @JsonIgnore
بزاف ديال المطورين كيخدمو بـ `@JsonIgnore` باش يخبيو شي حقول. هاد الطريقة خدامة ولكنها globale. إلا كان Manager خاصو يشوف `internalNotes` ولكن اللي طلب (Requester) مخصوش يشوفها، `@JsonIgnore` ما تقدرش دير هاد الفرق. هنا فين كينفعو DTOs حيت كتقدر تصاوب view لكل دور.

## تمرين تطبيقي
**الوضعية:** عندك entity سميتها `User` فيها `id`, `username`, و `passwordHash`. بغيتي ترجع profile ديال اليوزر لـ frontend.
**السؤال:** علاش خطر ترجع l'entité `User` نيشان، وشنو هو الحل؟
**الجواب:** حيت غادي تخرج `passwordHash` فـ JSON. الحل هو تصاوب `UserDTO` record فيه غير `id` و `username`.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
