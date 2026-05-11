---
title: "علاش العلاقات Many-to-Many غالباً كتحتاج Entity ديالها بوحدها"
description: "تعلم علاش الـ join entity ضرورية باش تسير العلاقات المعقدة وتخزن معلومات زايدة في تصميم قواعد البيانات."
pubDate: 2026-10-08T13:48:00.000Z
translationKey: 046-why-many-to-many-relationships-often-need-their-own-entity
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). الـ `Requester` يقدر يدير بزاف ديال `PurchaseRequests` (طلبات شراء)، وفي نفس الوقت طلب شراء واحد يقدر يكون مرتبط بزاف ديال `BudgetLines` (سطور ميزانية). إلا حاولتي تربطهم مباشرة في Database، غادي توحل: حيت العمود (column) ما يمكنش يهز ليستة ديال IDs بلا ما تهرس القواعد ديال Normalization.

## المشكل ديال الربط المباشر
في علاقة Many-to-Many (M:N)، حتى شي جهة ما كتمتلك الأخرى. إلا درتي غير foreign key في جدول `PurchaseRequest` غادي تقدر تربطو غير مع `BudgetLine` وحدة. باش تربطو مع تلاتة، خاصك تعاود تكرر المعلومات ديال الطلب تلاتة د المرات، وهذا كيدير مشاكل ديال التكرار (redundancy) وممكن تغلط فاش تبغي تبدل شي معلومة.

## الدور ديال الـ Join Entity
باش نحلوا هاد المشكل، كنصاوبو « Join Entity » (أو Entité Associative). بلاصة ما نديرو ربط مباشر، كنصاوبو جدول تالت في الوسط. هاد الجدول كيكون فيه foreign keys كيشيرو للجداول بجوج. هكا كنحولوا علاقة M:N لـ جوج ديال العلاقات One-to-Many (1:N)، وهادشي هو اللي كتعرف تتعامل معاه الـ Database مزيان.

## فاش كتولي العلاقة هي Entity
بزاف د المرات، العلاقة براسها كيكون عندها معلومات (attributes). في التطبيق ديالنا، فاش كنربطو `PurchaseRequest` مع `BudgetLine` كنبغيو نعرفو *شحال ديال الفلوس* تخصصات لهاد الربط بالضبط. هاد المعلومة ما كتمشيش مع الطلب (حيت عندو total) وما كتمشيش مع الميزانية (حيت عندها limit)، ولكن كتمشي مع *الربط* اللي بيناتهم.

## مثال تطبيقي
نشوفو `PurchaseRequest` و `BudgetLine`. غادي نصاوبو join entity سميتها `RequestAllocation`.

```sql
-- مثال توضيحي
CREATE TABLE RequestAllocation (
    request_id INT REFERENCES PurchaseRequest(id),
    budget_id INT REFERENCES BudgetLine(id),
    allocated_amount DECIMAL(10,2),
    PRIMARY KEY (request_id, budget_id)
);
```
النتيجة: دابا نقدروا نعرفو بالضبط شحال من ميزانية مشات لكل طلب بلا ما نعاودو نكتبو المعلومات الأساسية.

## غلط شائع: نسيان الـ Attributes
بزاف ديال المطورين كيخدمو بـ join table مخبية (بحال `@ManyToMany` في JPA) ومن بعد كيكتشفو بلي خاصهم يزيدو تاريخ (timestamp) أو حالة (status) للربط. حيت الجدول مخبي، كيضطروا يمسحو العلاقة ويعاودو يبنيوها كـ Entity كاملة.
**التصحيح:** إلا كانت كاين احتمال ولو بسيط بلي العلاقة غادي تحتاج معلومات خاصة بها، بدا بـ join entity من الأول.

## تمرين تطبيقي
في سيستيم فيه `Employees` خدامين في بزاف ديال `Projects` وبغيتي تسجل `role` (مثلاً: Lead أو Developer) ديال كل موظف في كل مشروع، واش تستعمل ربط M:N مباشر ولا join entity؟

**الجواب:** خاصك join entity، حيت الـ `role` هو معلومة تابعة للعلاقة براسها.
