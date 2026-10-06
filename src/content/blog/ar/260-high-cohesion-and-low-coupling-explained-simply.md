---
title: "شرح مبسط لـ High Cohesion و Low Coupling"
description: "تعلم كيف تنظم الكود ديالك باش تنقص من التبعية (dependencies) وتسهل الصيانة باستعمال مبادئ الـ Cohesion والـ Coupling."
pubDate: 2026-10-17T11:48:00.000Z
translationKey: 260-high-cohesion-and-low-coupling-explained-simply
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). فالبداية، جمعتي الفورم ديال اللي كيطلب (requester)، واللوجيك ديال الموافقة ديال المدير (manager)، والسيستيم ديال الشراء ديال الـ buyer كاملين فـ class وحدة سميتها `ProcurementManager`. فالبداية جاتك ساهلة، ولكن مع الوقت، وليتي غير كتغير شي حاجة فكيفاش المدير كيوافق، كتلقى راسك خسرتي اللوجيك ديال الشراء بلا ما تحس.

## شنو هي الـ Cohesion؟
الـ Cohesion كتعني شحال المهام اللي وسط module واحد مترابطين بيناتهم. ملي كنقولو High Cohesion، يعني هاد الـ module كيدير حاجة وحدة وكيديرها مزيان. مثلاً، إلا كان `ApprovalService` كيتكلف غير بالتأكد من الصلاحيات ديال المدير وتغيير الحالة ديال الطلب، هنا عندنا High Cohesion. ولكن إلا زدنا فيه صيفط الإيميلات وحساب الضرائب، هنا الـ Cohesion كتنقص حيت ولا كيدير بزاف ديال الحوايج مفرقين.

## شنو هو الـ Coupling؟
الـ Coupling هو درجة الارتباط بين جوج modules. Low Coupling كتعني أنك تقدر تبدل module بلا ما تضطر تبدل لخرين. إلا كان `BuyerService` كيدخل نيشان للجداول ديال الداتابيز ديال `RequesterService` باش يجبد معلومات، هنا كاين Tight Coupling (ارتباط قوي). ولكن إلا استعملنا method بسيطة بحال `getRequestDetails()`، هنا الـ Coupling كيكون قليل حيت التفاصيل ديال الداتابيز مخبية.

## مثال تطبيقي
شوف الفرق بين هاد جوج طرق فاش كنتعاملوا مع طلب شراء:

**Coupling قوي و Cohesion ضعيفة:**
```java
public class ProcurementSystem {
    public void processRequest(Request req) {
        // لوجيك ديال Validation
        // لوجيك ديال Approval
        // لوجيك ديال Ordering
        // لوجيك ديال Email
    }
}
```
**Coupling ضعيف و Cohesion قوية:**
```java
public class ApprovalService {
    public boolean approve(Request req) { /* logic */ return true; }
}

public class OrderService {
    public void placeOrder(Request req) { /* logic */ }
}
```
فالحالة الثانية، `OrderService` ما كيهمش كيفاش خدام `ApprovalService`؛ اللي كيهمو هو واش الطلب تقبل ولا لا. هادشي كيخلينا نبدلو طريقة الموافقة بلا ما نقيسو الكود ديال الشراء.

## غلط شائع: وهم الـ Interface
بزاف ديال المطورين كيسحاب ليهم غير يديرو Interface (مثلاً `IApprovalService`) راه صافي ولا عندهم Low Coupling. ولكن، إلا كانت الـ method ديال الـ interface كتحتاج object معقد مرتبط بتفاصيل داخلية ديال module آخر، راه باقي عندك Coupling قوي. الـ Coupling كيتعلق بالتبعية (dependency) ماشي غير بالشكل ديال الكود.

## تمرين تطبيقي
**الوضعية:** عندك `NotificationModule` فيه كود باش يصيفط SMS و Emails، وفيه حتى الكود اللي كيحسب التخفيض الشهري ديال المستخدم.
**السؤال:** واش هادي High Cohesion ولا Low Cohesion؟ وكيفاش تصححها؟

**الجواب:** هادي Low Cohesion. حيت حساب التخفيض ما عندو علاقة بالإشعارات. الحل هو تحيد حساب التخفيض وتديرو فـ `BillingService` بوحدو.
