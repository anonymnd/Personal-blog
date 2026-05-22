---
title: "الفرق بين Primary Keys و Foreign Keys و Unique Constraints"
description: "كيفاش نفرقو بين هوية السطر (Identity)، سلامة العلاقات (Referential Integrity) و القواعد ديال البيزنس في PostgreSQL و JPA."
pubDate: 2026-10-08T00:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
seriesOrder: 33
locale: ar
tags: ["persistence","learning-series"]
draft: false
---

## الفرق بين الهوية (Identity) و التفرّد (Uniqueness)

بزاف ديال المطورين كيغلطو و كيسحاب ليهم بلي Primary Key (PK) هي نفسها Unique Constraint. وخا بجوجهم كيمنعو التكرار، ولكن كل وحدة كتحمي حاجة مختلفة. الـ Primary Key هي اللي كتعطي هوية ثابتة للسطر (Row Identity). أما الـ Unique Constraint فهي كتحمي "Candidate Key"—يعني قاعدة ديال البيزنس كتقول بلي واحد المجموعة ديال البيانات ما خاصهاش تعاود.

تخيل معايا سيستيم ديال الطيارات. الرحلة (Flight) ما يمكنش نعرفوها غير بـ flight number بوحدو، حيت نفس الرقم كيتعاود كل نهار. القاعدة ديال البيزنس هي: بالنسبة لشركة طيران معينة، فنهار محدد، كاين غير رحلة وحدة عندها رقم محدد. ولكن إلا درنا هاد التلاتة ديال السواري (columns) كـ composite PK، غادي يولي الربط مع الجداول الأخرى صعيب و تقيل. داكشي علاش كنستعملو surrogate PK (بحال UUID أو BigInt) للهوية، و Unique Constraint للقاعدة ديال البيزنس.

## سلامة العلاقات و الـ Foreign Key

الـ Foreign Key (FK) ماشي الهدف ديالها تعرف السطر، ولكن تضمن العلاقة. كتأكد بلي السطر اللي في الجدول الصغير (مثلا Ticket) ما يمكنش يشير لشي سطر ما كاينش في الجدول الكبير (Flight).

واحد النقطة مهمة بزاف: في PostgreSQL، ملي كدير Foreign Key، القاعدة ما كديرش index أوتوماتيكيا على داك السوار اللي فيه الـ FK. وخا الـ PK ديال الجدول الكبير (Parent) كيكون indexé، الـ FK ديال الجدول الصغير (Child) لا. هادشي كيعني بلي ملي كتبغي تمسح رحلة أو تقلب على التذاكر ديال رحلة معينة، PostgreSQL غادي تضطر تقلب في الجدول كامل (Sequential Scan) إلا إلا زدتي index بيدك على السوار ديال الـ FK.

## مثال تطبيقي: Schema ديال Flight و Ticket

ها كيفاش نطبقو هادشي بـ Jakarta Persistence (JPA) و PostgreSQL. غادي نفرقو بين الهوية التقنية و التفرّد ديال البيزنس.

```java
@Entity
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key: هوية السطر

    private String carrier;
    private String flightNumber;
    private LocalDate departureDate;

    // قاعدة البيزنس: ما يمكنش جوج رحلات لنفس الشركة/الرقم/التاريخ
    // كتدار عبر @Table(uniqueConstraints = ...) أو DDL SQL
}

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // هوية التذكرة بوحدها

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight; // Foreign Key: سلامة العلاقة

    private String passengerName;
    
    @Column(unique = true)
    private String ticketNumber; // Unique Constraint: مفتاح بديل
}
```

### تتبع العمليات في قاعدة البيانات

1. **إضافة رحلة**: `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → نجحت. تخدات PK رقم `1`.
2. **رحلة مكررة**: `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → **فشلت**: Unique constraint violation. قاعدة البيزنس تحمات.
3. **إضافة تذكرة**: `INSERT INTO ticket (flight_id, passenger_name) VALUES (1, 'Alice');` → نجحت. الـ FK تأكدات بلي الرحلة `1` كاينة.
4. **تذكرة يتيمة**: `INSERT INTO ticket (flight_id, passenger_name) VALUES (999, 'Bob');` → **فشلت**: Foreign key violation. سلامة العلاقة تحمات.
5. **أداء البحث**: `SELECT * FROM ticket WHERE flight_id = 1;` → **ثقيلة**. PostgreSQL كدير Sequential Scan حيت الـ FK `flight_id` ما عندوش index أوتوماتيكيا.

## القيم الفارغة (Nullability) و Unique Constraints

Primary key كتجمع uniqueness وNOT NULL؛ application غالبا كتخلي الهوية ثابتة ولكن PK بوحدها ما كتمنعش update. Unique constraint تقدر تسمح بـ null. PostgreSQL بالافتراضي كتعتبر nulls مختلفين للـ uniqueness؛ فـ SQL، NULL = NULL وNULL <> NULL بجوج كيعطيو unknown، ماشي true. NULLS NOT DISTINCT سياسة أخرى واضحة. جمع UNIQUE مع NOT NULL إلا business id خاصها تكون موجودة.
## تمرين

Seat number ماشي unique فكل flights، ما تقدرش بوحدها تحدد ticket. Surrogate ticket id اختيار مفيد؛ composite key حتى هي صالحة إلا trade-offs مناسبين. فرض UNIQUE(flight_id, seat_number) وخلي بجوج مطلوبين إلا كل seat معينة خاصها تعرف.

PostgreSQL كتخلق unique B-tree index. مناسبة لـ lookup بـ flight_id وseat_number، ما كتضمنش السرعة لـ seat_number بوحدها. ترتيب columns وversion وplanner كيهمو. FK ما كتخلقش index فـ child أوتوماتيكيا، ولكن index موجودة تقدر تغطيها وscan ديال table صغيرة ماشي ضروري بطيئة.

فـ duplicate-flight trace، خاصك فعلا تزيد unique constraint وbusiness columns NOT NULL بـ migration. Comment فـ Java ما كيحمي والو. Carrier/number/date uniqueness فرضية مبسطة؛ تأكد واش domain كتسمح بزاف legs ولا departures فنفس النهار.

## باش تزيد تفهم

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
