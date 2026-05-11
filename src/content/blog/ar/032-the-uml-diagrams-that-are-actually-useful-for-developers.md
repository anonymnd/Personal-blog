---
title: "ديال UML لي بصح كينفعو المطورين"
description: "دليل عملي على دوك الشوية ديال diagrams فـ UML لي كيعاونو المطور باش يفهم logic بلا ما يغرق فالتفاصيل الأكاديمية لي ما عندها فايدة."
pubDate: 2026-10-07T23:48:00.000Z
translationKey: 032-the-uml-diagrams-that-are-actually-useful-for-developers
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

بزاف ديال developers كيهربو من UML حيت كيعقلو عليه كتمارين ديال القراية مملة، فين خاصك ترسم كلشي بالتفصيل. ولكن فالحقيقة، باش ترسم السيستيم كامل بالتفصيل هو تضيع ديال الوقت، حيت الكود كيتبدل دغيا. السر هو تخدم بـ UML غير كـ "سكتش" (sketch) باش تحل مشاكل محددة، ماشي كبلان ديال البني لي ما كيتبدلش.

## Use Case Diagrams باش تحدد الشغل
ملي كتبغي تبدا شي feature جديدة، أكبر خطر هو تنسى شي حاجة. Use Case diagrams كيركزو على *شكون* (Actor) كيدير *شنو* (Goal). مثلا فـ app ديال الشرا (procurement)، ما غاديش ترسم كل بوتون، ولكن غترسم 'الطلب' (Requester) مرتبط بـ 'صيفط طلب شراء' و 'المدير' (Manager) مرتبط بـ 'وافق على الطلب'. هكا كلشي كيكون عارف شنو غيتصاوب بالضبط.

## Activity Diagrams للوجيك المعقد
إلا كان عندك process فيه بزاف ديال 'إلا كان... دير...' (if/else)، الكتابة كتولي صعيبة فالفهم. Activity diagrams بحال شي flowchart مطور. كينفعو بزاف فـ circuit d'approbation: الطلب كيبدا، كيوصل لواحد اللوزة ديال القرار (واش الثمن كتر من 1000 درهم؟)، ومن تما كيمشي يا إما 'موافقة أوتوماتيكية' ولا 'خاص سينيور يسيني'.

## Sequence Diagrams للتواصل بين الـ Objects
هادو هما لي مفيدين بزاف حيت كيبينو الترتيب ديال الميساجات بين الـ objects مع الوقت. مثلا، إلا كانت الـ app خاصها تعيط لـ API ديال stock، ومن بعد تـ update la base de données، ومن بعد تصيفط Email، الـ sequence diagram كيخليك ما تنسى حتى خطوة وما تغلطش فـ logic.

مثال ديال flow:
`Requester` -> `RequestController`: submit()
`RequestController` -> `ApprovalService`: validate()
`ApprovalService` -> `Database`: saveRequest()

## Class Diagrams للهيكلة
ما تحاولش ترسم كل getter و setter. خدم بـ class diagrams غير باش تشوف العلاقات (Relationships) بحال Composition ولا Inheritance. مثلا، `PurchaseOrder` وحدة تقدر يكون عندها بزاف ديال `OrderItems`. رسمة بسيطة كتهنيك من مشاكل la base de données حيت كتفكر فـ cardinality (1:N ولا M:N) قبل ما تبدا تكودي.

## غلط شائع: الرسمة 'المثالية'
بزاف كيضيعو السوايع باش يرجعو الرسمة 'UML compliant' 100%. التصحيح: خدم بـ 'UML-lite'. إلا كان صاحبك فـ équipe فهم السهم فين غادي، راه كافية. الهدف هو التواصل ماشي الشهادة.

## تمرين تطبيقي
رسم sequence diagram صغير لـ flow ديال 'المدير رفض الطلب'. شكون هو الـ object لي خاصو يصيفط notification للـ Requester؟

**الجواب:** الـ `ApprovalService` ولا `RequestController` هو لي خاصو يعيط لـ `NotificationService` ملي يتبدل الـ status لـ 'Rejected' فـ la base de données.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
