---
title: "Streams vs Loops: فوقاش تستعمل كل وحدة؟"
description: "دليل عملي باش تعرف تختار بين for-loops العادية و Java Streams فاش كتكون خدام على البيانات."
pubDate: 2026-10-11T21:48:00.000Z
translationKey: 126-streams-vs-loops-when-should-you-use-each
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app)، وفين كيكون manager خاصو يفلتر لستة ديال الطلبات اللي باقين pending باش يخرج غير دوك اللي فايتين 5,000 دولار. تقدر تبدا تكتب for-loop عادية، ولكن كتشوف واحد زميلك خدام بـ `.filter().collect()`. هنا غاتسول راسك: واش هاد Stream API غير زواق باش نبانو موديرن، ولا بصح كاين فرق فكيفاش الكود كيخدم؟

## الطريقة العادية: Loops
الـ loops كيتسماو imperative، حيت كتقول لـ Java بالضبط *كيفاش* تدير الخدمة. نتا اللي كتحكم فـ index، وفـ الحالة ديال الـ accumulator، وفوقاش تحبس. هاد الطريقة مزيانة بزاف يلا كنتي محتاج تبدل شي حاجة برا الـ loop (side effects) أو يلا بغيتي تخرج من الـ loop قبل الوقت باستعمال `break` أو `continue`. الـ loops ساهلين فـ debugging حيت كتمشي معاهم خطوة بخطوة.

## الطريقة الوظيفية: Streams
الـ Streams كيتسماو declarative؛ يعني كتقول لـ Java *شنو* بغيتي، ماشي كيفاش تديرو. بلاصة ما تسير loop، كدير سلسلة ديال العمليات بحال `filter` و `map` و `reduce`. الـ Streams واعرين فاش كتكون باغي تحول البيانات (transformation). كايفرقو بين "شنو بغينا نديرو" و "كيفاش غاندوزو على البيانات"، وهادشي كيخلي الكود يكون قصير وسهل فـ القراية.

## مثال تطبيقي: تصفية المشتريات
نفترضو عندنا record سميتو `PurchaseRequest` فيه `double amount` و `String status`.

```java
// باستعمال Loop
List<PurchaseRequest> expensiveRequests = new ArrayList<>();
for (PurchaseRequest req : allRequests) {
    if ("PENDING".equals(req.status()) && req.amount() > 5000) {
        expensiveRequests.add(req);
    }
}

// باستعمال Stream
List<PurchaseRequest> expensiveRequestsStream = allRequests.stream()
    .filter(req -> "PENDING".equals(req.status()))
    .filter(req -> req.amount() > 5000)
    .toList();
```
فـ الـ loop، حنا اللي كنعمرو لستة `expensiveRequests` بيدينا. أما فـ الـ stream، الـ pipeline هو اللي كيتكلف بكلشي.

## غلط شائع: كذبة السرعة
بزاف ديال المطورين كيسحاب ليهم بلي الـ Streams ديما أسرع حيت هوما الجداد. فالحقيقة، فـ لستات الصغار، for-loop العادية تقدر تكون أسرع حيت مافيهاش كثرة الـ objects. الـ Streams كينفعو فـ السرعة غير يلا خدمتي بـ `.parallelStream()` ومع بيانات كبيرة بزاف باش تستغل كاع الـ cores ديال CPU.

## جدول المقارنة
| الميزة | Loop | Stream |
| :--- | :--- | :--- |
| التحكم | كامل (break/continue) | محدود (terminal ops) |
| الحالة (State) | ساهل تبدلها | كيشجع على immuability |
| القراية | طويلة فـ الفلترة | قصيرة وواضحة |

## تمرين تطبيقي
عندك لستة ديال `PurchaseRequest` وبغيتي تحسب المجموع (sum) ديال كاع الطلبات اللي status ديالهم "APPROVED" باستعمال Stream. كيفاش غادير ليها؟

**الجواب:** `allRequests.stream().filter(r -> "APPROVED".equals(r.status())).mapToDouble(PurchaseRequest::amount).sum();`


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
