---
title: "تصميم عقود REST: الموارد وتحولات البيزنس"
description: "دليل باش تفرق بين تسيير الموارد (Resources) وتحولات الحالة ديال البيزنس في نظام توقيع الوثائق."
pubDate: 2026-10-07T07:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
seriesOrder: 16
locale: ar
tags: ["rest-api","learning-series"]
draft: false
---

## الموارد مقابل الأفعال (Resources vs Actions)

واحد الغلط شائع فاش كنصممو API هو أننا كنتعاملوا مع الـ endpoints بحال إلا راهم أزرار (RPC)، مثلاً نديرو `/envelopes/sign-document`. ولكن في REST الحقيقي، الـ URI خاصو يحدد المورد (Resource)، والـ HTTP method هي اللي كتحدد العملية.

فالسيستيم ديال توقيع الوثائق، عندنا جوج أنواع ديال التغييرات: **تعديل المعلومات (Metadata)** (مثلاً تبدل العنوان) و **تحولات البيزنس (Business Transitions)** (مثلاً ترجع الوثيقة 'موقعة'). وخا بجوجهم كيبدلو الداتا في لاباز، ولكن المعنى ديالهم مختلف. تعديل المعلومات هو CRUD عادي، ولكن تحول البيزنس هو انتقال في الحالة (State Machine) اللي غالباً كيتبعو إجراءات أخرى بحال إرسال إيميلات أو تسجيل وقت قانوني.

## هيكلة الموارد (Resource Hierarchy)

باش يكون العقد (Contract) نقي، كنحددو الموارد على حساب دورة الحياة ديالهم. الـ `Envelope` هي المورد الأساسي، والـ `Signers` موارد تابعة ليها.

### نقاط الوصول للمجموعات والتفاصيل
- `GET /envelopes`: كيرجع لينا ليستة ديال الـ envelopes. الفلترة (مثلاً `?status=pending`) كدار بـ query parameters ماشي بـ endpoint بوحدو.
- `GET /envelopes/{id}`: كيرجع الحالة الحالية ديال envelope وحدة.
- `POST /envelopes`: كيكريي envelope جديدة. السيرفر هو اللي كيعطي الـ ID وكيرجع `201 Created` مع `Location` header.

### الموارد المتداخلة (Nesting)
التداخل كيكون فاش كتكون علاقة ملكية قوية. حيت الـ signer ما يمكنش يكون بلا envelope، كنديروه متداخل:
- `GET /envelopes/{id}/signers`: كيجيب كاع الناس اللي خاصهم يسنيو فـ envelope معينة.
- `POST /envelopes/{id}/signers`: كيزيد signer جديد لـ envelope.

حاول ما تفوتش جوج مستويات ديال التداخل. إلا بغيتي تبدل شي signer محدد، استعمل `/signers/{signerId}` بلاصة ما دير `/envelopes/{id}/signers/{signerId}` باش يبقاو الـ URIs قصار.

## نمذجة تحولات البيزنس (Business Transitions)

فاش المستخدم « كيسني » وثيقة، راه ما كيبدلش غير قيمة boolean؛ راه كيدير إجراء قانوني. إلا استعملنا `PATCH /envelopes/{id}` باش نبدلو الحالة لـ `SIGNED` غتكون خدامة تقنياً، ولكن معمارياً ضعيفة حيت خلطنا التعديل الإداري مع منطق البيزنس.

الحل هو نتعاملوا مع التحول كمورد فرعي أو أمر محدد. كاينين جوج طرق:

1. **مورد الحالة**: `PUT /envelopes/{id}/status` (تبديل قيمة الحالة).
2. **مورد الإجراء**: `POST /envelopes/{id}/signatures` (كريي سجل ديال التوقيع اللي هو اللي كيغير الحالة).

فحالة التوقيع، الطريقة الثانية هي الأحسن حيت كتخلينا نسجلو « شكون » و « فوقاش » وقع التحول كمورد مستقل.

## مثال تطبيقي: عقد التوقيع

هذا هو العقد المتفق عليه. هكذا الـ frontend كيعرف بالضبط شنو يعيط باش يبدل معلومة بسيطة وشنو يعيط باش يدير إجراء قانوني.

### مواصفات العقد

| الهدف | Method | Endpoint | Payload | النتيجة المتوقعة |
| :--- | :--- | :--- | :--- | :--- |
| كريي Envelope | `POST` | `/envelopes` | `{ "title": "NDA" }` | `201 Created` + Location |
| تعديل العنوان | `PATCH` | `/envelopes/{id}` | `{ "title": "New NDA" }` | `200 OK` (الـ Resource متبدل) |
| إضافة Signer | `POST` | `/envelopes/{id}/signers` | `{ "email": "a@b.com" }` | `201 Created` |
| توقيع الوثيقة | `POST` | `/envelopes/{id}/signatures` | `{ "signerId": "s1" }` | `202 Accepted` أو `201` |
| إلغاء Envelope | `DELETE` | `/envelopes/{id}` | N/A | `204 No Content` |

### مثال توضيحي بـ Java

```java
// استعمال records باش تكون الداتا immutable
public record EnvelopeResponse(UUID id, String title, String status, LocalDateTime createdAt) {}
public record SignerRequest(String email, String role) {}
public record SignatureRequest(UUID signerId, String digitalFingerprint) {}

@RestController
@RequestMapping("/envelopes")
public class EnvelopeController {

    // تعديل معلومات: تغيير جزئي
    @PatchMapping("/{id}")
    public ResponseEntity<EnvelopeResponse> updateMetadata(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        // لوجيك باش نبدلو غير الحقول اللي صيفط الـ frontend
        return ResponseEntity.ok(updatedEnvelope);
    }

    // تحول بيزنس: كريي signature اللي كيرجع الحالة لـ 'Signed'
    @PostMapping("/{id}/signatures")
    public ResponseEntity<Void> signDocument(@PathVariable UUID id, @RequestBody SignatureRequest request) {
        // لوجيك البيزنس: تأكد من signer، زيد timestamp، بدل حالة envelope
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
```

### حالات الفشل والنتائج
- **المورد غير موجود (404 Not Found)**: إلا حاول شي واحد يدير `POST /envelopes/{id}/signatures` على envelope ديجا تمسحات بـ `DELETE` ، السيرفر خاصو يرجع `404 Not Found`.
- **عدم تطابق التمثيل (Representation Mismatch)**: إلا كان الـ frontend كيتسنى الحالة تبدل ديك الساعة ولكن السيرفر كيعالج التوقيع بشكل غير متزامن (asynchronous)، الـ `POST` خاصو يرجع `202 Accepted`. الـ frontend خاصو يبقى يدير `GET /envelopes/{id}` حتى يشوف التحول كمل.

## تمرين

**السيناريو**: بغينا نزيدو مرحلة ديال « المراجعة » (Review). خاص المدير يوافق على الـ envelope قبل ما تصيفط للناس باش يسنيوها.

1. أما endpoint غتستعمل باش تبدل الوصف (description) ديال الـ envelope فاش تكون فالمراجعة؟
2. أما endpoint غتكريي باش تسير عملية الموافقة ديال المدير؟
3. علاش ما نستعملوش `PATCH /envelopes/{id}` للموافقة؟

**الجواب**:
1. `PATCH /envelopes/{id}` مع حقل description.
2. `POST /envelopes/{id}/approvals` (باش نكرييو سجل ديال الموافقة) أو `PUT /envelopes/{id}/status` (إلا كانت بسيطة).
3. حيت الموافقة هي تحول بيزنس (Business Transition) عندها شروط ديال الصلاحيات (Authorization) وأرشيف (Audit)، بينما `PATCH` مديورة غير لتعديل الخصائص العامة. إلا خلطناهم، غيولي صعيب نطلقو أحداث خاصة بالموافقة (بحال صيفط إيميل) بلا ما نوسخوا اللوجيك ديال التعديل العادي.

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
