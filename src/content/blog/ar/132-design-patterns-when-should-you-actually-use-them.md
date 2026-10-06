---
title: "Design Patterns: فوقاش خاصك تستعملهم بصح؟"
description: "دليل عملي باش تفادى التعقيد الزايد وتعرف الوقت المناسب فين تخدم بـ design pattern."
pubDate: 2026-10-12T03:48:00.000Z
translationKey: 132-design-patterns-when-should-you-actually-use-them
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المبرمجين كيوقعوا فواحد الفخ هو أنهم كيبقاو يقلبوا على patterns فين يحطوهم، بحال Singleton ولا Factory، وخا المشكل أصلاً مازال ما بانش. هادشي كيخلي الكود يولي عامر بـ abstractions ما عندها معنى وكتصعب الخدمة فاش كتبغي تصحح الأخطاء (debug).

## فوقاش كيكون الـ Pattern ضروري
الـ design pattern ماشي هو باش تبدا المشروع، بل هو حل لمشكل كيتعاود. خاصك تستعملو غير فاش تحس بلي الكود ديالك بدا كيولي « ثقيل » ولا معقد. مثلاً، إلا لقيتي راسك كتعاود نفس الكود ديال initialization فخمسة ديال لي كلاس، هنا عندك مشكل فـ creation.

## مثال تطبيقي: تطبيق ديال المشتريات (Procurement)
تخيل عندك تطبيق ديال المشتريات فين `PurchaseRequest` خاصها تدوز من validation على حسب القسم (department). فالبداية، تقدر تخدم بـ `if-else` طويلة. ولكن فاش كيبداو يتزادوا الأقسام (IT, RH, Marketing)، الكود كيولي مرون.

هنا كيجي الدور ديال **Strategy Pattern**. عوض ما دير `if-else` كبيرة، كدير interface سميتها `ValidationStrategy` وكل قسم كيكون عندو الـ implementation ديالو.

```java
public interface ValidationStrategy {
    boolean validate(PurchaseRequest request);
}

public class ITValidation implements ValidationStrategy {
    public boolean validate(PurchaseRequest request) {
        // كنقلبو واش الماتيريال مقبول
        return request.getAmount() < 5000;
    }
}
```
بهاد الطريقة، إلا بغيتي تزيد قسم جديد، ما غاديش تقيس الكود القديم، وهادشي هو اللي كنسميوه Open/Closed Principle.

## غلط شائع: التعقيد قبل الوقت
واحد الغلط كيديروه بزاف هو فاش كيدير `GenericManagerFactory` لشي كلاس اللي عارفها غتبقى ديما عندها غير implementation وحدة. هادشي غير تضيع ديال الوقت وزيادة ديال لي فيشي بلا فايدة.

**التصحيح:** بدا بكلاس عادية (concrete class). ومادير interface ولا factory حتى تولي محتاج فعلاً لـ implementation ثانية ولا بغيتي تخدم بـ mocks فـ unit testing.

## فوقاش تحيد الـ Pattern
إلا بان ليك بلي الـ pattern خلى الكود صعيب فالفهم بالنسبة لمبرمج مبتدئ، وما زاد حتى شي فايدة حقيقية فـ flexibility، حيدو. البساطة هي أهم حاجة.

## تمرين تطبيقي
عندك `NotificationService` كيسيفط غير emails. دابا الكليان بغا تزيد SMS و Push notifications. واش تخدم بـ pattern دابا ولا تسنى؟

**الجواب:** دابا هو الوقت المناسب. خدم بـ Strategy ولا Observer باش تعزل البلاصة فين كيبدا الإشعار على الطريقة باش كيوصل.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
