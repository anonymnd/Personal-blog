---
title: "شرح الـ Interfaces من خلال Architecture ديال تطبيق حقيقي"
description: "تعلم كيفاش تستعمل Interfaces فـ Java باش تفصل Logic ديال الخدمة على طريقة التنفيذ باستعمال مثال ديال تطبيق ديال الشراء."
pubDate: 2026-10-11T19:48:00.000Z
translationKey: 124-interfaces-explained-through-real-application-architecture
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. فالبداية، تقدر تصاوب Class كتصيفط Notification بـ Email. ولكن شنو غيوقع إلا الشركة قررات تبدل Slack ولا SMS؟ إلا كنتي رابط Logic ديالك مباشرة بـ `EmailService` class، غادي تضطر تبدل الكود فكل مرة بغيتي تغير وسيلة التواصل. هنا فين كيجيو الـ Interfaces باش يحلو مشكل 'الارتباط القوي' (tight coupling).

## الدور ديال Interface
الـ Interface هي بحال شي 'كونترا' (contract). كتقول للتطبيق *شنو* يقدر يدير هاد السيرفيس، ولكن مكاتقولش *كيفاش* كيدير ليها. فالتطبيق ديالنا، ميهمناش كيفاش كتصيفط Notification، المهم هو تكون عندنا ميثود سميتها `sendNotification` خدامة.

## تصميم الكونترا ديال الشراء
ها كيفاش كنصاوبو Interface ديال Notification:

```java
public interface NotificationService {
    void sendNotification(String recipient, String message);
}
```

دابا نصاوبو جوج ديال التنفيذات (implementations)، وحدة لـ Email ووحدة لـ Slack:

```java
public class EmailNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Sending Email to " + recipient + ": " + message);
    }
}

public class SlackNotification implements NotificationService {
    public void sendNotification(String recipient, String message) {
        System.out.println("Posting to Slack channel " + recipient + ": " + message);
    }
}
```

## كيفاش كنخدمو بها فالتطبيق
فـ `ProcurementManager` class، كنخدمو بـ Interface ماشي بـ Class محددة. هادشي كيخلينا نبدلو النوع ديال Notification بلا ما نقيسو Logic ديال Manager.

```java
public class ProcurementManager {
    private final NotificationService notificationService;

    public ProcurementManager(NotificationService service) {
        this.notificationService = service;
    }

    public void approveRequest(String requester) {
        // Logic ديال الموافقة
        notificationService.sendNotification(requester, "Request approved!");
    }
}
```

## غلط شائع: كترت الـ Interfaces
بزاف ديال الناس كيصاوبو Interface لكل Class واخا عارفن بلي غيكون عندها غير تنفيذ واحد. هادشي غير كيكتر الكود بلا فايدة. استعمل Interface غير إلا كنتي متوقع يكون عندك بزاف ديال الطرق للتنفيذ أو بغيتي تسهل الـ Testing.

## تمرين تطبيقي
**المطلوب:** صاوب Interface سميتها `PaymentProcessor` فيها ميثود `processPayment(double amount)`. ومن بعد صاوب ليها جوج تنفيذات: `CreditCardPayment` و `PayPalPayment`.

**التأكد:** واش `ProcurementManager` كيقبل `PaymentProcessor` فـ constructor ديالو؟ إلا كان اه، راك فهمتي كيفاش تفصل Logic على Implementation.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
