---
title: "علاش Interfaces كيخليو Testing يكون ساهل"
description: "تعلم كيفاش تستعمل Interfaces فـ Java باش تفصل الكود ديالك وتقدر تدير simulation لشي خدمات معقدة بلا ما تحتاجهم يكونوا خدامين بصح."
pubDate: 2026-10-11T20:48:00.000Z
translationKey: 125-why-interfaces-make-testing-easier
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك كتصاوب application ديال الشرا (procurement) فين خاصك تصيفط email ملي شي طلب كيتقبل. إلا كنتي داير `new EmailService()` نيشان وسط الكود، كل مرة بغيتي تدير test، الـ application غتحاول تصيفط email بصح. هادشي كيخلي tests يكونوا تقال، ومكيبقاوش مضمونين حيت كيعتمدو على internet.

## مشكل الـ Tight Coupling
ملي كتكون class معولة على implementation وحدة محددة، كنسميوها 'tightly coupled'. إلا كان `ProcurementManager` كيكريي `EmailService` لداخل، ما تقدرش تيستي الـ logic ديال manager بلا ما تخدم الـ logic ديال email. هادشي كيصعب عليك تجرب شنو كيوقع إلا طاح السيرفر مثلاً.

## الحل هو Interfaces
باش نحل هاد المشكل، كنصاوبو Interface. دابا `ProcurementManager` مابقاش كيهمو *كيفاش* كيتصيفط الـ email، كيهمو غير أن داك object اللي عندو كيحترم الـ contract ديال `MessageSender`. هكا نقدروا نبدلو service ديال بصح بـ 'Mock' (واحد الـ object كيمثل service) غير فـ وقت الـ testing.

## مثال تطبيقي: عملية الشراء
ها كيفاش نقدروا نفصلو الكود:

```java
public interface MessageSender {
    void send(String recipient, String message);
}

public class EmailService implements MessageSender {
    public void send(String recipient, String message) {
        // هنا كيكون الكود اللي كيتصل بـ SMTP server
    }
}

public class ProcurementManager {
    private final MessageSender sender;

    public ProcurementManager(MessageSender sender) {
        this.sender = sender;
    }

    public void approveRequest(String user) {
        // logic ديال الموافقة على الطلب
        sender.send(user, "الطلب ديالك تقبل!");
    }
}
```
فـ الـ test، بلاصت ما تستعمل `EmailService` اللي كيصيفط بصح، كتعطيه `MockMessageSender` اللي غير كيقيد واش `send` تـعيطات ليها ولا لا، بلا ما يخرج للـ network.

## غلط شائع: كثرة الـ Interfaces
بزاف ديال المبرمجين كيديروا interface لكل class (مثلاً `ProcurementManagerImpl`). هادشي غير تضييع ديال الوقت وكيكثر الكود بلا فايدة. دير interface غير ملي تكون محتاج تبدل implementation، بحال فـ الـ APIs الخارجية أو قواعد البيانات.

## تمرين تطبيقي
إلا عندك class سميتها `PaymentProcessor` كتعيط لـ API ديال الخلاص بـ carte bancaire، كيفاش تنظمها باش تيستيها بلا ما تخلص فلوس حقيقية؟

**الجواب:** خاصك تصاوب interface سميتها `PaymentGateway`. الـ `PaymentProcessor` خاصو يعتمد على هاد الـ interface. فـ الخدمة (production) كتخدم بـ `StripeGateway` وفـ الـ tests كتخدم بـ `FakePaymentGateway`.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
