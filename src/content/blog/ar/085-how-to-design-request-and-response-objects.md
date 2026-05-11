---
title: "كيفاش تصمم Request و Response Objects"
description: "تعلم كيفاش تنظم البيانات (DTOs) في REST API باش يكون التواصل واضح بين client و server."
pubDate: 2026-10-10T04:48:00.000Z
translationKey: 085-how-to-design-request-and-response-objects
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال الشراء (procurement) فين الموظف كيصيفط طلب شراء. بزاف ديال المبتدئين كيغلطو حيت كيصيفطو الـ Entity ديال database كاملة. هادشي خطر حيت كيقدر يسرب معلومات سرية ولا IDs داخلية. الحل هو تفرق بين داكشي لي كاين في base de données وداكشي لي كيخرج لـ client.

## الفرق بين Entity و DTO
باش تحمي السيستيم ديالك، استعمل Data Transfer Objects (DTOs). الـ Request object هو لي كيحدد شنو خاص client يصيفط، والـ Response object هو لي كيحدد شنو غادي يرجع ليه server. مثلا، في طلب شراء، الـ `PurchaseRequestRequest` خاص يكون فيه غير `itemName` و `quantity` ، ولكن الـ `PurchaseRequestResponse` خاص يكون فيه `requestId` و `status` لي كيكرييهم server.

## كيفاش تنظم Request Object
الـ Request خاصو يكون خفيف. ما ديرش فيه حوايج server هو لي كيحددها، بحال التاريخ (timestamps) ولا الـ ID فاش كتكون كتكريي حاجة جديدة. إلا كان manager كيوافق على طلب، الـ request object خاصو يركز غير على الفعل (مثلا `approvalStatus` و `comments`) ماشي يعاود يصيفط تفاصيل الطلب كاملة.

## كيفاش تصمم Response Object
الـ Response خاصو يكون منظم. بلاصت ما ترجع غير كلمة وحدة، رجع object كامل. هادشي كيخليك تزيد معلومات أخرى من بعد بلا ما تخسر الـ client. فاش كتكريي شي حاجة بنجاح، رجع الـ object لي تكريا مع status `201 Created` و `Location` header.

## مثال تطبيقي: طلب شراء
ها واحد المثال بسيط كيفاش كيكونوا هاد الـ objects بـ Jakarta:

```java
// Request Object
public class ProcurementRequestDTO {
    private String itemDescription;
    private Integer quantity;
    // Getters and Setters
}

// Response Object
public class ProcurementResponseDTO {
    private Long requestId;
    private String status;
    private LocalDateTime createdAt;
    // Getters and Setters
}
```
إلا صيفط الموظف طلب، server كياخد `ProcurementRequestDTO` وكيجاوب بـ `ProcurementResponseDTO` مع status `201` ، وكيكون الـ ID هو `101` والـ status هو `PENDING`.

## غلط شائع: الـ Object الموحد
بزاف كيصاوبو `ProcurementDTO` واحد كيخدموه في الـ creation و الـ update. هادشي غلط حيت الـ `id` ضروري في update ولكن ممنوع في creation.
**التصحيح:** صاوب `CreateRequestDTO` و `UpdateRequestDTO` مفرقين باش تكون validation دقيقة.

## تمرين تطبيقي
صمم Response object لواحد الـ 'Buyer' يلاه شرا منتوج. شنو هما الحقول (fields) الضرورية؟

**الجواب:** خاص يكون فيه `orderId` و `trackingNumber` و `orderDate`. وممنوع يكون فيه password hash ديال الـ buyer.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
