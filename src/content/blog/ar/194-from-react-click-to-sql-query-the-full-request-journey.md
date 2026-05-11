---
title: "من كليك ديال React حتى لـ SQL Query: رحلة الطلب كاملة"
description: "شرح مبسط كيفاش كتمشي المعلومة من فاش كيورك المستخدم على Bouton في React حتى كتوصل لقاعدة البيانات SQL."
pubDate: 2026-10-14T17:48:00.000Z
translationKey: 194-from-react-click-to-sql-query-the-full-request-journey
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال الشراء (Procurement App). مدير كيورك على Bouton ديال 'Approve' باش يوافق على طلب شراء، ولكن ماعارفش شنو كيوقع بالضبط بين ديك الكليكة وبين فاش كيتغير السطر في Database. هاد الفراغ هو فين كيتلفو بزاف ديال المبتدئين.

## البداية: Event Handling في React
كلشي كيبدا بـ event listener. في React، هاد البوطون كيكون عنده `onClick` handler. فاش كيورك عليه المستخدم، هاد الدالة كتصيفط طلب HTTP asynchrone، غالباً باستعمال `fetch` أو Axios. المتصفح (Browser) كيجمع هاد الطلب فيه URL، Method (بحال POST)، و Body فيه ID ديال الطلب.

## القنطرة: HTTP و CORS
هاد الطلب كيسافر عبر الشبكة حتى كيوصل للسيرفر. قبل ما يخلي المتصفح الـ frontend يقرا الجواب، كيقلب واحد الحاجة سميتها CORS. إلا كان React خدام في `localhost:3000` و API في `localhost:8080` ، المتصفح كيتأكد واش السيرفر مسموح ليه بهاد الـ origin. خاصك تعرف بلي CORS هي سياسة ديال المتصفح باش يحمي البيانات من القراءة، ماشي هي اللي كدير l'authentification.

## المنطق: Backend Controller
فاش كيوصل الطلب للسيرفر (مثلاً Spring Boot)، كاين Controller كيشدو. كيقرا الـ JSON اللي جاي وكيصيفطو لـ Service layer. هنا فين كيكون المنطق ديال الخدمة (Business Logic): السيرفر كيتأكد واش هاد المستخدم عنده الحق فعلاً باش يوافق على هاد الطلب قبل ما يمشي لـ Database.

## الخطوة الأخيرة: SQL Execution
في الأخير، الـ backend كيخدم بـ repository باش يطبق query ديال SQL. في التطبيق ديالنا، غادي تكون بحال هكا:

```sql
UPDATE purchase_requests 
SET status = 'APPROVED' 
WHERE id = 123 AND status = 'PENDING';
```

## غلط شائع: الاعتماد على CORS في السيكيريتي
بزاف كيغلطو وكيصحاب ليهم بلي CORS هي اللي كتحبس الناس اللي ماعندهمش الحق يدخلو لـ API. في الحقيقة، CORS كتحبس غير *المتصفح* باش ما يقراش الجواب. أي واحد كيخدم بـ terminal (بحال cURL) يقدر يتجاوز CORS بسهولة. داكشي علاش ضروري دير التحقق من الصلاحيات (Authorization) في السيرفر.

## تمرين تطبيقي
إلا كانت App ديال React صيفطت طلب وطلع ليك 'CORS error' في console، ولكن لقيتي بلي الـ Database تبدلات فعلاً، علاش وقع هادشي؟

**الجواب:** الطلب وصل للسيرفر وتنفذات SQL query، ولكن السيرفر ما صيفطش header ديال `Access-Control-Allow-Origin` صحيح، داكشي علاش المتصفح بلوكا غير القراءة ديال الجواب.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
