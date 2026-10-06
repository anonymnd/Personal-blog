---
title: "شرح الـ Cardinality بلا ما تبقى تحفظ 1:N و N:M"
description: "تعلم كيفاش تحدد العلاقات في قاعدة البيانات بأسئلة بسيطة ديال البيزنس بلا ما تبقى تحفظ الرموز."
pubDate: 2026-10-08T06:48:00.000Z
translationKey: 039-cardinality-explained-without-memorizing-1-n-and-n-m
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال الناس اللي عاد بداو في Database Design كيتلفو حيت كيحاولوا يحفظوا رموز بحال '1:N' ولا 'N:M' قبل ما يفهموا كيفاش خدامة الخدمة (Business Logic). هادشي كيخليهم غير 'يخمنوا' العلاقة، وفي الأخير كيلقاو راسهم دايرين تكرار في الداتا ولا مكيقدروش يجبدو المعلومات اللي بغاو.

## طريقة جوج أسئلة
باش تعرف الـ cardinality، حبس من الشوف في الدياغرام وسول جوج أسئلة من الجهات بجوج. ناخدو مثال ديال تطبيق ديال الشراء (Procurement App) فين واحد الموظف (Requester) كيدير طلب شراء (Purchase Request).

1. من جهة الموظف: "واش موظف واحد يقدر يدير بزاف ديال الطلبات؟" (آه) → الـ Max هو Many. "واش ضروري يدير على الأقل طلب واحد؟" (لا) → الـ Min هو 0.
2. من جهة الطلب: "واش طلب واحد يقدر يكون ديال بزاف ديال الموظفين؟" (لا) → الـ Max هو 1. "واش ضروري يكون عندو موظف؟" (آه) → الـ Min هو 1.

## كيفاش نحولو هادشي لجدول
ملي كتجاوب على هاد الأسئلة، التصميم كيجي بوحدو. إلا لقيتي جهة فيها '1' وجهة فيها 'Many'، كدير الـ Foreign Key في الجهة ديال 'Many'. وإلا لقيتي بجوج بيهم 'Many'، هنا ميمكنش دير الساروت في حتى شي جدول، خاصك تزيد جدول جديد في الوسط (Join Entity).

## مثال تطبيقي: Workflow ديال الشراء
نشوفو العلاقة بين `PurchaseRequest` و `Manager` اللي كيوافق عليه.

- **قاعدة 1**: Manager واحد يقدر يوافق على بزاف ديال الطلبات. (Max: N)
- **قاعدة 2**: طلب واحد كيوافق عليه Manager واحد فقط. (Max: 1)

حيت العلاقة 1:N، غادي نزيدو `manager_id` في الجدول ديال `PurchaseRequest`.

```sql
-- Illustrative excerpt
CREATE TABLE managers (id INT PRIMARY KEY, name VARCHAR(100));
CREATE TABLE purchase_requests (id INT PRIMARY KEY, item VARCHAR(100), manager_id INT, FOREIGN KEY (manager_id) REFERENCES managers(id));
```

## غلط شائع: الفخ ديال Many-to-Many
بزاف ديال المطورين كيسحاب ليهم العلاقة ديما 1:N حيت ساهلة. مثلا، كيسحاب ليهم الطلب (`Request`) فيه غير منتوج واحد (`Product`). ولكن إلا كان الطلب يقدر يكون فيه بزاف ديال المنتوجات، والمنتوج يقدر يكون في بزاف ديال الطلبات، هنا الـ Foreign Key بوحدو مكيخدمش.

**التصحيح**: خاصك تكريه جدول سميتو `request_items` كيربط بين `request_id` و `product_id`.

## تمرين تطبيقي
في التطبيق ديالنا، الـ `Buyer` كيتكلف ببزاف ديال `PurchaseRequests` ولكن كل `PurchaseRequest` كيكون تابع لـ `Buyer` واحد. شنو هي الـ cardinality وفين غانديرو الـ foreign key؟

**الجواب**: العلاقة هي 1:N. والـ foreign key اللي هو `buyer_id` كيكون في الجدول ديال `PurchaseRequest`.
