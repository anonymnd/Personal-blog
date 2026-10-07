---
title: "كيفاش تحدد حدود الموديولات قبل ما تمشي للميكروسيرفيسز"
description: "شرح مفصل على الـ cohesion والـ coupling وكيفاش تحول من modular monolith لـ microservices باستعمال مثال ديال travel booking."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 253-monolith-vs-microservices
seriesOrder: 57
locale: ar
tags: ["architecture-boundaries","learning-series"]
draft: false
---

## الغلط ديال 'Microservices هي الأولى'

بزاف ديال الفرق كيسحاب ليهم بلي الميكروسيرفيسز هي طريقة باش تنظم الخدمة، ولكن هي في الأصل طريقة ديال الـ deployment. التحدي الكبير في السوفتوير ماشي هو واش تستعمل network call ولا method call، ولكن هو فين تسالي واحد الـ capability وتبدا وحدة خرى. يلا رسمتي الحدود غلط، غادي تسالي بـ distributed monolith: سيستيم فيه التعقيد ديال الميكروسيرفيسز ولكن فيه coupling مجهد ديال المونوليت، فين أي تغيير في موديول الـ 'Payment' كيفرض عليك تـ deploy حتى موديول الـ 'Itinerary'.

## الـ Cohesion والـ Coupling كمعايير للحدود

باش نعرفو فين نرسمو الحدود، كنشوفو جوج حوايج:

1. **الـ Cohesion (التماسك)**: واش المسؤوليات اللي داخل الموديول مرتبطة ببعضياتها؟ Cohesion عالية كتعني بلي كلشي في الموديول كيخدم على هدف واحد واضح. يلا كان موديول الـ 'Payment' بدا كيجير حتى 'Loyalty Points'، هنا الـ cohesion كتهبط حيت نقاط الوفاء هي domain capability بوحدها.
2. **الـ Coupling (الارتباط)**: شحال موديول كيعتمد على التفاصيل الداخلية ديال موديول آخر؟ Coupling ناقص كيعني بلي الموديولات كيهضرو مع بعضياتهم غير عن طريق contracts مستقرة. يلا كان موديول الـ 'Itinerary' كيمشي يقرى نيشان من tables ديال base de données ديال الـ 'Payment'، هنا راه كاين coupling مجهد، واخا يكونو بجوج في نفس الـ JVM.

## سيناريو: سيستيم ديال حجز السفر (Travel Booking)

تخيل عندنا سيستيم فيه تلاتة ديال الـ capabilities: **Itinerary** (برنامج السفر)، **Payment** (الأداء)، و **Customer Support** (دعم الزبناء).

### مرحلة الـ Modular Monolith
في الأول، كنظمو هادشي كـ packages مفرقة في application وحدة ديال Spring Boot. السر هنا هو نبعدو على التقسيم ديال layers (بحال `com.app.service`, `com.app.repository`) ونمشيو للتقسيم على حساب الـ features:

- `com.travel.itinerary`
- `com.travel.payment`
- `com.travel.support`

في هاد المرحلة، كنفرضوا الحدود باستعمال Java visibility modifiers و tests ديال architecture (بحال ArchUnit). موديول الـ `Payment` ما خاصوش يقيس الـ repository ديال `Itinerary` نيشان؛ خاصو يدوز من interface ديال service محددة.

### واش بصح خاصنا نخرجوا الـ Payment في microservice بوحدو؟
دابا كنسولو راسنا: واش موديول الـ `Payment` محتاج فعلاً يكون deployment مستقل؟

**علاش نخليوه في المونوليت:**
- **الـ Transactional Integrity**: يلا كان حجز السفر والأداء خاصهم يوقعو في transaction وحدة باش ما يبقاش عندنا حجز بلا خلاص، فمن الأحسن يبقاو في deployment واحد باش نتفاداو الصداع ديال consistency.
- **الـ Operational Overhead**: أي سيرفيس بوحدو كيحتاج pipeline CI/CD بوحدو، monitoring بوحدو، و security patching بوحدو.

**علاش نخرجوه في microservice:**
- **Scaling**: الـ Payment يقدر يحتاج compute مجهد على قبل الـ encryption ولا يجيوه requests بزاف في وقت واحد اللي يقدروا يطيحو موديول الـ Itinerary.
- **Security Isolation**: موديول الـ Payment كيتعامل مع بيانات حساسة (PCI-DSS). يلا عزلناه، كنقدروا نديرو عليه firewalls مجهدين ونحكمو في شكون كيوصل لـ OS ديالو.
- **Independent Evolution**: الفريق ديال الـ Payment بغاو يـ deploy تحديثات 5 دالمرات في النهار بلا ما يخاطروا باستقرار السيستيم ديال الـ Itinerary.

## تطبيق عملي: خطة فرض الحدود (Boundary Enforcement Plan)

ها كيفاش نحولو من monolith بـ database وحدة لـ structure modular اللي كتسمح لينا نخرجوا الميكروسيرفيسز من بعد.

### 1. ملكية البيانات (Data Ownership)
عوض ما يكون عندنا schema وحدة كبيرة، كنقسمو البيانات منطقياً. وخا نكونو في base de données وحدة، كنستعملو schemas مفرقة أو prefixes في السميات.

| الموديول | الجداول اللي كيملك | قاعدة الوصول |
| :--- | :--- | :--- |
| Itinerary | `itinerary`, `flight_segment` | غير `com.travel.itinerary` اللي يقدر يقرى/يكتب |
| Payment | `transaction`, `payment_method` | غير `com.travel.payment` اللي يقدر يقرى/يكتب |
| Support | `ticket`, `case_log` | غير `com.travel.support` اللي يقدر يقرى/يكتب |

### 2. التواصل عبر العقود (Contracts) - مثال توضيحي
باش نتفاداو الـ coupling المجهد، كنستعملو records للـ DTOs وما كنشاركو-ش الـ JPA entities بين الموديولات.

```java
// موجود في com.travel.payment.api
public record PaymentRequest(String bookingId, BigDecimal amount, String currency) {}
public record PaymentResponse(String transactionId, PaymentStatus status) {}

// com.travel.payment.api
public interface PaymentService {
    // هادي هي الباب الوحيد اللي كيدخلو منو الموديولات الأخرى
    PaymentResponse processPayment(PaymentRequest request);
}
```

### 3. تحليل فشل: الفخ ديال الـ Distributed
يلا خرجنا الـ `Payment` لـ microservice بلا ما نقادو الحدود، غادي نوقعو في هاد المشكل:
1. `ItineraryService` كيعيط لـ `PaymentClient.process()`.
2. `PaymentService` كيوقع ليه timeout على قبل الـ network.
3. `ItineraryService` كيرجع error 500، ولكن في الحقيقة الـ payment داز في الخلفية.
4. النتيجة: الكليان تخلص، ولكن الحجز ما تأكدش.

**الحل**: نخدمو بـ asynchronous pattern (بحال Outbox pattern) ولا Saga باش نضمنو الـ eventual consistency، وهذا هو الثمن اللي كنخلصوه ملي كنختارو distributed deployment.

## تمرين

**السيناريو**: عندك موديول `CustomerSupport` بغا يبين آخر 3 ديال الـ payments ديال واحد المستخدم. حالياً، راه كيعيط لـ `PaymentRepository.findByUserId()`.

**السؤال**: علاش هادشي كيتعتبر خرق للحدود (boundary violation)، وكيفاش خاصنا نصححوه باش نقدروا نخرجوا موديول الـ `Payment` في سيرفر بوحدو من بعد؟

**الجواب**: هادشي خرق حيت `CustomerSupport` ولا كيعتمد على الطريقة باش مخزنين البيانات (الـ Repository) داخل موديول الـ `Payment`. يلا بدلنا الـ schema ديال الـ Payment، غادي يتهرس الـ `CustomerSupport`. باش نصححو هادشي، موديول الـ `Payment` خاصو يوفر method عامة (مثلاً `PaymentService.getRecentPayments(userId)`) كترجع DTO. موديول الـ `CustomerSupport` كيعيط لهاد الـ method، وكيولي ما مسوقش كيفاش البيانات مخزنة لداخل.

Module boundary قاعدة ديال access مقصودة، table prefix بوحدها ما كتفرضهاش. خلي public PaymentService فـ payment.api وimplementation داخلية؛ استعمل visibility وarchitecture checks وDB permissions المناسبة. Microservices كتأثر حتى على teams وoperations ماشي غير deployment. حتى monolith ما كتقدرش تدخل external payment provider atomically فـ SQL transaction عادية. Timeout كتخلي payment outcome مشكوك فيها: استعمل idempotency keys ثابتين وreconciliation وpending/confirmed states واضحين. Outbox ولا saga ما كتلغيش external charge بوحدها. Separate deployment كتعاون isolation ولكن ما كتثبتش compliance مع standard.
