---
title: "التحقق من المدخلات، الأهلية ديال البيزنس، وضمانات قاعدة البيانات"
description: "شرح مفصل لثلاث ديال الطبقات ديال validation باستعمال مثال ديال التسجيل فـ workshop باش نتفاداو الداتا الغالطة و المشاكل ديال concurrency."
pubDate: 2026-10-07T10:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
seriesOrder: 19
locale: ar
tags: ["validation-errors","learning-series"]
draft: false
---

## الطبقات الثلاث ديال Validation

Input validation كتشوف الشكل: @NotNull كترفض null، @NotBlank كترفض null ولا string ما فيها حتى حرف ماشي whitespace، و@Positive كتطلب رقم موجب؛ زيد @NotNull إلا wrapper يقدر يكون null. @Valid كتدير cascade ملي mechanism ديال validation كيخدم؛ annotation فوق أي method ما كتفعلوش بوحدها.

Business eligibility كتشوف واش workshop محلولة وواش user مسموح ليه يسجل. Invariants ديال DB كيحميو الحالة المحفوظة مع requests متزامنين. Unique constraint كتمنع duplication ولكن ما كتضمنش seats بوحدها. Constraints ولا atomic conditional update ولا locks ولا serializable transactions كيعالجو races محددين؛ خاص transaction كاملة.
## مثال تطبيقي: التسجيل فـ Workshop

Request فيها contactEmail وrequestedSeats موجب وworkshopId. دير validation فـ HTTP boundary بـ @Valid وحدد واش email خاصها @Email وnormalization واضحة. @NotBlank بوحدها ما كتأكدش صيغة email.

Implementation ضعيفة كتقرا آخر seat ومن بعد كتدخل booking؛ جوج requests يقدرو يدوزو من نفس القراءة. عوض هادشي reserve seats بـ UPDATE conditional داخل نفس transaction ديال إدخال booking:

```sql
UPDATE workshop
SET available_seats = available_seats - :requested
WHERE id = :workshop_id
  AND is_open = TRUE
  AND available_seats >= :requested;
```

خاص row وحدة تتبدل؛ صفر تقدر تعني workshop ما كايناش ولا مسدودة ولا seats ناقصين، صنفها حسب contract. من بعد دخل booking مع requestedSeats وunique constraint على (workshop_id, normalized_contact_email). إلا فشل insert، rollback transaction كاملة باش ترجع seats. CHECK available_seats >= 0 حماية إضافية، ما كتعوضش تعديل counter.

ما تعتبرش كاع DataIntegrityViolationException duplication. شوف constraint المعروفة فـ transaction boundary مناسبة. save تقدر تأخر SQL حتى flush ولا commit، وtry/catch حول save بوحدها ما يشدش الخطأ. فـ PostgreSQL، statement فاشلة تقدر تحتاج rollback. جرب جوج users على آخر seat ونفس user كيسجل جوج مرات.
## تمرين تطبيقي

**السيناريو**: بغيتي تصاوب سيستيم فين المستخدم يقدر ينضم لـ "Premium Group".
- الـ `groupCode` خاصو ما يكونش خاوي.
- المستخدم خاص يكون عندو 18 عام لفوق (Business check).
- المستخدم يقدر يكون فـ مجموعة Premium وحدة فقط فـ المرة (Database invariant).

**السؤال**: كل شرط من هادو، فين غادي دير ليه الـ validation وعلاش؟

**الجواب**:
1. `groupCode`: ندير ليه `@NotBlank` فـ الـ Request DTO (Input Validation). حيت مجرد تحقق من شكل الداتا.
2. السن ≥ 18: نديرو فـ الـ Service layer من بعد ما نجيبو معلومات المستخدم (Business Eligibility). حيت خاصنا نشوفو الداتا ديال البروفايل.
3. مجموعة وحدة: نديرو Unique constraint على `user_id` فـ جدول `group_members` (Database Invariant). باش نتفاداو race condition إلا كليكا المستخدم على "Join" جوج مرات دغيا فـ جوج tabs مختلفين.

## باش تزيد تفهم

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
