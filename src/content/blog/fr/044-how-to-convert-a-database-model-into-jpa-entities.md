---
title: "Mapper Correctement les Relations d'Entités avec JPA"
description: "Analyse approfondie des côtés propriétaires, du mappedBy et de la conversion des relations Many-to-Many en entités de jointure avec attributs."
pubDate: 2026-10-06T22:48:00.000Z
translationKey: 044-how-to-convert-a-database-model-into-jpa-entities
seriesOrder: 7
locale: fr
tags: ["database-design","learning-series"]
draft: false
---

## Le Piège du @ManyToMany Simple

Dans beaucoup de projets JPA, on commence par une annotation `@ManyToMany` pour lier deux entités. Si cela fonctionne pour des associations simples, cela échoue dès que la relation elle-même doit porter des données. Dans notre scénario, un Étudiant s'inscrit à un Cours. Si nous voulons seulement savoir *quels* étudiants sont dans *quels* cours, une table de jointure suffit. Cependant, dès que nous devons suivre la `dateInscription` ou la `note`, la relation n'est plus un lien invisible ; elle devient un concept métier à part entière : l' `Inscription`.

Convertir un `@ManyToMany` en deux relations `@OneToMany` / `@ManyToOne` permet à l'entité de jointure de posséder son propre état. Cela transforme le modèle d'un lien direct vers une entité pivot.

## Définir le Côté Propriétaire et mappedBy

Dans les mappings bidirectionnels one-to-many/many-to-one ci-dessous, Enrollment.student et Enrollment.course possèdent leurs relations de clé étrangère. Les collections sont les côtés inverses : mappedBy nomme le champ Java réel dans Enrollment, pas une table ni une colonne. Cette règle concerne ce mapping ; d’autres types de relation définissent la propriété autrement.

Un OneToMany unidirectionnel sans mapping explicite de clé étrangère utilise généralement une table de jointure. Si vous voulez le côté inverse de Enrollment.student, indiquez mappedBy="student". Un OneToMany volontairement unidirectionnel avec JoinColumn est aussi valide ; l’absence de mappedBy ne constitue donc pas toujours une erreur.
## Exemple Concret : Le Modèle d'Inscription

Voici l'implémentation du triad Etudiant-Cours-Inscription. Notez l'utilisation d'entités standards pour l'ORM.

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

    // Côté référencé : mappedBy pointe vers le champ 'student' dans Enrollment
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();

    public void addCourse(Course course, LocalDate date) {
        Enrollment enrollment = new Enrollment(this, course, date);
        this.enrollments.add(enrollment);
        course.getEnrollments().add(enrollment);
    }
    // Getters omis
    public List<Enrollment> getEnrollments() { return enrollments; }
}

@Entity
public class Course {
    @Id @GeneratedValue
    private Long id;
    private String title;

    // Côté référencé : mappedBy pointe vers le champ 'course' dans Enrollment
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

    // Côté propriétaire : Cette entité gère les FK
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
    // Getters omis
}
```

### Analyse du Mécanisme
1. **Placement des Clés Étrangères** : La table `Enrollment` contiendra `student_id` et `course_id`. Les tables `Student` et `Course` restent propres.
2. **Stratégies de Fetch** : `@ManyToOne` est `EAGER` par défaut. Nous le passons explicitement en `LAZY` pour éviter les chargements immédiats inutiles. Notez que le problème « N+1 » survient lors du chargement d'une liste d'inscriptions et de l'accès à leurs associations ; on le résout via des requêtes JOIN FETCH, et non simplement avec LAZY.
3. **Aides à la Synchronisation** : La méthode `addCourse` dans `Student` est une aide à la synchronisation. Comme JPA ne met pas à jour automatiquement l'autre côté d'une relation bidirectionnelle en mémoire, oublier d'ajouter l'inscription aux deux listes peut mener à des données obsolètes avant le flush.

## Cas d'Échec et Conséquences

- **Table inattendue :** Le mapping OneToMany unidirectionnel par défaut peut introduire une table d’association. Vérifiez le schéma voulu au lieu de considérer chaque table supplémentaire comme incorrecte.
- **JSON circulaire :** Des objets bidirectionnels peuvent provoquer une récursion avec un sérialiseur non configuré. Employez une représentation bornée, souvent un DTO, ou une configuration de sérialisation adaptée. Les DTO sont utiles sans être universellement obligatoires.
- **Orphan removal :** Avec orphanRemoval=true, retirer une inscription de la collection gérée de Student programme sa suppression. Sans cette option, modifier seulement la collection inverse ne met pas automatiquement la clé étrangère à null et ne supprime pas la ligne. Modifiez explicitement la relation propriétaire ou supprimez l’inscription selon la règle métier. Maintenez les deux collections en mémoire quand les liens sont bidirectionnels.
## Exercice Ciblé

**Scénario** : Vous devez ajouter une entité `CourseSection`. Un `Course` a plusieurs `CourseSections`, et une `Enrollment` lie désormais un `Student` à une `CourseSection` spécifique plutôt qu'au `Course` général.

**Question** : Quelle entité devient le nouveau côté propriétaire pour la relation avec `Student`, et comment l'attribut `mappedBy` change-t-il dans l'entité `Student` ?

**Réponse** : L'entité `Enrollment` reste le côté propriétaire car elle détient toujours la clé étrangère vers `Student`. Cependant, l'entité `Enrollment` remplace désormais le `@ManyToOne Course` par un `@ManyToOne CourseSection`. Le `mappedBy` de l'entité `Student` reste `"student"` car le nom du champ dans `Enrollment` n'a pas changé, mais le chemin logique vers le `Course` passe désormais par `Enrollment` → `CourseSection` → `Course`.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
