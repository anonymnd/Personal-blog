---
title: "علاش الـ Frontend ما خاصوش يتصل مباشرة بـ la Base de Données"
description: "شرح للمخاطر ديال السيكيريتي والمعمارية فاش كنحيدو الـ backend من العملية ديال التواصل مع الداتا بيز."
pubDate: 2026-10-14T15:48:00.000Z
translationKey: 192-why-the-frontend-should-never-connect-directly-to-the-database
locale: ar
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

تخيل معايا خدام على تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. إلا خليتي الـ frontend (بحال React ولا Vue) يتصل نيشان بـ PostgreSQL باستعمال connection string، راك عطيتي السوارت ديال الشركة كاملة لأي واحد دخل للسيت. حيت الكود ديال frontend كيتنفذ فـ browser ديال المستخدم، أي سر حطيتيه تما راه باين للجميع.

## تسريب المعلومات السرية (Credentials)
باش الـ browser يتصل بـ la base de données، خاصو username و password. المستخدم يقدر بكل سهولة يحل 'Developer Tools' ويلقى هاد المعلومات فـ source code. ملي كيوليو عندو، يقدر يتجاوز السيت ديالك ويخدم بـ client SQL باش يمسح جداول كاملة بـ `DROP TABLE users;` ولا يبدل الصالير ديالو بـ `UPDATE salaries SET amount = 999999;`.

## غياب المنطق ديال الخدمة (Business Logic)
فاش كيكون الاتصال مباشر، الداتا بيز كتنفذ الطلب بلا ما يكون شي « عساس ». فالتطبيق ديالنا، اللي كيطلب الشراء ما خاصوش هو اللي يوافق عليه. إلا كان الـ frontend كيهضر نيشان مع DB، الحاجة الوحيدة اللي حابسة المستخدم باش يوافق على الطلب ديالو هي بوطونة مخبية فـ UI. أي واحد شوية فـ informatique يقدر يصيفط SQL update يبدل الحالة لـ 'Approved' حيت ما كاينش backend يتأكد واش هاد الشخص عندو رول ديال 'Manager'.

## مشكل CORS والريزو
الـ browsers كيخدمو بواحد السياسة سميتها CORS. هادي ميكانيزم ديال السيكيريتي باش يمنعو قراءة البيانات من origin مختلف. المشكل هو أن la base de données ما مصوباش باش تجاوب على طلبات CORS ديال HTTP. باش يحلوا هاد المشكل، بزاف ديال المطورين كيطفيو السيكيريتي، وهادشي كيزيد يفتح الباب للهجمات.

## مثال تطبيقي: الطريقة الغالطة والطريقة الصحيحة
**الطريقة الغالطة (Direct):**
`Frontend` $ightarrow$ `SQL: UPDATE requests SET status='Approved' WHERE id=101` $ightarrow$ `Database` (ما كاين حتى تحقُّق).

**الطريقة الصحيحة (Via Backend):**
`Frontend` $ightarrow$ `POST /api/approve/101` $ightarrow$ `Backend (Jakarta EE/Spring)` $ightarrow$ `Database`.

هنا الـ backend هو اللي كيتحقق: `if (!user.hasRole("MANAGER")) throw new UnauthorizedException();`. عاد من بعد كيصيفط الأمر لـ DB.

## غلط شائع: الاعتماد على validation ديال frontend
كاين اللي كيسحاب ليه بلي إلا خبا شي خانة ولا دار `disabled` لشي بوطونة راه السيت محمي.
**التصحيح:** ديما اعتبر بلي الـ frontend مخترق. أي طلب غادي للداتا بيز خاصو يدوز من backend باش يتأكد من الهوية والصلاحيات.

## تمرين تطبيقي
إلا كان تطبيق الشراء كيسمح للمستخدم يبدل ثمن السلعة حيت متصل نيشان بـ DB، شنو هي أحسن طريقة باش نحبسو هادشي؟

**الجواب:** نديرو API layer فـ backend هي اللي كتشوف واش المستخدم عندو الحق (Role: Buyer) باش يبدل الثمن، عاد تصيفط التعديل لـ la base de données.


## باش تزيد تفهم

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
