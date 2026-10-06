---
title: "شنو كادير @PathVariable؟"
description: "تعلم كيفاش تجبد قيم ديناميكية من الـ URL باش تصاوب API endpoints مرنين و RESTful فـ Spring Boot."
pubDate: 2026-10-09T08:48:00.000Z
translationKey: 065-what-does-pathvariable-do
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال الشراء (procurement system). عندك آلاف ديال الطلبات (requests)، ومحتاج طريقة باش تجبد طلب واحد محدد عن طريق الـ ID ديالو. إلا بقيتي كتصاوب endpoint لكل ID، الكود ديالك غادي يولي ما كيساليش. هنا فين كيتلفو المبتدئين: كيفاش نقولو لـ Spring Boot بلي واحد الطرف من الـ URL هو عبارة عن متغير (variable) ماشي غير نص عادي؟

## كيفاش خدامة @PathVariable

الـ annotation ديال `@PathVariable` كتستعمل باش نربطو واحد الجزء من الـ URI (لي كيكون بين معقوفتين `{}`) مع واحد الـ parameter فـ method ديال الـ controller. ملي كتجي request، Spring كيشوف الـ `@RequestMapping`. إلا لقى شي حاجة بحال `{id}`، كيمشي يقطع ديك القيمة من الـ URL الحقيقية وكيعطيها للمتغير لي دايرين ليه `@PathVariable`.

## مثال تطبيقي

فـ تطبيق ديال الشراء، manager خاصو يوافق على طلب معين. بلاصت ما نصيفطو الـ ID فـ query string (بحال `?id=10`)، كنستعملو path variable باش يكون الـ design RESTful ونقي.

```java
@RestController
@RequestMapping("/requests")
public class RequestController {

    @GetMapping("/{requestId}")
    public String getRequestDetails(@PathVariable Long requestId) {
        // هنا فـ التطبيق الحقيقي كنعيطو لـ service
        return "Fetching details for procurement request ID: " + requestId;
    }
}
```

إلا دخل المستخدم لـ `/requests/502` ، Spring غادي يعرف بلي `502` هي الـ `requestId`. والنتيجة غتكون: "Fetching details for procurement request ID: 502".

## غلط شائع: السميات ماشي بحال بحال

واحد الغلط كيوقع بزاف هو ملي كتكون السمية لي بين `{}` ماشي هي نفسها السمية ديال الـ parameter. مثلاً، كدير `/{id}` فـ mapping ولكن كدير `@PathVariable Long requestId` فـ method. هنا Spring غادي يتلف حيت مالقاش شي حاجة سميتها `requestId` فـ الـ path.

**التصحيح:** يا إما دير نفس السمية فـ بجوج، يا إما حدد السمية وسط الـ annotation بحال هكا: `@PathVariable("id") Long requestId`.

## الفرق بين PathVariable و RequestParam

| الميزة | @PathVariable | @RequestParam |
| :--- | :--- | :--- |
| شكل الـ URL | `/requests/10` | `/requests?id=10` |
| الهدف | تحديد مورد (Resource) | الفلترة أو الترتيب |
| الضرورة | غالباً ضرورية | تقدر تكون اختيارية |

## تمرين تطبيقي

صاوب method mapping لي كتخلي buyer يبدل الحالة (status) ديال commande، استعمل path variable للـ `orderId` و path variable للـ `status` (مثلاً: `/orders/123/status/shipped`).

**الجواب:** الـ signature ديال الـ method خاصها تكون بحال هكا: `public String updateStatus(@PathVariable Long orderId, @PathVariable String status)`.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
