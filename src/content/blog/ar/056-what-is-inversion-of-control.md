---
title: "شنو هو Inversion of Control؟"
description: "واحد التغيير فالبنية ديال البرمجة فين الـ framework هو لي كيتحكم فـ lifecycle ديال objects ماشي المبرمج."
pubDate: 2026-10-08T23:48:00.000Z
translationKey: 056-what-is-inversion-of-control
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل معايا خدام على application ديال الشراء (procurement). عندك واحد `ProcurementService` لي محتاج `BuyerRepository` باش يسجل الطلبات. فالطريقة العادية، الـ service هو لي كيكريي الـ repository باستعمال `new BuyerRepository()`. هنا كنوليو فـ 'dépendance forte'؛ يعني الـ service خاصو يكون عارف بالضبط كيفاش يتصاوب الـ repository، وإلا تبدلات الطريقة باش كيتصاوب الـ repository، خاصك تبدل الكود فـ الـ service كامل.

## كيفاش خدامة هاد اللعيبة
الـ Inversion of Control (IoC) كتقلب هاد العلاقة. بلاصة ما الـ service هو لي يتحكم فـ إنشاء التبعيات (dependencies) ديالو، كيولي غير كيقول شنو محتاج. واحد الجهة خارجية—لي هي الـ IoC Container—هي لي كتكلف تصاوب الـ objects وتدخلهم (inject) للـ service. يعني التحكم تحول من الكود ديالنا للـ framework.

## مثال تطبيقي بـ Spring Boot
فـ Spring Boot، كنستعملو annotations باش نقولو للـ container شكون هما الـ classes لي خاصو يتكلف بيهم. شوف هاد المثال:

```java
@Repository
public class BuyerRepository {
    public void saveOrder(String orderId) {
        System.out.println("Order " + orderId + " saved to DB");
    }
}

@Service
public class ProcurementService {
    private final BuyerRepository buyerRepo;

    // الـ container هو لي كيجيب الـ dependency هنا
    @Autowired
    public ProcurementService(BuyerRepository buyerRepo) {
        this.buyerRepo = buyerRepo;
    }

    public void processOrder(String id) {
        buyerRepo.saveOrder(id);
    }
}
```
فهاد الحالة، `ProcurementService` ما مسوقش منين جا `BuyerRepository` ولا كيفاش تصاوب، هو عارف بلي غادي يلقاه واجد فاش يخدم البرنامج.

## غلط كيوقعو فيه بزاف ديال الناس
واحد الغلط شائع هو ملي المبرمج كيدير `@Autowired` ولكن فبلاصة أخرى كيدير `new ProcurementService()`. ملي كتستعمل `new` بيدك، راك خرجتي على الـ IoC container. النتيجة هي أن `buyerRepo` غادي يكون `null` وغادي تطلع ليك `NullPointerException` حيت الـ framework ما قدرش يدخل الـ dependency.

## مقارنة بين الطريقة العادية و IoC
| الميزة | الطريقة العادية | Inversion of Control |
| :--- | :--- | :--- |
| إنشاء الـ Object | يدوي (`new`) | الـ Container لي كيتكلف |
| الارتباط (Coupling) | قوي (Tight) | مرن (Loose) |
| التيست (Testing) | صعيب دير Mock | ساهل تـ injecti الـ mocks |

## تمرين تطبيقي
إلا كان عندك `ManagerService` محتاج `ApprovalService` وبغيتي تخدم بـ IoC، واش خاصك تكتب `this.approvalService = new ApprovalService();` وسط الـ constructor؟

**الجواب:** لا. خاصك تعلن على `ApprovalService` كـ final field وتخلي الـ IoC container هو لي يدخلو عن طريق الـ constructor باستعمال `@Autowired`.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
