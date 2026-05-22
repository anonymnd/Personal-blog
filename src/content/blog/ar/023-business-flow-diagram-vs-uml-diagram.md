---
title: "كيفاش تختار الـ UML Diagram اللي كيجاوب على السؤال ديالك"
description: "دليل باش تعرف تختار وتبني الـ UML diagrams على حساب السؤال التقني اللي عندك، باستعمال مثال ديال رزرفاسيون ديال تيكيتات."
pubDate: 2026-10-06T20:48:00.000Z
translationKey: 023-business-flow-diagram-vs-uml-diagram
seriesOrder: 5
locale: ar
tags: ["uml-modeling","learning-series"]
draft: false
---

## المشكل الأساسي: الغلط فاستعمال الـ Diagrams

بزاف ديال لي ديفلوبور كيتعاملوا مع UML بحال شي فرض ضروري خاصو يدار، ماشي كأداة ديال التواصل. أكبر غلط هو ملي كتستعمل diagram غالط باش تجاوب على سؤال محدد. مثلا، إلا بغيتي تشرح كيفاش كتم عملية Decision فالبزنس باستعمال Deployment diagram، راه مستحيل، حيت الـ deployment diagram كيهضر على فين محطوط الكود (Infrastructure) ماشي كيفاش خدام (Logic).

باش تختار الأداة الصحيحة، خاصك أولا تعرف شنو هو السؤال اللي باغي تجاوب عليه: « شكون اللي داخل فالموضوع؟ »، « كيفاش داير السيركوي (Flow)؟ »، « شنو هو الترتيب ديال الهضرة بين الـ objects؟ »، « كيفاش دايرة البنية (Structure)؟ » أو « فين غادي يخدم هاد الكود؟ »

## الربط بين السؤال والـ Diagram

| السؤال | الـ Diagram الصحيح | التركيز الأساسي |
| :--- | :--- | :--- |
| شكون اللي كيتفاعل مع السيستيم باش يوصل لهدف معين؟ | Use Case Diagram | Actors و Goals |
| شنو هما الخطوات المنطقية و فين كاينين التقسيمات (Decisions)؟ | Activity Diagram | Workflow و Control Flow |
| شنو هو الترتيب الدقيق ديال الميساجات بين الـ components؟ | Sequence Diagram | Interactions مرتبة بالوقت |
| شنو هما الـ entities المفهومية والعلاقات اللي بيناتهم؟ | Class Diagram | Static Structure و Logic |
| كيفاش مقسم السيستيم لأجزاء (Modules)؟ | Component Diagram | Physical/Logical Modules |
| أنا سيرفور أو جهاز اللي هاز كل component؟ | Deployment Diagram | Hardware و Execution Environment |

## مثال تطبيقي: رزرفاسيون ديال تيكيتات

تخيل سيستيم فين المستخدم كيختار بلايص. هاد البلايص كيبقاو محجوزين (Held) لمدة 10 دقايق. إلا داز الخلاص، الرزرفاسيون كتكون Confirmed؛ إلا سالا الوقت أو فشل الخلاص، البلايص كيرجعوا خاويين.

### 1. سؤال الـ Workflow: Activity Diagram
Activity Diagram مناسب لهاد workflow حيت كيبين actions و branches و concurrency. ولكن Sequence Diagram حتى هو يقدر يبين branches و interactions متوازية؛ اختارو ملي السؤال كيهضر على messages بين participants محددين.

**تتبع المنطق (Logic Trace):**
- البداية → اختيار البلايص → [حجز مؤقت] → سؤال: واش الخلاص وصل؟
- إلا آه → تأكيد التيكيت → النهاية.
- إلا لا → تسنى الـ timeout → سؤال: واش سالا الوقت؟
- إلا آه → تحرير البلايص → النهاية.

### 2. سؤال التفاعل: Sequence Diagram
ملي كيكون الـ workflow واضح، خاصنا نعرفو *شكون* بالضبط من الـ objects اللي كيتكلف بهاد الخدمة. الـ Sequence Diagram كيربط هاد الخطوات بـ lifelines (Acteurs و Objects).

**مثال ديال التفاعل (Interaction Trace):**
- User → ReservationController: requestHold(seatId)
- ReservationController → SeatService: lockSeat(seatId)
- SeatService → Database: updateStatus('HELD')
- ReservationController → User: return holdConfirmation
- [Loop: كيتشيكي واش الخلاص داز]
- PaymentGateway → ReservationController: notifyPaymentSuccess()
- ReservationController → SeatService: finalizeBooking()

**رموز مهمة استعملناها هنا:**
- **alt (Alternative):** كنستعملوها باش نفرقو بين طريق « الخلاص نجح » و « الخلاص فشل ».
- **loop:** كنستعملوها ملي كنكونو كنتسناو شي حاجة (بحال الـ timeout).
- **par (Parallel):** كنستعملوها إلا كان السيستيم كيصيفط email وفي نفس الوقت كيموديفي فـ database.
- **Lifelines:** الـ User هنا هو actor lifeline، والـ SeatService هو object lifeline.

### 3. سؤال البنية: Class Diagram
الـ Sequence كيبين لينا « الهضرة »، ولكن الـ Class Diagram كيبين لينا « المعرفة » (شنو كيعرف كل object).

**فرق مهم: Conceptual Class مقابل SQL Table**
الـ UML Class كتمثل مفهوم فالبزنس وعندو سلوك (methods)، ماشي غير سطر فـ table. مثلا Class ديال `Reservation` تقدر تكون فيها method سميتها `calculateExpiry()`، ولكن فـ SQL table كتلقى غير column سميتها `expiry_date`.

**نموذج مبسط:**
- Class `Ticket`: فيها (id, price, seatNumber).
- Class `Reservation`: فيها (id, startTime) و methods بحال (confirm(), cancel()).
- العلاقة: `Reservation` عندها علاقة 1..* مع `Ticket`.

## علاش الـ Deployment Diagrams ما كيصلحوش للمنطق

إلا حاولتي تشرح الـ « Timeout ديال الخلاص » فـ Deployment Diagram، غادي تغلط. الـ Deployment Diagram كيقول ليك بلي `PaymentService.jar` محطوط فـ `Server-A` وكيواصل مع `PaymentGateway-API` عبر HTTPS. كيشرح ليك *فين* (Where)، ماشي *كيفاش* (How). المنطق بلاصتو فـ Activity أو Sequence، أما الـ Infrastructure بلاصتها فـ Deployment.

## تمرين

**السيناريو:** مستخدم كيـ uploady تصويرة ديال البروفيل. السيستيم خاصو يصغر التصويرة، يقلب واش فيها virus، وعاد يحطها فـ cloud bucket. إلا لقى virus، التصويرة كتمسح ديك الساعة.

**السؤال:** شنو هما الـ 2 diagrams اللي خاصك تستعمل باش ترسم المنطق ديال « Scan Malware → Delete » والكونيكسيون ديال « App Server → Cloud Bucket »؟ وشرح علاش.

**الجواب:**
1. **Activity Diagram** (أو Sequence Diagram) على قبل المنطق: حيت هو اللي كيتكلف بالـ decision (واش scan نجح ولا فشل) والنتيجة ديالها (Save ولا Delete).
2. **Deployment Diagram** على قبل الكونيكسيون: حيت هو اللي كيبين العلاقة الفيزيائية بين الـ App Server والـ Cloud Storage.

## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
