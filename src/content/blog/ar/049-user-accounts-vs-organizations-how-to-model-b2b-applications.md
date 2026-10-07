---
title: "كيفاش تموديلي User، Organization و Tenant Memberships"
description: "شرح عميق ديال B2B multi-tenancy فين الـ user يقدر يكون فبزاف ديال الشركات مع الحفاظ على uniqueness لكل tenant."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
seriesOrder: 9
locale: ar
tags: ["database-design","learning-series"]
draft: false
---

## المشكل ديال Multi-Tenant Membership

فاش كنصاوبو تطبيقات B2B، واحد الغلط شائع هو أننا كنردّو الـ User تابع مباشرة لـ Organization وحدة. هادشي مكيخدمش إلا كان مثلاً consultant خدام مع جوج شركات فدقة وحدة. باش نحلّو هاد المشكل، خاصنا نفرقو بين الهوية (User) وبين السياق ديال الشركة (Organization) ونستعملو واحد الـ entity وسيطة سميتها Membership.

تخيل معايا consultant خدام مع جوج ديال الشركات. كل شركة عندها الـ billing contacts والـ projects ديالها بوحدها. هاد الـ consultant خاصو يقدر يبدل الـ context بين هاد الشركات، والهوية ديالو (email/password) كتبقى وحدة، ولكن الصلاحيات والمعلومات ديالو كتغير على حساب الشركة (tenant) اللي داخل ليها.

## الموديل اللوجيكي (Logical Model)

باش نطبقو هادشي، كنستعملو علاقة Many-to-Many اللي كنحللوها بـ join entity. هاد الطريقة كتخلينا نزيدو معلومات على العلاقة براسها، بحال فوقاش دخل الـ user لهاد الشركة أو شنو هو الـ status ديالو تما.

### تعريف الـ Entities
- **User**: الهوية العالمية (مثلاً `userId`, `email`, `passwordHash`).
- **Organization**: الشركة أو الـ tenant (مثلاً `orgId`, `companyName`, `billingAddress`).
- **Membership**: الرباط اللي بيناتهم (مثلاً `membershipId`, `userId`, `orgId`, `joinedAt`).

### Uniqueness على حساب الـ Tenant
واحد الحاجة مهمة بزاف هي أن شي attributes خاص يكونو unique غير وسط الـ tenant الواحد. مثلاً، الـ user يقدر يكون عندو "Username" أو "Employee ID" خاص بيه فشركة A، وهاد الـ ID يقدر يكون كيتعاود فشركة B. هاد المعلومة خاصها تكون فـ `Membership` ماشي فـ `User`.

## مثال تطبيقي: سيناريو الـ Consultant

نشوفو البيانات ديال سارة، consultant خدامة مع "TechCorp" و "DesignStudio".

### تتبع البيانات (Data Trace)

**جدول Users**
| userId | email |
| :--- | :--- |
| U1 | sarah@email.com |

**جدول Organizations**
| orgId | companyName |
| :--- | :--- |
| O1 | TechCorp |
| O2 | DesignStudio |

**جدول Memberships**
| membershipId | userId | orgId | tenantUsername |
| :--- | :--- | :--- | :--- |
| M1 | U1 | O1 | sarah_tech |
| M2 | U1 | O2 | sarah_design |

### التحقق من الموارد (Resource Tenant Checks)
فاش سارة كتبغي تشوف project، السيستيم مخصوش يشوف غير واش هي user مسجلة، ولكن خاصو يتأكد من الرباط ديال الـ membership.

**كيفاش كتم العملية:**
1. الطلب كيجي: `GET /projects/{projectId}`
2. السيستيم كيجبد الـ `orgId` اللي تابع ليه هاد الـ `{projectId}`.
3. السيستيم كيدير query: `SELECT 1 FROM memberships WHERE userId = :currentUserId AND orgId = :projectOrgId`.
4. إلا مالقاش والو، كيمنع الوصول (Access Denied)، وخا سارة user صحيح فالسيسيتيم.

## حالات الفشل (Failure Cases)

- **الـ Global Leak**: فاش كدير `orgId` فـ `Project` ولكن كتنسى تشيك الـ `Membership` فاش كيجي الطلب. هنا أي user يقدر يدخل لأي project إلا عرف الـ ID ديالو.
- **تضارب الهوية (Identity Collision)**: فاش كدير `tenantUsername` فجدول `User`. هكا سارة ميمكنش يكون عندها alias مختلف فكل شركة.
- **الـ Membership اليتيم (Orphaned)**: فاش كتمسح Organization وكتنسى تمسح الـ Memberships اللي تابعين ليها، كيوليو عندنا users تابعين لشركات مابقاتش موجودة.

## تمرين

**السيناريو**: بغينا نزيدو "تاريخ الانضمام" (Join Date) و "حالة العضوية" (Membership Status) بحال (Active/Pending). فين خاصنا نحطو هاد المعلومات وعلاش؟

**الجواب**: بجوجهم خاصهم يكونو فـ `Membership`. حيت "تاريخ الانضمام" كيكون خاص بالوقت اللي دخل فيه الـ user لشركة *معينة*، ماشي الوقت اللي تكريا فيه الـ account ديالو. و "الحالة" (Status) حتى هي كتغير على حساب الشركة؛ يقدر يكون "Active" فشركة A و "Pending" فشركة B.
