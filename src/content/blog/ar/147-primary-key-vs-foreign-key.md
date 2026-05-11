---
title: "الفرق بين Primary Key و Foreign Key"
description: "فهم الفرق الأساسي بين المعرف الفريد والربط بين الجداول في تصميم قواعد البيانات."
pubDate: 2026-10-12T18:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). عندك جدول ديال الطلبات `Requests` وجدول ديال المستخدمين `Users`. إلا كنتي كتعتمد غير على السميات، غادي تطيح في مشكل نهار يدخلو جوج خدامة سميتهم 'أحمد'. ما غاديش تعرف شكون فيهم اللي دار الطلب. هنا فين كيبان الفرق بين Primary Key (PK) و Foreign Key (FK).

## الـ Primary Key: المعرف الفريد
الـ Primary Key هي واحد العمود (أو مجموعة أعمدة) اللي كيميز كل سطر في الجدول بطريقة فريدة. في PostgreSQL، غالباً كنستعملو عمود `id` بنوع `SERIAL` أو `UUID`. الـ PK خاصو يكون فريد (unique) وما يمكنش يكون خاوي (NULL). هو بحال لا بصمة ديال كل سجل في القاعدة.

## الـ Foreign Key: القنطرة ديال الربط
الـ Foreign Key هو عمود في جدول كيشير لـ Primary Key ديال جدول آخر. هو اللي كيدير العلاقة بيناتهم. بينما الـ PK كتعرف السطر، الـ FK كتربطو بسطر آخر. مثلاً، جدول `Requests` ما محتاجش يخزن السمية والبريد ديال المستخدم، محتاج غير `user_id` (اللي هو FK) باش يرجع لـ PK اللي كاين في جدول `Users`.

## مثال تطبيقي: نظام المشتريات
شوف هاد الجداول كيفاش مصاوبين:

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE requests (
    request_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    requester_id INT REFERENCES users(user_id)
);
```
إلا المستخدم رقم 101 (أحمد) طلب 'Laptop'، جدول `requests` غادي يتزاد فيه سطر فيه `request_id` هو 5001 و `requester_id` هو 101. قاعدة البيانات ما غاديش تخليك تزيد طلب بـ `requester_id` رقم 999 إلا إذا كان هاد المستخدم كاين فعلاً في جدول `users`.

## غلط شائع: الخلط في مسألة التكرار
بزاف ديال الناس كيسحاب ليهم بلي الـ Foreign Key خاصو يكون فريد وما يتكررش. هادشي غلط. في علاقة (واحد لـ بزاف)، الـ `requester_id` في جدول `requests` غادي يتكرر بزاف ديال المرات حيت المستخدم واحد يقدر يدير بزاف ديال الطلبات. اللي خاصو يكون فريد هو غير الـ Primary Key ديال الجدول ديالو.

## تمرين تطبيقي
سيناريو: عندك جدول `Products` وجدول `Orders`. أين عمود خاصو يكون Foreign Key في جدول `Orders` باش نربطوه بمنتوج معين؟

**الجواب:** العمود `product_id` في جدول `Orders` هو اللي خاصو يكون Foreign Key اللي كيشير لـ Primary Key `product_id` في جدول `Products`.

## باش تزيد تفهم

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
