---
title: "كيفاش تـmap-ي العلاقات ديال Entities فـ JPA بطريقة صحيحة"
description: "شرح معمق على الـ owning side، mappedBy، وكيفاش تحول Many-to-Many لـ join entity باش تزيد فيها attributes."
pubDate: 2026-10-06T22:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
seriesOrder: 7
locale: ar
tags: ["database-design","learning-series"]
draft: false
---

## المشكل ديال @ManyToMany العادية

بزاف ديال developers كيبداو بـ `@ManyToMany` باش يربطو جوج entities. هاد الطريقة خدامة غير يلا كانت العلاقة بسيطة. ولكن فـ scenario ديالنا، الطالب (Student) كيتسجل فـ cours. يلا كنا بغينا نعرفو غير شكون تسجل فـ شكون، راه table de jointure كافية. ولكن غير نحتاجو نزيدو `enrollmentDate` (تاريخ التسجيل) ولا `grade` (النقطة)، هنا العلاقة مابقاتش غير خيط رابط، ولات entity بوحدها سميتها `Enrollment`.

باش تحول `@ManyToMany` لـ جوج ديال `@OneToMany` / `@ManyToOne` كتقدر تخلي الـ join entity تهز data ديالها. هادشي كيرد الموديل من مجرد رابط لـ entity pivot.

## شكون هو الـ Owning Side وشنو هو mappedBy

فـ mapping bidirectionnel ديال one-to-many/many-to-one اللي هنا، Enrollment.student و Enrollment.course هما اللي كيتحكمو فالعلاقات ديال foreign keys. Collections هما inverse side: mappedBy كيسمي field الحقيقي ديال Java فـ Enrollment، ماشي table ولا colonne. هاد القاعدة خاصة بهاد mapping؛ أنواع أخرى ديال العلاقات كتختار owning side بطريقة أخرى.

OneToMany unidirectionnel بلا mapping واضح ديال foreign key غالبا كيستعمل table de jointure. إلا باغي الجهة المعاكسة ديال Enrollment.student، كتب mappedBy="student". و OneToMany unidirectionnel بـ JoinColumn حتى هو mapping صالح؛ نسيان mappedBy ما كيعنيش ديما التصميم غلط.
## مثال تطبيقي: موديل التسجيل (Enrollment)

ها كيفاش نطبقو هادشي فـ الكود. ردو البال بلي استعملنا entities عادية للـ ORM.

```java
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
public class Student {
    @Id @GeneratedValue
    private Long id;
    private String name;

    // Referenced side: mappedBy كتشير لـ field 'student' اللي كاين فـ Enrollment
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();

    public void addCourse(Course course, LocalDate date) {
        Enrollment enrollment = new Enrollment(this, course, date);
        this.enrollments.add(enrollment);
        course.getEnrollments().add(enrollment);
    }
    // Getters omitted
    public List<Enrollment> getEnrollments() { return enrollments; }
}

@Entity
public class Course {
    @Id @GeneratedValue
    private Long id;
    private String title;

    // Referenced side: mappedBy كتشير لـ field 'course' اللي كاين فـ Enrollment
    @OneToMany(mappedBy = "course")
    private List<Enrollment> enrollments = new ArrayList<>();

    public List<Enrollment> getEnrollments() { return enrollments; }
}

@Entity
public class Enrollment {
    @Id @GeneratedValue
    private Long id;

    private LocalDate enrollmentDate;
    private Double grade;

    // Owning side: هاد الـ entity هي اللي كتحكم فـ الـ FKs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    protected Enrollment() {}

    public Enrollment(Student student, Course course, LocalDate date) {
        this.student = student;
        this.course = course;
        this.enrollmentDate = date;
    }
    // Getters omitted
}
```

### تحليل الميكانيزم
1. **فين كاينين الـ Foreign Keys**: الـ table ديال `Enrollment` هي اللي غتكون فيها `student_id` و `course_id`. الجداول ديال `Student` و `Course` كيبقاو نقيين.
2. **الـ Fetch Strategies**: الـ `@ManyToOne` كتكون `EAGER` بـ default. حنا رديناها `LAZY` باش نتفاداو chargement زايد فـ الدقة الأولى. ردو البال بلي مشكل « N+1 » كيوقع ملي كتجيب ليستة ديال enrollments وكتدخل لـ associations ديالهم؛ هاد المشكل كيتحل بـ JOIN FETCH فـ الـ query ماشي غير بـ LAZY.
3. **Synchronization Helpers**: الميثود `addCourse` فـ `Student` هي helper. حيت JPA مكيحدثش الجيهة الأخرى ديال العلاقة فـ الـ memory بوحدو، يلا منسيتيش تزيد الـ enrollment فـ بجوج لي ليست، تقدر تلقى data قديمة قبل ما يوقع flush.

## حالات الفشل والنتائج ديالها

- **Table زايدة:** Mapping الافتراضي ديال OneToMany unidirectionnel يقدر يزيد table ديال association. شوف التصميم اللي باغي، ما تعتبرش كل table زايدة غلط.
- **JSON فيه دورة:** Objects bidirectionnels يقدرو يديرو recursion إلا serializer ما مقادش. اختار response بحدود واضحة، غالبا DTO، ولا configuration مناسبة. DTO مفيد ولكن ماشي ضروري فكل API.
- **Orphan removal:** بـ orphanRemoval=true، إلا حيدتي enrollment من collection gérée ديال Student، كيتبرمج الحذف. بلا هاد option، تبديل غير inverse collection ما كيخليش foreign key يولي null أوتوماتيكيا وما كيمسحش row. خاص تبدل owning relationship ولا تمسح enrollment حسب القاعدة. حافظ حتى على توافق جوج collections فالذاكرة إلا العلاقة bidirectionnelle.
## تمرين تطبيقي

**Scenario**: بغينا نزيدو entity سميتها `CourseSection`. الـ `Course` الواحد فيه بزاف ديال `CourseSections` ، ودابا الـ `Enrollment` غتربط الـ `Student` بـ `CourseSection` محددة ماشي بـ `Course` بصفة عامة.

**السؤال**: شكون غتولي هي الـ owning side الجديدة بالنسبة للعلاقة مع `Student` ، وكيفاش غيتغير الـ `mappedBy` فـ الـ entity `Student` ؟

**الجواب**: الـ entity `Enrollment` كتبقى هي الـ owning side حيت هي اللي باقة هازة الـ foreign key ديال `Student`. ولكن، `Enrollment` غتبدل `@ManyToOne Course` بـ `@ManyToOne CourseSection`. أما الـ `mappedBy` فـ `Student` كيبقى هو هو `"student"` حيت السمية ديال الـ field فـ `Enrollment` ماتبدلاتش، ولكن الطريق باش نوصلو لـ `Course` ولات دابا: `Enrollment` → `CourseSection` → `Course`.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
