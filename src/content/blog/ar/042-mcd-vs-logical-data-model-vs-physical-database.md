---
title: "الفرق بين MCD و Logical Data Model و Physical Database"
description: "دليل باش تفهم الفرق بين مراحل تصميم قاعدة البيانات، من القواعد ديال البيزنس حتى للتطبيق الفيزيائي."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 042-mcd-vs-logical-data-model-vs-physical-database
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

تخيل راسك خدام على تطبيق ديال الشراء (procurement). الشيف ديالك قال ليك: 'واحد requester يقدر يدير بزاف ديال requests، ولكن كل request خاصها تكون تابعة لـ requester واحد'. إلا مشيتي نيشان لـ SQL، تقدر تنسى شي قواعد مهمة وتصاوب structure صعيب تبدلها من بعد. داكشي علاش كنقسمو الخدمة لـ 3 ديال المراحل.

## Modèle Conceptuel des Données (MCD)
الـ MCD كيركز على 'شنو' هما البيانات، ماشي 'كيفاش' غيتخزنو. كنخدمو فيه بـ entities و relations. مثلاً، عندنا `Requester` و `PurchaseRequest` والعلاقة بيناتهم هي 'Submits'. هنا كنحددو الـ cardinalities: الـ Requester يقدر يدير من 0 حتى لـ N ديال requests، ولكن الـ Request خاصها ضروري تكون تابعة لـ 1 Requester. هنا ماكاينش foreign keys، كاينين غير قواعد البيزنس.

## Modèle Logique de Données (MLD)
الـ MLD كيحول الـ MCD لشي حاجة اللي تفهمها base de données، بلا ما نحددو واش غنخدمو بـ MySQL ولا Oracle. هنا فين كيبانو الـ primary keys و foreign keys. إلا كانت عندنا علاقة many-to-many—مثلاً `Request` فيها بزاف ديال `Products` و `Product` يقدر يكون في بزاف ديال `Requests`—الـ MLD كيخلق لينا 'join entity' (مثلاً `RequestLine`) باش نحطو فيها معلومات بحال `quantity`.

## Physical Database (MPD)
الـ MPD هو التطبيق الحقيقي في السيرفر. هنا كنحددو types de données (بحال `VARCHAR`, `INT`) وكنزيدو الـ indexes باش تكون base de données سريعة، وكنحددو واش الـ column خاصها تكون `NOT NULL`.

## مثال تطبيقي: نظام الشراء

| المرحلة | التمثيل |
| :--- | :--- |
| **MCD** | `Requester` --(Submits)--> `PurchaseRequest` |
| **MLD** | `Requester(id, name)` → `PurchaseRequest(id, date, requester_id)` |
| **MPD** | `CREATE TABLE PurchaseRequest (id INT PRIMARY KEY, requester_id INT REFERENCES Requester(id))` |

## غلط شائع: تنقز الـ MCD
بزاف ديال developers كيمشيو نيشان للـ Physical model. الغلط هنا هو أنك كتنسى الـ business rules. مثلاً، إلا نسيتي بلي الـ `Manager` يقدر يكون optional في شي طلبات، الـ database غتبقى تعطيك errors ملي تبغي تسجل طلب مافيهش manager.

## تمرين تطبيقي
**السيناريو:** واحد `Buyer` كيسير بزاف ديال `Orders` ولكن كل `Order` كيسيرها `Buyer` واحد.
**السؤال:** أما موديل اللي كنزيدو فيه الـ foreign key سميتها `buyer_id` في الجدول ديال `Orders`؟

**الجواب:** الـ Modèle Logique de Données (MLD).
