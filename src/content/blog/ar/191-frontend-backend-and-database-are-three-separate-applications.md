---
title: "Frontend, Backend و Database عبارة عن تلاتة ديال التطبيقات مفرقة"
description: "فهم الفرق بين الواجهة لي كيشوفها المستخدم، السيرفر لي فيه المنطق، والبلاصة فين كيتخزنو البيانات."
pubDate: 2026-10-14T14:48:00.000Z
translationKey: 191-frontend-backend-and-database-are-three-separate-applications
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

بزاف ديال المبتدئين كيجيهم صعيب يفهمو هاد 'الحيط' لي كاين بين الصفحة ديال HTML و Database. كيقولو علاش ما نقدرش نكتب SQL نيشان وسط JavaScript فالمتصفح. الحقيقة هي أن Frontend و Backend و Database هما تلاتة ديال الأدوار منطقية مفرقة وكل وحدة خدامة فبلاصة.

## بيئة المتصفح (Frontend)
الـ Frontend هو الكود لي كيتيليشارجا وكيخدم فالمكينة ديال المستخدم. سواء كنتي خدام بـ React ولا Vue ولا غير HTML، راه كولشي كيكون فالمتصفح. حيت خدام عند Client، ما عندوش الحق يدخل نيشان لـ Database حيت هادشي خطر؛ كون كان ممكن، أي واحد يقدر يحل console ديال المتصفح ويمسح ليك كاع البيانات.

## بيئة السيرفر (Backend)
الـ Backend هو تطبيق بوحدو خدام فـ serveur بعيد (بـ Jakarta EE ولا Node.js). هو لي كيكون بحال 'العساس'. كيتوصل بالطلبات (requests) من الـ Frontend، كيتأكد واش المستخدم عندو الحق، كيطبق القواعد ديال الخدمة، وعاد كيهضر مع الـ Database.

## طبقة البيانات (Database)
الـ Database هي برنامج متخصص (بحال PostgreSQL ولا MongoDB) خدمتو غير يخزن البيانات. هي كتهضر غير مع الـ Backend، وما عارفاش أصلا بلي كاين شي Frontend.

## مثال تطبيقي: طلب شراء (Procurement)
تخيل تطبيق ديال الشراء فين الموظف كيصيفط طلب:
1. **Frontend**: المستخدم كيعمر الفورمير وكيكليكي على 'Submit'. المتصفح كيصيفط HTTP POST لـ `https://api.company.com/requests`.
2. **Backend**: السيرفر ديال Java كيشد الطلب، كيشوف واش المستخدم مكونيكطي، وكيصيفط أمر: `INSERT INTO requests (item, qty) VALUES ('Laptop', 1);`.
3. **Database**: الـ DB كتخزن السطر وكتجاوب الـ Backend بلي العملية دازت.
4. **Backend**: السيرفر كيصيفط جواب `201 Created` للمتصفح.

## غلط شائع: الربط المباشر مع DB
واحد الغلط كيديروه بزاف هو محاولة استعمال JDBC ولا شي driver ديال DB وسط الكود ديال Frontend.
**التصحيح**: خاصك ديما تستعمل API. الـ Frontend كيعيط لـ endpoint، والـ Backend هو لي كيتكلف بالهضرة مع الـ Database.

## تمرين تطبيقي
إلا كان Frontend خدام فـ `http://localhost:3000` وبغا يجيب بيانات من Backend خدام فـ `http://localhost:8080`، شكون هو الطرف لي خاصو يضبط إعدادات CORS باش تسمح بهاد التواصل؟

**الجواب**: السيرفر ديال Backend هو لي خاصو يتكونفيجورا باش يقبل الطلبات لي جاية من origin ديال Frontend.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
