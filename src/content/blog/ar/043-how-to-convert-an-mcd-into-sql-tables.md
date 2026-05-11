---
title: "كيفاش تحول MCD لجداول SQL"
description: "تعلم كيفاش تحول Modèle Conceptuel de Données (MCD) لجداول SQL بطريقة صحيحة ومنظمة."
pubDate: 2026-10-08T10:48:00.000Z
translationKey: 043-how-to-convert-an-mcd-into-sql-tables
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المبتدئين كيغلطو ملي كيبغيو يحولو الرسم ديال MCD لجداول SQL. كيصحاب ليهم بلي أي دائرة هي جدول وأي خط هو مجرد سطر، وهذا كيؤدي لتكرار البيانات (redundancy) خصوصاً ملي كتكون العلاقة Many-to-Many.

## كيفاش كتم عملية التحويل
باش تحول MCD، خاصك تتبع قواعد محددة على حساب الـ cardinalités. أي Entité كتولي Table. أما العلاقة (Relation)، فكتعتمد على النوع ديالها: إذا كانت 1:N (واحد لـ بزاف)، الـ primary key ديال الجهة لي فيها '1' كتمشي كـ foreign key للجهة لي فيها 'N'. وإذا كانت N:N (بزاف لـ بزاف)، العلاقة براسها كتولي جدول جديد كيتسمى join table.

## مثال ديال تطبيق ديال المشتريات (Procurement)
تخيل عندنا سيستيم فين **Requester** (لي كيطلب) كيدير **Request** (طلب). Requester واحد يقدر يدير بزاف ديال الطلبات، ولكن الطلب كيكون ديال شخص واحد (1:N). وفي نفس الوقت، الطلب يقدر يكون فيه بزاف ديال **Products** (منتجات)، والمنتج يقدر يكون في بزاف ديال الطلبات (N:N).

1. **Requester** $ightarrow$ جدول `requesters` (id, name)
2. **Request** $ightarrow$ جدول `requests` (id, date, requester_id)
3. **Product** $ightarrow$ جدول `products` (id, label, price)
4. **Contains** (علاقة N:N) $ightarrow$ جدول `request_items` (request_id, product_id, quantity)

## مثال ديال الكود SQL
```sql
CREATE TABLE requesters (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE requests (
    id INT PRIMARY KEY,
    request_date DATE,
    requester_id INT,
    FOREIGN KEY (requester_id) REFERENCES requesters(id)
);

CREATE TABLE request_items (
    request_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (request_id, product_id),
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## غلط شائع: Attributs ديال العلاقة
واحد الغلط كيديروه بزاف هو ملي كيبغيو يحطو 'الكمية' (quantity) في جدول `products` أو `requests`. حيت الكمية مرتبطة بالطلب والمنتج بجوج، خاصها ضروري تكون في الجدول ديال الربط (`request_items`).

## تمرين تطبيقي
**الوضعية:** Manager كيوافق على Request. Manager واحد كيوافق على بزاف ديال الطلبات، ولكن الطلب كيوافق عليه Manager واحد. كيفاش نديرو ليها في SQL؟

**الجواب:** خاصنا نزيدو `manager_id` كـ foreign key في جدول `requests` لي كيشير لجدول جديد سميتو `managers`.
