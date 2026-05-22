---
title: "من قواعد البيزنس لـ Modèle ديال Database Relationnelle"
description: "كيفاش تحول قواعد كراء الماتيريال لـ schéma conceptuel, logique, و physique باستعمال cardinalités ديال Merise."
pubDate: 2026-10-06T21:48:00.000Z
translationKey: 035-why-database-design-should-happen-before-building-too-many-features
seriesOrder: 6
locale: ar
tags: ["database-design","learning-series"]
draft: false
---

## كيفاش نحولو قواعد البيزنس لـ Entities

بزاف ديال لي ديڤلوبور كيغلطو حيت كيمشيو نيشان لـ tables بلا ما يحللو قواعد البيزنس (Business Rules). الهدف هو نمشيو من هضرة عادية لـ modèle منظم. فـ scenario ديال كراء الماتيريال، القواعد هي:
1. الكليان (Customer) كيسيني كونطرا ديال كراء (Rental).
2. كل كونطرا فيها وحدة ولا بزاف ديال لي ليني (Line items).
3. كل ليني مرتبطة بـ ماتيريال (Equipment) محدد.
4. كل ليني كنسجلو فيها الثمن لي تفاهمو عليه (Agreed price) و واش رجع الماتيريال ولا لا (Return status).
5. الماتيريال يقدر يتكرا بزاف ديال المرات مع الوقت.

باش نلقاو لي entities، كنقلبو على 'الأسماء' لي عندها وجود مستقل وعندها خصائص. 
- **Customer**: كاين وخا ميكونش كاري دابا.
- **Rental**: حدث ديال كونطرا محددة.
- **Equipment**: الماتيريال لي كيتكرا.

الـ Attributes هما الخصائص ديال هاد لي entities. واحد الغلط شائع هو ملي كتحسب relation بحال إلا راها attribute. مثلاً، 'تاريخ الكراء' هو attribute ديال Rental، ولكن 'الثمن لي تفاهمو عليه' ماشي attribute ديال Equipment (حيت الثمن كيتبدل من كراء لكراء) وماشي ديال Rental (حيت الكونطرا فيها بزاف ديال الماتيريال بـ أثمن مختلفة). هاد الثمن كينتمي للتفاعل لي بيناتهم.

## الـ Modèle Conceptuel (MCD) و الـ Cardinalities

باستعمال Merise، كنحددو الـ MCD بالتركيز على لي entities و الـ associations ديالهم بـ cardinalités (min, max).

- **Customer <-> Rental**:
  - الكليان يقدر يسيني 0 ولا بزاف ديال لي rentals (0,N).
  - الـ Rental كيسينيها كليان واحد بالضبط (1,1).
- **Rental <-> Equipment**:
  - الـ Rental فيها 1 ولا بزاف ديال الماتيريال (1,N).
  - الماتيريال يقدر يكون فـ 0 ولا بزاف ديال لي rentals مع الوقت (0,N).

حيت العلاقة بين Rental و Equipment هي Many-to-Many (N:M) وفيها معلومات ديالها (الثمن، الحالة)، كتولي **Association Entity**. هنا فين كتحط الـ logique ديال 'Ligne de location'.

## من الـ Logical لـ Physical Mapping

باش نحولو من MCD لـ Physical Model (SQL)، كنطبقو قواعد محددة:
1. **علاقات 1:N**: الجهة ديال 'Many' كتاخد Foreign Key (FK) كيشير للجهة ديال 'One'. (Table `rentals` كتاخد `customer_id`).
2. **علاقات N:M**: كنكرييو table جديدة. الـ Primary Key ديالها غالباً كتكون composite من جوج FKs لي كتربط بيناتهم. (Table `rental_line_items` كتاخد `rental_id` و `equipment_id`).

### Schema Physique تطبيقي

ها هو الـ schema لي كيخرج. ردو البال استعملنا `DECIMAL` للفلوس باش نتفاداو مشاكل الـ floating-point.

```sql
-- Illustrative Physical Schema
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE rentals (
    id BIGINT PRIMARY KEY,
    rental_date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE equipment (
    id BIGINT PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model_name VARCHAR(255) NOT NULL
);

CREATE TABLE rental_line_items (
    rental_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    agreed_price DECIMAL(10, 2) NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (rental_id, equipment_id),
    CONSTRAINT fk_line_rental FOREIGN KEY (rental_id) REFERENCES rentals(id),
    CONSTRAINT fk_line_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);
```

## تحليل الـ Modèle

هاد الـ structure كتحافظ لينا على التاريخ (Historical facts). كون درنا غير `current_rental_id` فـ table `equipment` كون ضاع لينا شكون كرا داك الماتيريال قبل. بـ `rental_line_items` كنصاوبو بحال شي سجل (ledger) ديال كاع لي transactions.

**فخ 'الثمن الحالي' (The Current Price Trap)**
إلا درنا الثمن غير فـ table `equipment` وبدلناه اليوم، غادي يتبدل الثمن حتى فـ لي rentals ديال هادي 3 سنين فـ لي rapports ديالنا. ملي درنا `agreed_price` فـ table de jointure، خدينا 'تصويرة' (snapshot) ديال الثمن فـ اللحظة لي تسينات فيها الكونطرا.

## تمرين

**Scenario**: البيزنس قرر بلي كل ماتيريال خاصو يكون تابع لـ 'ديبو' (Warehouse) محدد قبل ما يتكرا. الديبو يقدر يكون فيه بزاف ديال الماتيريال، ولكن الماتيريال كيكون تابع لديبو واحد فـ دقة وحدة.

**السؤال**:
1. شنو هي الـ cardinality بين Warehouse و Equipment؟
2. كيفاش غادي يتبدل الـ schema physique؟

**الجواب**:
1. Warehouse (0,N) <-> Equipment (1,1). الديبو فيه 0 ولا بزاف ديال الماتيريال؛ والماتيريال خاصو يكون تابع لديبو واحد بالضبط.
2. Table `equipment` خاصنا نزيدو فيها column سميتها `warehouse_id` تكون Foreign Key كتشير لـ table جديدة سميتها `warehouses`.

Foreign keys فهاد المثال ما كيضمنوش بوحدهم أن كل rental فيها على الأقل line وحدة. خاص تتأكد من lines ملي كتأكد rental، داخل transaction ولا قاعدة مناسبة فالـ DB. Composite key كتفترض حتى أن نفس العتاد كيظهر غير مرة وحدة فكل rental.
