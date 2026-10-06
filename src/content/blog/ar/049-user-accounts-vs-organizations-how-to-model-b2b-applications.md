---
title: "User Accounts مقابل Organizations: كيفاش تصمم B2B Applications"
description: "تعلم كيفاش تفرق بين الحساب ديال المستخدم والشركة باش تصاوب تطبيق B2B كيدعم بزاف ديال الشركات."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
locale: ar
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app). فالبداية، تقدر تظن بلي المستخدم هو نيت الشركة. ولكن من بعد، كيطلع ليك مشكل: واحد manager خاصو يسير 3 ديال الشركات مختلفة بإيميل واحد. إلا كنتي داير `company_name` وسط الجدول ديال `User` غادي تحصل. هنا فين كاين الفرق بين الهوية (شكون لي داخل للتطبيق) والمنظمة (شكون لي كيملك البيانات).

## الفرق من الناحية التصميمية
فالتطبيقات ديال B2B، خاصك تفصل بين **User Account** و **Organization**. الحساب ديال المستخدم كيتكلف غير بالكونيكسيون (email, password)، أما المنظمة هي لي فيها المعلومات ديال البيزنس (الضريبة، العنوان، الميزانية). الرابط بيناتهم هو "العضوية" (Membership).

## كيفاش تصاوب العلاقة
باش تطبق هادشي، خاصك جدول وسيط (join entity) كيتسمى غالباً `Membership`. هاد الجدول ماشي غير كيربط IDs، ولكن كيزيد معلومات على العلاقة، بحال الدور (role) ديال هاد الشخص فديك الشركة بالضبط.

| Entity | الدور ديالها |
| :--- | :--- |
| User | الكونيكسيون والبروفيل |
| Organization | معلومات الشركة والإعدادات |
| Membership | الدور والصلاحيات فكل شركة |

## مثال تطبيقي: عملية الشراء
نفترضو واحد الموظف بغا يدير طلب شراء. السيستيم خاصو يعرف ماشي غير شكون هو هاد الشخص، ولكن أما شركة كيمثل دابا.

```java
// مثال بسيط ديال الموديل
public class User {
    private Long id;
    private String email;
}

public class Organization {
    private Long id;
    private String companyName;
}

public class Membership {
    private Long userId;
    private Long organizationId;
    private String role; // مثلا "MANAGER" أو "BUYER"
}
```
ملي كيتصاوب `PurchaseRequest` خاصو يكون مرتبط بـ `OrganizationId` ماشي غير بـ `UserId`. هكا، إلا خرج الموظف من الشركة، السجلات ديال الشراء كيبقاو تابعين للشركة ماشي للشخص.

## غلط شائع: ربط المستخدم بشركة وحدة
بزاف ديال المطورين كيديرو `organization_id` نيشان فجدول `User`. هادشي كيخلي المستخدم يكون تابع لشركة وحدة فقط. الحل هو تحيد هاد الـ foreign key وتديرو فجدول `Membership` باش تولي العلاقة Many-to-Many.

## تمرين تطبيقي
إلا كان واحد المستخدم هو 'Manager' فشركة A وهو 'Requester' فشركة B، فين خاصنا نديرو العمود ديال `role`: فجدول `User` ولا `Organization` ولا `Membership`؟

**الجواب:** فجدول `Membership` حيت الدور كيتغير على حساب الشركة لي خدام فيها المستخدم.
