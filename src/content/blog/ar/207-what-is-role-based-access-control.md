---
title: "شنو هو Role-Based Access Control (RBAC)؟"
description: "دليل للمبتدئين على كيفاش تسير الصلاحيات ديال المستخدمين عن طريق الأدوار (Roles) بلا ما تعطي كل حاجة بوحدها لكل واحد."
pubDate: 2026-10-15T06:48:00.000Z
translationKey: 207-what-is-role-based-access-control
locale: ar
tags: ["software-engineering","security","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال المشتريات (procurement app). عندك 50 ديال الموظفين، وكل واحد خاصو صلاحيات مختلفة. إلا بقيتي كتعطي 'يمكن_له_الموافقة' أو 'يمكن_له_الطلب' لكل مستخدم بوحدو، غادي تغلط شي نهار وتعطي لموظف جديد الحق باش يوافق على طلب ديال مليون دولار ديالو راسو. هاد الروينة هي علاش كنستعملو RBAC.

## كيفاش كيخدم RBAC
الـ RBAC كيزيد واحد الطبقة وسط بين المستخدم والصلاحية. بلاصة ما نديرو مستخدم → صلاحية، كنديرو مستخدم → دور (Role) → صلاحية. الدور هو ببساطة مجموعة ديال الصلاحيات. ملي كنعطيو دور لمستخدم، كيولي عندو الحق في كاع الصلاحيات اللي كاينين في داك الدور. هادشي كيخلي التسيير ساهل؛ إلا تبدلات قوانين الشركة، كتغير غير الدور مرة وحدة، وكاع الناس اللي عندهم داك الدور كيتحدثو في دقة وحدة.

## مثال تطبيقي: تطبيق المشتريات
في التطبيق ديالنا، غانديرو تلاتة ديال الأدوار:

| الدور (Role) | الصلاحيات (Permissions) |
| :--- | :--- |
| Requester | `CREATE_REQUEST`, `VIEW_OWN_REQUESTS` |
| Manager | `APPROVE_REQUEST`, `VIEW_DEPARTMENT_REQUESTS` |
| Buyer | `PLACE_ORDER`, `UPDATE_VENDOR_STATUS` |

إلا كانت سارة Manager، غانعطيوها الدور ديال `MANAGER`. ملي تبغي تدخل لـ `/approve` باش توافق على طلب، السيستيم كيشوف واش الدور ديالها فيه `APPROVE_REQUEST`. إلا كان، كيخليها تدخل.

## مثال بالكود
في Java Spring باستعمال Jakarta security، كنحميوا الميثود بحال هكا:

```java
@Service
public class ProcurementService {
    @PreAuthorize("hasRole('MANAGER')")
    public void approveRequest(Long requestId) {
        // Logic to approve the procurement request
    }
}
```

## غلط شائع: كثرة الأدوار (Role Explosion)
بزاف ديال الناس كيغلطو وكيديرو أدوار دقيقة بزاف (مثلاً `MANAGER_NORTH`, `MANAGER_SOUTH`). هادشي كيتسمى 'Role Explosion' وكيصعب التسيير. الحل هو دير دور واحد `MANAGER` وتخدم بـ attributes باش تفرق بين المناطق.

## تمرين تطبيقي
**الوضعية:** بغيتي تزيد 'Auditeur' (مراقب) يقدر يشوف كاع الطلبات ولكن ما يقدر يصاوب ولا يوافق على حتى حاجة. كيفاش دير ليها بـ RBAC؟

**الجواب:** كتصاوب دور جديد سميتو `AUDITOR` وكتعطيه غير صلاحية `VIEW_ALL` فقط، ومن بعد كتعطي هاد الدور للمستخدم المراقب.

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
