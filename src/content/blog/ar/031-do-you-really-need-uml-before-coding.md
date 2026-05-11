---
title: "واش بصح محتاج UML قبل ما تبدا تكودي؟"
description: "واش UML ضرورية ولا غير تضييع ديال الوقت فاش كتكون يلاه بادي فالمشروع ديالك؟"
pubDate: 2026-10-07T22:48:00.000Z
translationKey: 031-do-you-really-need-uml-before-coding
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

تخيل راسك خدام على تطبيق ديال الشراء (procurement app)، فين الموظف كيدير طلب، المدير كيوافق عليه، ومن بعد المشتري (buyer) كيصاوب commande. بديتي تكودي نيشان، ولكن فوسط الطريق لقيتي بلي المنطق ديال الموافقة ديال المدير مخلط مع التنبيهات ديال المشتري. ضيعتي تلت أيام باش تعاود الكود، بينما كان ممكن تحل المشكل برسمة ديال 10 دقايق. هنا فين كيبدا النقاش على UML.

## علاش كانديرو Modeling؟
UML ماشي هي الرسم، ولكن هي باش نحيدو الغموض. بزاف ديال المطورين كيشوفوها غير تعقيدات إدارية، ولكن هي فالحقيقة بحال البلان ديال الدار. Use Case diagram كيورينا شكون هما الناس اللي غيخدمو بالتطبيق (Requester, Manager, Buyer) وشنو بغاو يديرو، باش حتى حاجة ماتنسى. أما Activity diagram كيوريك الطريق ديال القرارات—مثلا شنو كيوقع إلا المدير رفض الطلب—قبل ما تكتب حتى سطر ديال Java.

## Sequence Diagrams مقابل الكود
إلا كان Class diagram كيورينا الهيكل، Sequence Diagram كيورينا الترتيب ديال الأحداث. فالتطبيق ديالنا، هاد الدياغرام غيورينا بلي `RequestService` خاصو يعيط لـ `NotificationService` غير من بعد ما `ApprovalService` يرجع لينا بلي كولشي مزيان. هكا كنفاداو الغلط ديال نصيفطو Email قبل ما يتسجل الطلب فـ Database.

## UML Classes ماشي هي Tables ديال SQL
واحد الغلط كيديروه المبتدئين هو كيسحاب ليهم بلي Class diagram هو نيت Schema ديال Database. الـ Class فـ UML فيها السلوك (methods) والحالة (attributes)، ولكن Table فـ SQL فيها غير الداتا. مثلا، Class سميتها `ProcurementRequest` تقدر تكون فيها Method سميتها `calculateTotalTax()`، وهادي مستحيل تلقاها فـ Table ديال SQL.

## مثال تطبيقي: مسار الموافقة
إلا رسمنا مسار الموافقة، غنحددوا التفاعل بحال هكا:
1. **الشخص**: المدير
2. **الفعل**: `approveRequest(requestId)`
3. **المنطق**: واش `request.status == PENDING`؟ $ightarrow$ ردوها `APPROVED` $ightarrow$ علم المشتري.

بلا هاد الرسمة، المطور يقدر ينسى مايتحققش من الحالة (status)، ويولي الطلب يتوافق عليه بزاف ديال المرات.

## غلط شائع: كترت الرسم (Over-Modeling)
كاين اللي كيبقا يرسم كلشي حتى كيولي خايف يبدا يكودي (Analysis Paralysis). الحل هو ترسم غير الحوايج المعقدة. استعمل Sequence diagram للمنطق الصعيب، و Use Case باش تحدد شنو غيدير التطبيق، ولكن ما تضيعش وقتك فـ Class diagram مفصل للحوايج البسيطة.

## تمرين تطبيقي
**السيناريو**: المشتري خاصو يغير حالة الطلب لـ 'Ordered'. أما دياغرام UML اللي يقدر يورينا الترتيب ديال الهضرة بين المشتري، و OrderService، و InventorySystem؟

**الجواب**: Sequence Diagram، حيت هو اللي كيركز على الترتيب الزمني ديال الميساجات بين الـ objects.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
