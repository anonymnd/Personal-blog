---
title: "علاش نخدمو بـ Messaging بلاصت HTTP؟"
description: "شرح ديال كيفاش التواصل غير المتزامن (asynchronous) كايحل المشاكل ديال الـ request-response فـ الأنظمة الموزعة."
pubDate: 2026-10-16T02:48:00.000Z
translationKey: 227-why-use-messaging-instead-of-http
locale: ar
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

تخيل معايا خدام على application ديال الشراء (procurement). ملي شي واحد كايصيفط طلب شراء، السيستيم خاصو يعلم manager، ويشوف واش كاين budget، ويسجل هادشي فـ log. إلا خدمتي غير بـ HTTP، الـ browser ديال المستخدم غايبقى يتسنى حتى كاع هاد السيرفيسات يجاوبو. وإلا كان السيرفيس ديال budget طايح غير ثانية وحدة، الطلب كامل غايفشل والمستخدم غاتطلع ليه erreur 500.

## المشكل ديال التزامن (Synchronous Bottleneck)
HTTP هو بروتوكول synchrone. يعني client كايصيفط طلب وكيجلس يتسنى server يجاوبو. فـ microservices، هادشي كايخلق واحد الارتباط زمني (temporal coupling). إلا كان Service A كايعيط لـ Service B، و B كايعيط لـ C، راه A غايبقى محبوس حتى يسالي كلشي. هادشي كايزيد فـ الوقت ديال الانتظار (latency) وأي مشكل فـ سيرفيس واحد كايوقف كلشي.

## الحل بـ Messaging
هنا كاندخلو واحد الوسيط سميتو Message Broker (بحال RabbitMQ ولا Kafka). بلاصت ما نعيطو لـ API مباشرة، الـ producer كايصيفط ميساج لواحد الـ queue وكايجاوب المستخدم ديك الساعة بلي الطلب وصل. السيرفيسات لخرين (consumers) كاياخدو الميساج وكايعالجوه على خاطرهوم. هادشي كايتسمى asynchronous communication.

## مثال تطبيقي: Workflow ديال الشراء
فـ حالة HTTP، الـ endpoint ديال `SubmitRequest` كايعيط لـ `BudgetService.check()` و `NotificationService.send()`. إلا كان سيرفيس notifications تقيل، المستخدم غايبقى يتسنى.

فـ حالة Messaging:
1. `ProcurementService` كايسجل الطلب فـ DB.
2. كايصيفط ميساج: `{ "requestId": 101, "status": "SUBMITTED" }` لـ `request_topic`.
3. `BudgetService` و `NotificationService` كاياخدو هاد الميساج كل واحد بوحدو.

**النتيجة:** المستخدم كايشوف "تم إرسال الطلب" فـ البلاصة، والخدمات لخرين كيكملو شغلهم فـ الخلفية بلا ما يبلوكيوا الـ UI.

## غلط شائع: كايسحاب لينا الميساج كايوصل مرة وحدة ضروري
بزاف ديال المطورين كايصحاب ليهم بلي message queue هي بديل ديال database transaction. كايسحاب ليهم بلي الميساج غايتعالج مرة وحدة بالضبط (exactly once). ولكن فـ الواقع، المشاكل ديال الريزو تقدر تخلي الميساج يتصيفط جوج مرات.

**التصحيح:** خاصنا نخدمو بـ idempotency. يعني `BudgetService` خاصو يتأكد واش ديجا عالج `requestId: 101` قبل ما ينقص الفلوس، باش الميساجات المكررة ماتنقصش الفلوس جوج مرات.

## تمرين تطبيقي
سيناريو: مستخدم طلع PDF كبير باش يدير audit. السيستيم خاصو يصاوب تصويرة صغيرة (thumbnail) ويفحص الملف من الفيروسات.

سؤال: علاش HTTP ماشي اختيار مزيان باش نديرو scan ديال الفيروسات؟

**الجواب:** حيت scan ديال الفيروسات كاياخد الوقت. الـ connection ديال HTTP تقدر تسالي (timeout)، ومكاينش علاش المستخدم يبقى حال الـ browser ديالو كيتسنى السيرفيس يسالي scan.
