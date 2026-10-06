---
title: "كيفاش تفهم الـ Business Workflow قبل ما تبدا تصاوب الـ Backend"
description: "تعلم كيفاش ترسم مسار العمل وتفرق بين الـ Actors والـ Entities باش ماتضطرش تعاود الخدمة من الزيرو."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 011-how-to-understand-a-business-workflow-before-designing-the-backend
locale: ar
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

تخايل راسك بديتي تكودي سيستيم ديال الشراء غير حيت قالو ليك « الموظفين خاصهم يطلبو PC-ات ». صاوبتي Table و API ساهلة، ولكن مورا سيمانة اكتشفتي بلي الطلب خاصو موافقة ديال Manager، وتأكد من الميزانية، وعاد الـ Buyer يشري. هنا الـ Database schema ديالك ولات قديمة حيت نسيتي كيفاش كيتحول الطلب من حالة لحالة.

## الفرق بين Actor و User
واحد الغلط كيديروه بزاف ديال المطورين هو كيسحاب ليهم أي واحد داخل للسيستيم هو « User ». فـ Workflow، خاصك تفرق بين **Actor** (الدور اللي كيدير العملية) و **User** (الحساب الشخصي). مثلاً، فـ App ديال الشراء، « Demandeur » و « Approbateur » هما Actors. يقدر يكون شخص واحد عندو هاد جوج أدوار، ولكن الـ Business logic كيهتم بالدور ماشي بالشخص.

## تحديد الـ Domain Entities
الـ Entities هما الحوايج اللي كيتتبعهم البيزنس. الـ User هو هوية، ولكن `PurchaseRequest` هي Entity ديال الدومين. هادي عندها دورة حياة: *Brouillon* → *Pending* → *Ordered* → *Received*. يلا فهمتي هاد الحالات، ماتصاوبش سيستيم جامد ماكيقبلش مثلاً طلب « مرفوض » (Rejected).

## التفكير فـ « الطريق اللي ماشي ساهلة » (Unhappy Path)
أغلب المطورين كيفكرو غير فـ « الطريق الساهلة » (Happy Path). ولكن Backend صحيح خاصو يجاوب على:
1. **مشاكل الصلاحيات**: واش ممكن الموظف يوافق على الطلب ديالو راسو؟
2. **قيود البيزنس**: شنو يوقع يلا الميزانية تسالات؟
3. **الوقت**: شنو يوقع يلا الـ Manager تعطل 10 أيام وماجاوبش؟

## مثال تطبيقي: مسار الشراء
شوف هاد المنطق البسيط:
- **Actor: Requester** → كيصاوب `PurchaseRequest` (الحالة: PENDING).
- **Actor: Manager** → كيشوف الميزانية؛ يلا كانت مزيانة، كيرد الحالة APPROVED.
- **Actor: Buyer** → كيشري من عند الفورنيسور؛ كيرد الحالة ORDERED.

يلا صاوبتي غير Table فيها `status` كـ String، غادي تنسى بلي خاصك `ApprovalLog` باش تعرف شكون وافق وفوقاش (Audit).

## غلط شائع: الزربة فـ Tables
**الغلط**: تمشي تصاوب Table `Users` و `Requests` ديريكت.
**التصحيح**: أول حاجة رسم الـ Flowchart ديال العملية. حدد التحولات (Transitions). عاد من بعد قرر واش خاصك Table ديال `Role` أو Enum ديال `State`.

## تمرين تطبيقي
**السيناريو**: سيستيم ديال مكتبة فين العضو كيسلف كتاب، ولكن خاص موافقة ديال Bibliothécaire يلا كان الكتاب « نادر » (Rare).
**السؤال**: حدد الـ Actors والـ Domain Entity.
**الجواب**: الـ Actors هما: Member و Bibliothécaire. الـ Domain Entity هي: LoanRequest (بـ حالات بحال Pending, Approved, Borrowed).
