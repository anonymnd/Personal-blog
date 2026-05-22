---
title: "كيفاش تنورماليزي Database بلا ما تضيع المعنى ديال Business"
description: "استعمال functional dependencies باش نحيدو anomalies ونحافظو على snapshots ديال الثمن في الفاكتورات."
pubDate: 2026-10-06T23:48:00.000Z
translationKey: 047-what-is-database-normalization-and-why-should-you-care
seriesOrder: 8
locale: ar
tags: ["database-design","learning-series"]
draft: false
---

## الخطر ديال التكرار (Redundancy)

ملي كتكون عندنا table وحدة فيها بزاف ديال المعلومات اللي ما عندهاش علاقة مباشرة ببعضياتها، كيوقعو لينا مشاكل (anomalies). تخيل معايا table سميتها `RepairInvoice` فيها: `InvoiceID`, `CustomerID`, `CustomerPhone`, `PartID`, `SupplierName`, `SupplierPhone`, و `InvoicedPrice`.

هنا، `CustomerPhone` كيعتمد غير على `CustomerID` (هادي سميتها functional dependency)، و `SupplierPhone` كيعتمد غير على `PartID`. حيت هاد المعلومات كيتعاودو في كل فاكتورة، كنطيحو في 3 ديال المشاكل:

1. **Update Anomaly**: إلا بدل الكليان نيميرو ديالو، خاصك تدور على كاع الفاكتورات القدام وتبدلهم. إلا نسيتي وحدة، غتولي عندك data متناقضة.
2. **Insertion Anomaly**: ما تقدرش تزيد fournisseur جديد في السيستيم حتى تبيع شي قطعة ديالو في شي فاكتورة.
3. **Deletion Anomaly**: إلا مسحتي الفاكتورة الوحيدة اللي فيها واحد القطعة، غتمسح معاها المعلومات ديال fournisseur كاملين.

## الفرق بين الحالة الحالية (State) والتاريخ (History)

واحد الغلط كيديروه بزاف ديال الناس ملي كيبغيو ينورماليزيو هو كيمسحو معلومات كيبانو مكررين ولكن راهم snapshot تاريخي مهم.

في المثال ديالنا، `InvoicedPrice` كيبان بحال إلا كيعتمد غير على `PartID`. ولكن الثمن كيتبدل مع الوقت. إلا حيدتي الثمن من `InvoiceLine` ودرتيه غير في table ديال `Parts` وبدلتي الثمن اليوم، غيتبدل حتى الثمن ديال فاكتورة تدارت هادي 3 سنين. هنا غتكون ضيعتي المعنى ديال business.

- **Données Dynamiques**: نيميرو ديال الكليان (شنو كاين دابا).
- **Données Snapshot**: الثمن باش تباعت القطعة في ديك اللحظة (حقيقة تاريخية).

## الحل التطبيقي: Plan ديال Normalization

باش نحيدو anomalies ونخليو الثمن التاريخي، كنقسمو table على حساب functional dependencies.

### 1. تحديد التبعيات (Dependencies)
- `InvoiceID` → `CustomerID`, `InvoiceDate`
- `CustomerID` → `CustomerPhone`
- `PartID` → `SupplierID`, `PartName`
- `SupplierID` → `SupplierName`, `SupplierPhone`
- `(InvoiceID, PartID)` → `InvoicedPrice` (الثمن مرتبط بالعملية ماشي غير بالقطعة).

### 2. السكيما الجديدة (Logical Model)

- **Customers**: (`CustomerID` [PK], `CustomerPhone`)
- **Suppliers**: (`SupplierID` [PK], `SupplierName`, `SupplierPhone`)
- **Parts**: (`PartID` [PK], `PartName`, `SupplierID` [FK])
- **Invoices**: (`InvoiceID` [PK], `CustomerID` [FK], `InvoiceDate`)
- **InvoiceLines**: (`InvoiceID` [FK], `PartID` [FK], `InvoicedPrice`) → PK مخلطة (`InvoiceID`, `PartID`)

### 3. تحليل النتيجة
دابا المشاكل تحلو:
- **Update**: بدل نيميرو الكليان في بلاصة وحدة في table `Customers` وكلشي غيتحين.
- **Insertion**: زيد fournisseur جديد بلا ما تحتاج تكون عندك فاكتورة.
- **Deletion**: مسح فاكتورة بلا ما تضيع معلومات fournisseur.
- **Integrity**: `InvoicedPrice` بقى في `InvoiceLines` باش التاريخ يبقى صحيح وخا يتبدل الثمن في الكاتالوغ.

## تمرين

**Scenario**: عندك table سميتها `ProjectAssignment` فيها: `ProjectID`, `ProjectName`, `EmployeeID`, `EmployeeName`, `Role`, و `HourlyRate`. هاد `HourlyRate` كيتفاوض عليه على حساب كل project، ماشي هو الصالير العام ديال الموظف.

**المطلوب**: حدد functional dependencies وقول لينا شنو هما الحقول اللي خاصهم يبقاو في join entity باش ما نضيعوش المعنى ديال business.

**الجواب**:
- التبعيات: `ProjectID` → `ProjectName` و `EmployeeID` → `EmployeeName`.
- الـ `Role` و `HourlyRate` كيعتمدو على الزوج `(ProjectID, EmployeeID)`.
- باش نحافظو على المعنى، `HourlyRate` خاصو يبقى في join entity ديال `ProjectAssignment` حيت هو snapshot ديال الاتفاق على داك المشروع بالضبط، ماشي معلومة عامة على الموظف.

Key ديال InvoiceLine كتفترض كل part تظهر مرة وحدة فالفاتورة؛ إلا نفس part تقدر تجي فـ lines بثمن مختلف، استعمل identifiant ديال line. تخزين InvoicedPrice كيحافظ على المعنى بلا اعتماد على الثمن الحالي، ولكن row ما كتوليش immutable تقنيا بوحدها. منع تبديل التاريخ بلا حق خاصو checks بوحدو.
