---
title: "الفرق بين One-to-One و One-to-Many و Many-to-Many"
description: "دليل باش تختار النوع الصحيح ديال العلاقة بين الجداول في قاعدة البيانات باش تحافظ على سلامة المعلومات."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 045-one-to-one-vs-one-to-many-vs-many-to-many
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا كتصاوب تطبيق ديال المشتريات (procurement). عندك مستخدمين، طلبات شراء، وموردين. إلا غلطتي وربطتي طلب شراء بواحد المجموع ديال المديرين في مرحلة موافقة وحدة، غادي تولي عندك روينة في الداتا. المشكل ماشي هو كيفاش تكتب SQL، ولكن هو كيفاش تحدد العلاقة بين الجداول على حساب القواعد ديال الخدمة.

## One-to-One (1:1)
هادي كتكون ملي سجل واحد في الجدول A كيكون مرتبط بسجل واحد فقط في الجدول B. غالباً كنستعملوها باش نفرقو المعلومات الحساسة أو باش مانخليوش جدول واحد فيه بزاف ديال السطور. مثلاً، كل `User` عندو `UserConfiguration` وحدة فيها الإعدادات ديالو.

## One-to-Many (1:N)
هادي هي اللي مستعملة بزاف. سجل واحد في الجدول A يقدر يكون مرتبط بزاف ديال السجلات في الجدول B، ولكن السجل في B كيرجع لواحد فقط في A. مثلاً، `Manager` واحد يقدر يوافق على بزاف ديال `PurchaseRequests` ولكن كل طلب شراء كيكون تابع لمدير واحد فقط.

## Many-to-Many (M:N)
هنا بزاف ديال السجلات في A مرتبطين ببزاف ديال السجلات في B. هادي ما يمكنش تدار غير بـ Foreign Key عادي، خاصك ضروري دير 'Join Table'. مثلاً، `PurchaseRequest` وحدة تقدر يكون فيها بزاف ديال `Products` وفي نفس الوقت `Product` واحد يقدر يكون في بزاف ديال الطلبات.

## مثال تطبيقي: منطق المشتريات

| العلاقة | الجداول | النوع | كيفاش كتطبق |
| :--- | :--- | :--- | :--- |
| User → Profile | 1:1 | One-to-One | FK في جدول Profile |
| Manager → Request | 1:N | One-to-Many | FK في جدول Request |
| Request → Product | M:N | Many-to-Many | جدول وسيط `request_items` |

```sql
-- مثال ديال جدول وسيط Many-to-Many
CREATE TABLE request_items (
    request_id INT REFERENCES purchase_requests(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    PRIMARY KEY (request_id, product_id)
);
```

## غلط شائع: نسيان الجدول الوسيط
بزاف ديال الناس كيحاولوا يديروا `product_id` نيشان في جدول `purchase_requests` وهما باغيين علاقة Many-to-Many. هادشي كيخلي الطلب يكون فيه منتوج واحد فقط. الحل هو تخرج ديك العلاقة لجدول بوحدو (Join Table) باش تسجل كل منتوج بوحدو.

## تمرين تطبيقي
سيناريو: `Buyer` واحد يقدر يسير بزاف ديال `Suppliers` ولكن كل `Supplier` تابع لـ `Buyer` واحد فقط. شنو هي العلاقة هنا؟

**الجواب:** One-to-Many (1:N) من Buyer لـ Supplier.
