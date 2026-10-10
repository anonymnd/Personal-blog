---
title: "كيفاش تـموديلي Roles و Permissions بلا ما تضيع Ownership ديال الـ Resources"
description: "كيفاش تخدم بـ RBAC و ABAC مجموعين باش تحكم فـ شكون عندو الحق يدخل لـ resources معينة فـ متحف."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 206-roles-vs-permissions
seriesOrder: 44
locale: ar
tags: ["security","learning-series"]
draft: false
---

## الفرق بين الـ Role و الـ Ownership

الـ RBAC (Role-Based Access Control) مزيان باش تقسم الناس لمجموعات كبار. مثلاً فـ متحف، إلا عطيتي لشي واحد Role ديال `CURATOR` (قيم)، غادي يقدر يدخل لـ dashboard ديال التقييم. ولكن الـ RBAC بوحدو ما كافيش إلا بغيتي تقول بلي "القيم A" عندو الحق يبدل فـ معرض "حجر رشيد"، ولكن "القيم B" ما عندوش. إلا بقيتي غير كتشوف واش `hasRole('CURATOR')` راك عطيتي الحق لأي قيم يبدل أي حاجة، وهذا كيخالف مبدأ الـ least privilege (أقل صلاحيات ممكنة).

باش نحلوا هاد المشكل، كنجمعوا بين RBAC (شنو هو الـ role ديالك) و ABAC أو Ownership checks (شنو هي الـ resource اللي تابعة ليك). هكذا كنمنعوا الـ "privilege creep" فين مثلاً شي واحد فـ الـ `FINANCE` يقدر يلقى راسو كيقدر يبدل فـ المعارض غير حيت عندو role إداري عالي.

## كيفاش نصاوبو الـ Schema ديال الـ Permissions

بلا ما نكتبوا الـ roles وسط الـ business logic، كنفرقوهم باستعمال الـ permissions. الـ Role كيولي بحال شي صاك جامع مجموعة ديال الـ permissions، والـ resource assignment هي اللي كتقرر فـ اللخر واش عندك الحق فـ ديك الـ resource بالضبط.

### الـ Data Model

كنخدمو بـ many-to-many بين الـ users و الـ roles، وكنزيدو table خاصة بالـ assignments ديال الـ resources.

```java
// Modèle illustratif
public record User(Long id, String username, Set<Role> roles) {}

public record Role(Long id, String name, Set<Permission> permissions) {}

public record Permission(Long id, String code) {}

// هادي هي اللي كتحكم فـ شكون مول الـ resource
public record ResourceAssignment(
    Long userId,
    Long resourceId,
    String resourceType,
    String accessLevel // مثلاً: "EDITOR", "VIEWER"
) {}
```

## مثال تطبيقي: الوصول لمعارض المتحف

**السيناريو:**
- **Volunteer (متطوع):** يقدر يشوف المعارض فقط.
- **Curator (قيم):** يقدر يبدل فـ المعارض، ولكن غير اللي مـassignyين ليه.
- **Finance (مالية):** يقدر يشوف التقارير المالية ديال المعارض، ولكن ما يقدرش يبدل فـ المحتوى ديال المعرض.

### كيفاش كنطبقو الـ Security

ملي كتجي request باش تبدل شي معرض، السيستيم خاصو يدوز من جوج ديال الـ checks: الـ **Functional Check** (واش الـ role ديالك أصلاً كيسمح بالتعديل؟) والـ **Ownership Check** (واش أنت بالضبط مـassigny لهاد المعرض بالضبط؟).

```java
public class ExhibitSecurityService {
    private final ResourceAssignmentRepository assignmentRepo;

    public ExhibitSecurityService(ResourceAssignmentRepository repo) {
        this.assignmentRepo = repo;
    }

    public boolean canEditExhibit(User user, Long exhibitId) {
        // 1. Functional Check: واش الـ user عندو permission 'EXHIBIT_EDIT' فـ شي role من الـ roles ديالو؟
        boolean hasPermission = user.roles().stream()
            .flatMap(role -> role.permissions().stream())
            .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

        if (!hasPermission) return false;

        // 2. Ownership Check: واش الـ user مـassigny كـ EDITOR لهاد المعرض؟
        return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
            .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
            .orElse(false);
    }
}
```

### تحليل النتائج (Trace)

1. **متطوع** بغا يبدل معرض 101 → الـ Functional Check فشل (ما عندوش `EXHIBIT_EDIT`) → **ممنوع**.
2. **Finance** بغا يبدل معرض 101 → الـ Functional Check فشل (عندو `REPORT_VIEW` ماشي `EXHIBIT_EDIT`) → **ممنوع**.
3. **القيم A** (مـassigny لمعرض 101) بغا يبدل معرض 101 → الـ Functional Check داز → الـ Ownership Check داز → **مسموح**.
4. **القيم A** بغا يبدل معرض 202 (ما مـassigny ليه) → الـ Functional Check داز → الـ Ownership Check فشل → **ممنوع**.

## حالات الفشل و الـ Edge Cases

هاد model كتجمع role permissions ومن بعد كتراقب assignment ديال exhibit. دخل resource type فالـ lookup باش assignment ديال report بنفس id ما تسمحش بتعديل exhibit. findForResource custom repository method، ماشي standard findById.

User identity خاصها تجي من authenticated principal، ما تقبلش roles ولا userId من body بلا ثقة. راقب كل operation وحالات race بين تبديل assignment والتعديل. Permission ديال reassignment تقدر تصلح exhibit بلا owner بلا global edit للجميع.

Direct grants يقدرو يتـauditـاو إلا modeled بوضوح؛ هنا اخترنا roles للتبسيط، ماشي الآخرين مستحيلين. Super-curator bypass صلاحية قوية خاصها assignment محدودة وaudit. خاصها تبقى كتحتارم tenant ولا museum boundary.
## تمرين

**المطلوب:** بدل الـ logic باش تخلي Role ديال `SUPER_CURATOR` يقدر يبدل *أي* معرض بلا ما نشوفو الـ table ديال `ResourceAssignment`، ولكن الـ `CURATOR` العادي يبقى محبوس غير فـ المعارض ديالو.

**الجواب:**
كنزيدو check ديال الـ `SUPER_CURATOR` قبل ما نوصلو لـ ownership check:
```java
public boolean canEditExhibit(User user, Long exhibitId) {
    boolean isSuper = user.roles().stream().anyMatch(r -> r.name().equals("SUPER_CURATOR"));
    if (isSuper) return true; // كيدوز نيشان بلا ما يشوف الـ ownership

    boolean hasPermission = user.roles().stream()
        .flatMap(role -> role.permissions().stream())
        .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

    if (!hasPermission) return false;

    return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
        .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
        .orElse(false);
}
```

## باش تزيد تفهم

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
