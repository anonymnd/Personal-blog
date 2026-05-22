---
title: "Map Entity Relationships Correctly with JPA"
description: "Deep dive into owning sides, mappedBy, and converting Many-to-Many relationships into join entities with attributes."
pubDate: 2026-10-06T22:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
seriesOrder: 7
locale: en
tags: ["database-design","learning-series"]
draft: false
---

## The Pitfall of Bare @ManyToMany

In many JPA projects, developers start with a `@ManyToMany` annotation to link two entities. While this works for simple associations, it fails the moment the relationship itself needs data. In our scenario, a Student enrolls in a Course. If we only need to know *which* students are in *which* courses, a join table suffices. However, once we need to track the `enrollmentDate` or the `grade`, the relationship is no longer a invisible link; it is a first-class domain concept: the `Enrollment`.

Converting a `@ManyToMany` into two `@OneToMany` / `@ManyToOne` relationships allows the join entity to hold its own state. This transforms the model from a direct link to a bridge entity.

## Defining the Owning Side and mappedBy

In the bidirectional one-to-many/many-to-one mappings below, Enrollment.student and Enrollment.course own their respective foreign-key relationships. The collection sides are inverse: mappedBy names the actual Java field on Enrollment, not a table or column. This rule is specific to this mapping; other relationship types choose ownership differently.

An unidirectional OneToMany without an explicit foreign-key mapping commonly uses a join table. If you intend the inverse of Enrollment.student, say mappedBy="student". A deliberately unidirectional OneToMany with JoinColumn is another valid mapping; omitting mappedBy does not universally imply a design mistake.
## Worked Example: The Enrollment Model

Here is the implementation of the Student-Course-Enrollment triad. Note the use of Java records for DTOs (not shown) and standard entities for the ORM.

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

    // Referenced side: mappedBy refers to the 'student' field in Enrollment
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();

    public void addCourse(Course course, LocalDate date) {
        Enrollment enrollment = new Enrollment(this, course, date);
        this.enrollments.add(enrollment);
        course.getEnrollments().add(enrollment);
    }
    // Getters omitted for brevity
    public List<Enrollment> getEnrollments() { return enrollments; }
}

@Entity
public class Course {
    @Id @GeneratedValue
    private Long id;
    private String title;

    // Referenced side: mappedBy refers to the 'course' field in Enrollment
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

    // Owning side: This entity manages the FKs
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

### Analysis of the Mechanism
1. **Foreign Key Placement**: The `Enrollment` table will contain `student_id` and `course_id`. The `Student` and `Course` tables remain clean of relationship columns.
2. **Fetch Strategies**: `@ManyToOne` defaults to `EAGER`. We explicitly set it to `LAZY` to prevent unnecessary immediate loads. Note that the "N+1 problem" occurs when loading a list of enrollments and accessing their associations; this is solved using JOIN FETCH in your queries, not just by setting LAZY.
3. **Synchronization Helpers**: The `addCourse` method in `Student` is a synchronization helper. Because JPA does not automatically update the other side of a bidirectional relationship in memory, failing to add the enrollment to both lists can lead to stale data in the current persistence context before a flush/refresh.

## Failure Cases and Consequences

- **Unexpected join table:** With the default unidirectional OneToMany mapping, omitting mappedBy can introduce an additional association table. Inspect the intended mapping and schema rather than assuming every extra table is wrong.
- **Circular JSON:** Bidirectional objects can recurse under an unconfigured serializer. Use a deliberately bounded response shape, often a DTO, or suitable serialization configuration. DTOs are a useful choice, not universally mandatory.
- **Orphan removal:** With orphanRemoval=true, removing an enrollment from the managed Student collection schedules its deletion. Without it, changing only this inverse collection does not automatically null the owning foreign key or delete the row. Explicitly update the owning relationship or delete the enrollment according to the business rule. Synchronize both in-memory collections when maintaining bidirectional links.
## Focused Exercise

**Scenario**: You need to add a `CourseSection` entity. A `Course` has many `CourseSections`, and an `Enrollment` now links a `Student` to a specific `CourseSection` instead of the general `Course`.

**Question**: Which entity becomes the new owning side for the relationship with `Student`, and how does the `mappedBy` attribute change in the `Student` entity?

**Answer**: The `Enrollment` entity remains the owning side because it still holds the foreign key to `Student`. However, the `Enrollment` entity now replaces the `@ManyToOne Course` with a `@ManyToOne CourseSection`. The `Student` entity's `mappedBy` remains `"student"` because the field name in `Enrollment` hasn't changed, but the logical path to the `Course` now goes through `Enrollment` → `CourseSection` → `Course`.

## Further reading

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
