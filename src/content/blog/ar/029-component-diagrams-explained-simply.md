---
title: "شرح مبسط لـ Component Diagrams"
description: "تعلم كيفاش ترسم الهيكلة العامة ديال السيستيم ديالك باستعمال Component Diagrams في UML."
pubDate: 2026-10-07T20:48:00.000Z
translationKey: 029-component-diagrams-explained-simply
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

تخيل راسك كتشوف شي ماكينة معقدة. ماشي ضروري تشوف كل فيس ولا كل خيط باش تفهم كيفاش خدامة؛ خاصك غير تشوف الموديلات الكبار—الموتور، لابواط فيتيس، والكهرباء—وكيفاش راكبين مع بعضياتهم. هادشي هو بالضبط اللي كيدير Component Diagram في السوفتوير. بزاف ديال المبتدئين كيغلطو بينو وبين Class Diagram، ولكن الفرق هو أن Class هي بلان ديال أوبجيك، بينما Component هو طرف موديلار من السيستيم اللي جامع وسطو بزاف ديال الحوايج وكيعطينا Interface محددة باش نتعاملو معاه.

## شنو هو الـ Component؟
الـ Component هو طرف ديال السوفتوير كيكون مستقل وقابل للتعويض. هو عبارة عن مجموعة ديال الـ classes و interfaces مجموعين فبلاصة وحدة. أهم حاجة هي أن الـ component كيخبي التعقيدات اللي لداخل. الأجزاء الأخرى ديال السيستيم ما كيهمهاش كيفاش خدام من لداخل، كيهمها غير الـ 'ports' ولا الـ interfaces اللي كيقدم لينا.

## الـ Interfaces: Provided و Required
التواصل بين المكونات كيكون عن طريق جوج أنواع ديال الـ interfaces. الـ **Provided Interface** (اللي كترسم بحال الحلوى/lollipop) هي خدمة كيقدمها الـ component للآخرين. أما الـ **Required Interface** (اللي كترسم بحال البريز/socket) هي خدمة كيحتاجها الـ component باش يقدر يخدم. ملي كتركب 'الحلوى' في 'البريز'، هنا كتكون عندنا علاقة تبعية (dependency).

## مثال: سيستيم ديال الشراء (Procurement)
نفترضو عندنا تطبيق ديال الشراء. نقدروا نقسموه لـ 3 ديال المكونات:
1. **RequestManager**: كيعطي Interface باش نصيفطو الطلبات. ولكن كيحتاج **ApprovalService** باش يتأكد من الطلب.
2. **ApprovalService**: كيعطي المنطق ديال الموافقة. وهو كيحتاج **NotificationSystem** باش يعلم المدييرين.
3. **NotificationSystem**: كيعطي خدمة إرسال الإيميلات ولا SMS.

فهاد المثال، `RequestManager` ما عارفش كيفاش `NotificationSystem` كيصيفط الإيميلات؛ هو عارف غير أن `ApprovalService` هو اللي كيتكلف بالمنطق وكيصيفط التنبيهات.

## غلط شائع: كثرة التفاصيل
واحد الغلط كيديروه بزاف هو ملي كيبغيو يحطو كاع الـ Java classes في Component Diagram. هادشي كيرجع الرسمة معقدة بحال Class Diagram. تفكر ديما: إلا كنتي كترسم methods ولا variables، راك خرجتي على الهدف. الـ Component خاصو يبقى عام وشامل.

## تمرين تطبيقي
**السيناريو**: عندك Component سميتو 'PaymentGateway' خاصو يهضر مع Component آخر سميتو 'BankAPI'. شكون فيهم اللي كيقدم (Provide) الـ interface وشكون اللي كيحتاجها (Require)؟

**الجواب**: الـ `BankAPI` هو اللي كيقدم الـ interface (الخدمة)، والـ `PaymentGateway` هو اللي كيحتاجها باش يكمل العملية ديال الخلاص.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
