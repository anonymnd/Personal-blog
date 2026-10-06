---
title: "الفرق بين Request DTO و Response DTO"
description: "تعلم علاش خاصك تفرق بين DTO ديال الطلب (Request) و DTO ديال الجواب (Response) باش تحمي البيانات ديالك وتخلي الـ API مستقرة."
pubDate: 2026-10-09T01:48:00.000Z
translationKey: 058-request-dto-vs-response-dto
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app) فين الموظف كيصيفط طلب شراء. تقدر تفكر تستعمل `PurchaseRequestDTO` واحد باش تستقبل الطلب وباش ترجع التأكيد. ولكن غادي تكتشف بلي الموظف ما خاصوش يشوف `approvalStatus` (حالة الموافقة) فاش يلاه كيصيفط الطلب، وما بغيتيهش حتى هو يقدر يزور الحالة ويصيفط «approved» فـ request body باش يوافق على الطلب ديالو راسو.

## شنو هو الفرق الأساسي

الـ Request DTO مديور باش نتحققو من البيانات اللي جاية (validation) ونعرفو شنو بغا المستخدم. فيه غير الحقول اللي مسموح للمستخدم يصيفطها. أما الـ Response DTO فمديور باش نعطيو المعلومات اللي مسموح للمستخدم يشوفها، وبالطريقة اللي مناسبة ليه.

## علاش هاد التفرقة مهمة

إلا استعملتي نفس الـ Object للي جهات بجوج، غادي تربط الـ API ديالك بزاف مع الداتا لي لداخل (tight coupling). إلا زدتي شي معلومة سرية فـ entity ودرتيها فـ DTO مشترك، تقدر تسرب ديك المعلومة بلا ما تحس. زيد عليها أن الـ validation (بحال `@NotNull`) كتكون ضرورية فـ request ولكن ما عندها حتى معنى فـ response.

## مثال تطبيقي: طلب شراء

فـ نظام المشتريات، الداتا اللي كدخل خاصها تكون قليلة، واللي كتخرج خاصها تكون مفصلة.

```java
// Input: غير داكشي اللي كيصيفط المستخدم
public record PurchaseRequestDTO(
    String itemName,
    int quantity,
    double estimatedPrice
) {}

// Output: داكشي اللي كيرجع السيستيم
public record PurchaseResponseDTO(
    Long requestId,
    String status,
    LocalDateTime submissionDate,
    String itemName
) {}
```

فاش الـ controller كيتوصل بـ `PurchaseRequestDTO` كيحولو لـ entity، كيسجلو، ومن بعد كيحول ديك الـ entity لـ `PurchaseResponseDTO` باش يرجع الـ ID اللي تكرى والـ status اللي تدار ديفو.

## غلط شائع: الـ 'God DTO'

بزاف ديال المطورين كيديرو DTO واحد كبير فيه كاع الحقول ومردودين optional باش يخدم ليهم فكاع الحالات. هادشي كيدير خلط: «واش هاد الحقل null حيت المستخدم ما صيفطوش، ولا حيت السيرفر ما عمروش؟»

**التصحيح:** دير records مخصصين لكل عملية. استعمل `PurchaseCreateRequest` و `PurchaseDetailsResponse` باش يكون الـ API contract واضح.

## تمرين تطبيقي

إلا كان عندك `UserDTO` كتستعملو فالتسجيل (registration) وفـ عرض البروفايل، وزدتي فيه حقل `password` باش تسجل المستخدم، شنو غادي يوقع فاش ترجع نفس الـ DTO فـ عرض البروفايل؟

**الجواب:** غادي تسرب المودباس (حتى لو كان hashed) للمستخدم. الحل هو تفرقهم لـ `UserRegistrationRequest` (فيه المودباس) و `UserProfileResponse` (ما فيهش المودباس).

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
