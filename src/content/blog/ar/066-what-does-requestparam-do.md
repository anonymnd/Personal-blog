---
title: "شنو كدير @RequestParam؟"
description: "تعلم كيفاش تجبد المعلومات من الـ URL باش ترد الـ controllers ديال Spring Boot ديناميكيين."
pubDate: 2026-10-09T09:48:00.000Z
translationKey: 066-what-does-requestparam-do
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app). واحد manager بغا يشوف لاليست ديال الطلبات، ولكن ماشي كلشي، بغا غير الطلبات ديال واحد القسم (department) محدد. إلا كانت الـ URL هي غير `/requests` غادي يطلع ليه كلشي. ولكن كيفاش نقولو لـ Spring Boot يفلتر لينا غير « IT » أو « HR »؟ هنا فين كنحتاجو `@RequestParam`.

## كيفاش خدامة Query Parameters
`@RequestParam` هي واحد الـ annotation كنستعملوها في الـ controllers ديال Spring Boot باش نجبدو قيم من الـ query string ديال الـ URL. الـ query string هو داك الجزء اللي كيجي مورا العلامة ديال `?`. مثلا، في `/requests?dept=IT` الـ key هو `dept` والـ value هي `IT`. Spring Boot كياخد هاد القيمة وكيديرها نيشان في الـ parameter ديال الـ method في الجافا.

## مثال تطبيقي
في تطبيق ديال الشراء، تقدر دير method باش تفلتر الطلبات بحال هكا:

```java
@GetMapping("/requests")
public List<Request> getRequests(@RequestParam(name = "dept") String department) {
    // هنا كدير اللوجيك باش تفلتر الطلبات على حساب القسم
    return requestService.findByDepartment(department);
}
```
إلا دخل المستخدم لـ `/requests?dept=Finance` الـ variable `department` غادي تولي فيها "Finance".

## التعامل مع parameters اللي ماشي ضروريين
في العادة، `@RequestParam` كتكون ضرورية (required). إلا دخل المستخدم لـ `/requests` بلا `?dept=...` غادي تطلع ليه erreur 400 Bad Request. باش نتفاداو هادشي، نقدروا نديرو `required = false` أو نعطيو `defaultValue`.

| الخاصية | التأثير | شنو كيوقع إلا كانت غايبة |
| :--- | :--- | :--- |
| `required = true` | العادي | 400 Bad Request |
| `required = false` | اختيارية | الـ Variable كتكون `null` |
| `defaultValue` | قيمة احتياطية | الـ Variable كتاخد القيمة الافتراضية |

## غلط شائع: الخلط بينها وبين @PathVariable
بزاف ديال الناس كيغلطو وكيديرو `@RequestParam` فاش كتكون القيمة جزء من الـ path ديال الـ URL (مثلا `/requests/123`) ماشي في الـ query string. `@PathVariable` كنستعملوها للـ structure ديال الـ path، و `@RequestParam` للفيلتراج أو المعلومات الاختيارية.

**التصحيح:** استعمل `@RequestParam` لـ `?key=value` واستعمل `@PathVariable` لـ `/{id}`.

## تمرين تطبيقي
صاوب method في الـ controller كتقبل parameter سميتو `status` (مثلا `PENDING`, `APPROVED`) ودير ليه قيمة افتراضية هي `PENDING` إلا ملقاش والو.

**التأكد:** الـ signature ديال الـ method خاصها تكون بحال هكا: `public List<Request> getByStatus(@RequestParam(defaultValue = "PENDING") String status)`.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
