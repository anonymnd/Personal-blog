---
title: "شنو الفرق بين Unique Constraint و Primary Key؟"
description: "فهم الفرق بين Primary Key و Unique Constraint باش تحافظ على سلامة البيانات فـ database ديالك."
pubDate: 2026-10-12T19:48:00.000Z
translationKey: 148-unique-constraint-vs-primary-key
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات). عندك table سميتها `PurchaseRequest`. تقدر تقول مع راسك: 'راه ديجا عندي ID لكل request، علاش غادي نزيد constraint أخرى على رقم الطلب؟'. هاد الغلط كيخلي database تقبل بيانات مكررة فـ identifiers ديال البيزنس، وهادشي كيدير مشاكل كبيرة فـ التقارير.

## الفرق الأساسي
الـ Primary Key (PK) هو المعرف الوحيد ديال السطر (row). هو اللي كيعتمد عليه database باش يلقى سطر محدد بدقة. أما الـ Unique Constraint (UC)، فهي غير كتضمن بلي حتى شي جوج سطور ما يكون عندهم نفس القيمة فـ واحد column، ولكن ماشي بالضرورة هي اللي كتعرف بالسطر.

## فروقات تقنية مهمة
بجوجهم كيمنعوا التكرار، ولكن كاين فرق فـ التعامل مع NULLs والعدد. الـ table تقدر يكون فيها غير Primary Key واحد، ولكن تقدر دير فيها بزاف ديال Unique Constraints. وأهم حاجة هي أن PK ميمكنش تكون NULL، بينما UC غالباً كتقبل NULL (على حساب نوع SQL)، حيت NULL كيتعبر قيمة مجهولة ماشي تكرار.

## مثال تطبيقي: App ديال المشتريات
نشوفو entity سميتها `Request`. غادي نستعملو ID تقني كـ PK، ولكن `request_code` (مثلاً 'REQ-2023-001') خاصو يكون unique باش المستخدمين ما يغلطوش.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key

    @Column(unique = true, nullable = false)
    private String requestCode; // Unique Constraint
    
    private String itemDescription;
}
```
فـ PostgreSQL، هادشي كيكريي index B-tree ليهم بجوج. إلا حاولتي تدخل جوج requests عندهم نفس الـ `requestCode` الـ database غادي تعطيك `ConstraintViolationException` وخا الـ `id` يكون مختلف.

## غلط شائع: استعمال Business Keys كـ PK
بزاف ديال الناس كيغلطو ويديرو email أو code requête كـ Primary Key. المشكل هو إلا تبدلات المعلومة (مثلاً المستخدم بدل email ديالو)، خاصك تبدل الـ PK فـ كاع الجداول اللي مرتبطة بيها (Foreign Keys)، وهادشي صعيب وكيقدر يهرس data. الحل هو تخدم بـ surrogate key (بحال Long ID) كـ PK وتدير Unique Constraint للمعلومة ديال البيزنس.

## تمرين تطبيقي
أينا constraint خاصك تخدم بيها لـ column ديال `numéro_sécurité_sociale` إلا كانت الـ table ديجا فيها column `id`؟

**الجواب:** خاصك تخدم بـ Unique Constraint. هكا كتضمن بلي حتى شي جوج ناس ما عندهم نفس الرقم، وكتخلي الـ `id` هو المرجع الداخلي الثابت.

## باش تزيد تفهم

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
