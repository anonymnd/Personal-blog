---
title: "علاش الـ API ديالك ما خاصوش يكون مراية لـ Database"
description: "تعلم كيفاش تفصل بين داكشي لي كيشوف المستخدم (API) وداكشي لي مخبي فـ base de données باش تحمي السيستيم ديالك."
pubDate: 2026-10-10T03:48:00.000Z
translationKey: 084-why-your-api-should-not-mirror-your-database
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). فـ base de données عندك جدول سميتو `purchase_requests` فيه كولونات بحال `req_id` و `status_code` و `internal_audit_flag`. إلا كنتي كترجع هاد الجدول كيف ما هو فـ JSON، أي تغيير بسيط فـ database (مثلا بدلتي `req_id` لـ `request_id`) غادي يهرس كاع لي زابليكاسيون لي خدامين بـ API ديالك. هاد المشكل كيتسمى tight coupling وهو فخ كيوقعو فيه بزاف ديال المبتدئين.

## خطر تسريب الـ Schema
ملي الـ API كيكون كيشبه لـ database، راك كتكشف أسرار تقنية داخلية. مثلا، إلا شاف الكليان `status_code: 4` ما غادي يفهم والو بلا ما يشوف الدوكيمونطاسيون لداخل. والأخطر من هادشي، تقدر تصيفط معلومات حساسة بحال `internal_audit_flag` لواحد الشخص لي خاصو يشوف غير واش الطلب ديالو تقبل ولا لا.

## الحل هو الـ DTO
باش تحل هاد المشكل، كنستعملو Data Transfer Objects (DTOs). الـ DTO هو كلاص (class) بسيطة كتحكم فشنو بغينا نصيفطو ولا نستقبلو، بلا ما نهتمو كيفاش داكشي مخزون. فـ Jakarta EE، الـ entity تقدر تكون معقدة، ولكن الـ DTO كيبقى نقي.

```java
// Database Entity
public class PurchaseRequestEntity {
    private Long reqId;
    private Integer statusCode;
    private Boolean internalAuditFlag;
}

// API DTO
public class PurchaseRequestDTO {
    private String requestId;
    private String statusLabel; // "Pending", "Approved"
}
```

## مثال تطبيقي: الموافقة على طلب
تخيل مدير بغا يوافق على طلب. الـ database خاصها `updated_by` و `version` باش تحافظ على الترتيب. ولكن لي كيصيفط الطلب من الـ API محتاج غير يقول «موافق».

**الطلب:** `PATCH /requests/123` 
`{ "status": "APPROVED" }` 

**النتيجة:** السيرفر كياخد الـ DTO، كيقلب على الـ entity، كيبدل `statusCode` للقيمة الداخلية (مثلا `2`) وكيزيد الوقت ديال التعديل من عندو، وفالاخير كيرجع `200 OK` مع `PurchaseRequestDTO` فيه المعلومات لي مهمة فقط.

## غلط شائع: الـ Controller لي كيدوز كلشي
بزاف ديال المطورين كيديرو `return repository.findById(id);` مباشرة.
**التصحيح:** ديما حول الـ Entity لـ DTO باستعمال mapper. هكا واخا تزيد كولون فـ database، الـ API كيبقى خدام بلا مشاكل.

## تمرين تطبيقي
عندك جدول `User` فيه `password_hash` و `email`. بغيتي تصاوب `GET /profile`.

**سؤال:** واش ترجع الـ entity ديال `User` كيف ما هي؟
**الجواب:** لا. خاصك تصاوب `UserProfileDTO` فيه غير الـ `email` والمعلومات العامة، وتحيد `password_hash` باش ما تسرقش المودباسات.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
