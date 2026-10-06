---
title: "كيفاش Spring كيحول JSON لـ Java Objects"
description: "شرح ديال كيفاش Spring Boot كيخدم بـ Jackson و HttpMessageConverters باش يرجع JSON اللي جاي فـ request لـ Java objects."
pubDate: 2026-10-09T10:48:00.000Z
translationKey: 067-how-spring-converts-json-into-java-objects
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال الشراء (procurement). واحد requester صيفط JSON فيه سمية المنتج والكمية لـ API ديالك. كتشوف data واصلة فـ network tab، ولكن كتساءل: كيفاش هاد النص (string) كيولي فجأة Java object نقدر نخدم بيه وندير ليه `.getProductName()`؟

## الدور ديال HttpMessageConverters
Spring Boot مكيحولش JSON بيده فكل controller. كيخدم بواحد السيستيم سميتو `HttpMessageConverters`. ملي كتوصل request فيها `Content-Type: application/json` ، Spring كيقلب فـ la liste ديال converters اللي عندو باش يلقى اللي كيقدر يتعامل مع هاد النوع ديال data ومع الـ Java class اللي حددتي فـ `@RequestBody`.

## Jackson: الموطور اللي خدام لداخل
بشكل افتراضي، Spring Boot كيجي معاه Jackson. Jackson هو الموطور اللي كيدير هاد العملية ديال 'binding'. كيستعمل reflection باش يشوف الـ Java class ديالك ويلاقى keys ديال JSON مع fields ديال Java. مثلا، يلا كان عندك key سميتو `requestDate` فـ JSON، Jackson كيقلب على field بنفس السمية أو setter method سميتها `setRequestDate()`.

## مثال تطبيقي: طلب شراء
نشوفو DTO (Data Transfer Object) بسيط ديال طلب شراء:

```java
public record PurchaseRequest(String item, int quantity, String requester) {}
```

ملي client كيصيفط هاد HTTP POST:
`{"item": "Laptop", "quantity": 5, "requester": "Alice"}`

Spring كيعيط لـ `MappingJackson2HttpMessageConverter`. Jackson كيصاوب instance من `PurchaseRequest` وكيعمر fields. النتيجة هي Java object واجد باش تخدم بيه فـ business logic.

## غلط شائع: نسيان الـ Default Constructor
يلا كنتي خدام بـ class عادية ماشي `record` ، بزاف كينساو يديرو constructeur بلا parameters. Jackson خاصو يصاوب object هو الأول عاد يعمرو. يلا درتي غير parameterized constructor، تقدر تطلع ليك `InvalidDefinitionException`.

**التصحيح:** ديما تأكد بلي الـ DTOs ديالك فيهم no-args constructor، أو خدم بـ Java Records حيت Jackson كيدعمهم دابا.

## تمرين تطبيقي
يلا كان عندك field فـ JSON سميتو `order_id` ولكن فـ Java سميتو `orderId` ، واش Spring غادي يعرف يربطهم بوحدو؟

**الجواب:** لا. Jackson كيقلب على سمية مطابقة تماماً. خاصك تزيد `@JsonProperty("order_id")` فوق الـ field فـ Java باش تگول ليه بلي هما نفس الحاجة.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
