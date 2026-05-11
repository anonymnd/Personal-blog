---
title: "الفرق بين Roles و Permissions"
description: "تعلم كيفاش تفرق بين الهوية ديال المستخدم والأفعال اللي مسموح ليه يديرها باش تصاوب سيستيم ديال authorization ساهل في التطوير."
pubDate: 2026-10-15T05:48:00.000Z
translationKey: 206-roles-vs-permissions
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). في الأول، صاوبتي rôle سميتو 'Manager' وعطيتيه الحق يدخل لصفحة الموافقة (approval page). من بعد، لقيتي بلي حتى 'Senior Buyer' خاصو يوافق على الطلبات، ولكن ما خاصوش يشوف التقارير ديال الصالير ديال المانجر. إلا بقيتي خدام غير بـ Roles، غادي تولي تصاوب بزاف ديال الأدوار مخلطة بحال 'ManagerWithBuyerRights'، وهادشي غادي يولي كابوس في الماينتنانس.

## الفرق بيناتهم
الـ Roles هما ببساطة مجموعة ديال permissions. الـ Role كيجاوب على سؤال 'شكون أنت في الشركة؟' (مثلا: Admin, Requester)، بينما الـ Permission كتجاوب على 'شنو مسموح ليك دير؟' (مثلا: `request:create`, `request:approve`). ملي كتربط permissions بـ roles، و roles بـ users، كتصاوب واحد الطبقة اللي كتخلي السيستيم ديالك مرن.

## كيفاش تطبق هادشي
في تطبيق Spring باستعمال Jakarta EE، ما خاصكش تقلب على الـ role نيشان في الـ business logic. من الأحسن تقلب على الـ permission اللي محتاجها داك الفعل.

```java
// بلاش من هادي: if (user.hasRole("MANAGER")) { ... }

// دير هادي: قلب على permission محددة
if (user.hasPermission("request:approve")) {
    approvalService.process(requestId);
}
```

## مثال تطبيقي: سير العمل في المشتريات
نشوفو هاد التقسيم:
- **Role: Requester** → Permissions: `request:create`, `request:view_own`.
- **Role: Manager** → Permissions: `request:approve`, `request:view_all`.
- **Role: Buyer** → Permissions: `order:place`, `request:view_all`.

إلا كان المستخدم 'Manager'، يقدر يوافق على الطلب حيت `request:approve` مرتبطة بالـ role ديالو. وإلا قررات الشركة بلي حتى الـ Buyers يقدروا يوافقوا على طلبات صغيرة، غادي تزيد `request:approve` للـ role ديال Buyer بلا ما تقيس حتى سطر في الكود ديال Java.

## غلط شائع: كثرة الـ Roles
بزاف ديال الناس كيغلطوا ملي كيصاوبوا role جديد لكل حالة خاصة. مثلا، تصاوب `RegionalManager` و `GlobalManager` غير حيت الداتا اللي كيشوفوا مختلفة.

**التصحيح:** خلي الـ role هو `Manager` واستعمل attribute ديال 'Scope' أو 'Tenant' باش تحدد الداتا اللي يقدر يشوفها، وخلي الـ permissions (`request:approve`) هي نفسها.

## تمرين تطبيقي
**الحالة:** بغيتي تزيد 'Compliance Auditor' اللي يقدر يشوف كاع الطلبات والكوموندات، ولكن ما يقدر يصاوب ولا يوافق على حتى حاجة. شنو هي أحسن طريقة؟
1. تصاوب role سميتو 'Auditor' وتعطيه permissions ديال `request:view_all` و `order:view_all`.
2. تصاوب role سميتو 'Auditor' وتعطيه الـ role ديال 'Manager'.

**الجواب:** الاختيار 1. حيت إلا عطيتيه role ديال Manager، غادي يولي عندو الحق يدير `request:approve` وهذا غلط.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
