---
title: "شنو كيدير @RequestBody بالضبط؟"
description: "شرح مفصل كيفاش Spring Boot كيحول JSON اللي جاي فـ HTTP request لـ Java objects باستعمال message converters."
pubDate: 2026-10-09T07:48:00.000Z
translationKey: 064-what-does-requestbody-actually-do
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app). واحد الموظف صيفط طلب فيه سمية السلعة والكمية على شكل JSON. فـ Postman كتشوف غير نص، ولكن فـ Java controller كتلقى object سميتو `PurchaseRequest`. كيفاش هاد النص اللي جاي فـ network packet كيولي object مقاد؟ هنا فين كيجي الدور ديال `@RequestBody`.

## كيفاش خدامة هاد العملية
ملي كدير `@RequestBody` لشي parameter فـ controller، كتقول لـ Spring: "ماتقلبش على هاد المعلومات فـ URL ولا فـ headers، قلب عليها فـ body ديال request". Spring ماكيديرش هادشي بوحدو، كيخدم بواحد السيستيم سميتو `HttpMessageConverter`. فـ Spring Boot، كيكون Jackson هو اللي خدام default. ملي كتوصل request فيها `Content-Type: application/json` ، Spring كيخدم بـ `MappingJackson2HttpMessageConverter` باش يقرى داك النص ويحولو لـ Java fields.

## مثال تطبيقي: طلب شراء
نفترضوا أن مستخدم صيفط طلب شراء بهاد الـ JSON: `{"item": "Laptop", "quantity": 1}`.

```java
@PostMapping("/requests")
public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest request) {
    return ResponseEntity.ok("وصلنا الطلب ديال " + request.getItem());
}

// DTO باستعمال Java Record باش يكون immutable
public record PurchaseRequest(String item, int quantity) {}
```

**النتيجة:** Spring كيقرا الـ JSON، كيصاوب instance من `PurchaseRequest` وكيحطها فـ method. إلا كانت السميات فـ JSON هي نفسها اللي فـ record، كيتعمر الـ object كامل.

## غلط شائع: نسيان الـ Getters ولا Default Constructor
بزاف ديال المطورين كيخدمو بـ classes عاديين بلاصة records وكيساو يديرو constructeur خاوي (no-args constructor). حيت Jackson كيصاوب الـ object هو الأول عاد كيعمر fields، إلا مالقاش constructeur غادي يعطيك `HttpMessageNotReadableException`.

**التصحيح:** أحسن حاجة تخدم بـ Java Records (كيفما فالمثال) ولا تأكد أن الـ POJO ديالك فيه public no-args constructor و getters/setters.

## Validation و Binding
خاصك تعرف بلي `@RequestBody` كيدير غير التحويل (conversion). إلا صيفط شي حد `{"item": "", "quantity": -5}`، Spring غادي يصاوب الـ object حيت الـ JSON صحيح تقنياً. باش تمنع هادشي، خاصك تزيد `@Valid` ديال Jakarta Bean Validation مع `@RequestBody`.

## تمرين تطبيقي
إلا صيفط client واحد الـ request فيها `Content-Type: text/plain` ولكن الـ controller ديالك فيه `@RequestBody` لـ Java object، شنو غادي يوقع؟

**الجواب:** Spring غادي يرجع error `415 Unsupported Media Type` حيت مالقاش `HttpMessageConverter` اللي يقدر يحول نص عادي لـ Java object.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
