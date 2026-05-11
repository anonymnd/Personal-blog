---
title: "شنو هي Dependency Injection؟"
description: "دليل للمبتدئين باش يفهمو كيفاش الـ Dependency Injection كتفرق بين المكونات في تطبيقات Spring Boot."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 055-what-is-dependency-injection
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال الشراء (procurement app). عندك واحد الـ `PurchaseOrderService` اللي محتاج `NotificationService` باش يصيفط إيميلات. إلا كتبتي `NotificationService service = new EmailNotificationService();` وسط الكلاس، راك ربطتيهم بطريقة صلبة (hard-coded). إلا بغيتي من بعد تبدل الإيميل بـ SMS، خاصك تمشي تبدل الكود في كاع لي سيرفيس اللي كيخدمو به. هادشي كيتسمى tight coupling، وهو اللي كيصعب التيست والميانة ديال الكود.

## كيفاش كتخدم
الـ Dependency Injection (DI) هي واحد الطريقة فين الكلاس مكاتصاوبش الاعتمادات (dependencies) ديالها براسها. بلاصتها، واحد الجهة خارجية (اللي هي Spring IoC Container) هي اللي "كتدفع" (inject) هاد الكائنات فاش كيكون البرنامج خدام. هكذا، المسؤولية ديال إنشاء الكائنات كتولي عند الـ framework ماشي عند الكلاس، وهادشي كيخليك تبدل النوع ديال الخدمة بلا ما تقيس الكود ديال الكلاس اللي خدامة بها.

## مثال ديال Constructor Injection
في Spring Boot دابا، أحسن طريقة هي تخدم بالـ constructor injection. هاد الطريقة كتضمن أن الكلاس بدات بجميع الحوايج اللي محتاجة، وكتخليك تخدم بـ `final fields` باش يكون الكود ديالك stable.

```java
@Service
public class PurchaseOrderService {
    private final NotificationService notificationService;

    // Spring هنا كيدير الـ injection
    public PurchaseOrderService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void completeOrder(Order order) {
        // منطق إكمال الطلب
        notificationService.send("Order " + order.getId() + " is ready!");
    }
}
```

## النتيجة والمزايا
حيت خدمنا بـ `NotificationService` كـ interface ماشي كـ class محددة، الـ `PurchaseOrderService` مابقاش مسوق كيفاش كيتصيفط الميساج. النتيجة هي سيستيم مرن، تقدر تزيد `MockNotificationService` فاش تكون كدير التيست باش ماتصيفطش إيميلات حقيقية وتضيع الوقت.

## غلط شائع: Field Injection
بزاف ديال المبتدئين كيستعملو `@Autowired` نيشان فوق الـ private fields. واخا كتبان ساهلة، ولكن كتخلي الكلاس صعيبة في التيست حيت ماتقدرش تصاوب منها object بلا ما تخدم بـ reflection أو تطلع الـ Spring context كامل.

**التصحيح:** ديما خدم بالـ constructor injection. هادشي كيخلي الاعتمادات واضحة وكيضمن أن الكلاس ديما واجدة للخدمة.

## تمرين تطبيقي
صاوب `BuyerService` اللي كيعتمد على `VendorRepository`. كيفاش خاصك تعرف الـ field والـ constructor باش تحترم قواعد DI؟

**الجواب:** خاصك تعرف `VendorRepository` كـ `private final` field، وتصاوب constructor public كياخد هاد الـ repository كـ parameter وكيعمر بيه الـ field.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
