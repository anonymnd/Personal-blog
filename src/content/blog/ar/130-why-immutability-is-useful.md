---
title: "علاش الـ Immutability مفيدة"
description: "تعرف على كيفاش تصاوب objects ما كيتبدلوش مورا ما يتكرياو باش تنقص من bugs وتسهل التحكم في state ديال application Java."
pubDate: 2026-10-12T01:48:00.000Z
translationKey: 130-why-immutability-is-useful
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على application ديال الشرا (procurement)، فين كاين `PurchaseRequest`. الموظف كيصيفط الطلب، manager كيوافق عليه، ومن بعد buyer كيشري السلعة. إلا كان هاد الـ object mutable (كيتبدل)، يقدر شي developer يغلط ويبدل الثمن ديال الطلب مورا ما manager وافق عليه، وهذا غايدير مشاكل كبيرة في الحسابات وصعيب تلقى فين كاين المشكل.

## كيفاش خدامة
الـ Immutability كتعني أن الـ object ملي كيتكريا، الحالة (state) ديالو مابقاش تبدل. في Java، كنديرو هادشي عن طريق `final` في الـ fields وما كنديروش setter methods. إلا بغينا نبدلو شي قيمة، ما كنبدلوش الـ object اللي عندنا، ولكن كنكريو واحد جديد فيه المعلومات الجديدة. هكا أي بلاصة في الكود عندها reference لهاد الـ object كتكون متأكدة أن الداتا ما غاتبدلش.

## تطبيق عملي بـ Records
الـ Records في Java هي أسهل طريقة باش تدير shallow immutability، حيت كاع الـ fields كيكونوا `final` أوتوماتيكيا.

```java
public record PurchaseRequest(long id, String item, double amount) {}

// استعمال
PurchaseRequest request = new PurchaseRequest(101, "Laptop", 1200.00);
// request.amount = 1500.00; // هنا غايعطيك error حيت final
```

## Thread Safety والوضوح
ملي كيكون عندك بزاف ديال threads خدامين في دقة وحدة، الـ objects اللي كيتبدلو (mutable) كيخصهم synchronization معقدة باش ما يوقعش تداخل. ولكن الـ immutable objects كيكونوا thread-safe بطبيعتهم، حيت ما دام ما كيتبدلوش، أي thread يقدر يقراهم بلا ما يخاف أن شي thread آخر يكون بدل فيهم شي حاجة في نفس الوقت.

## غلط شائع: Shallow vs Deep Immutability
بزاف كيصحابلهم أن `record` كافي باش يكون الـ object immuable واخا يكون فيه list.

*غلط:* `public record Order(List<String> items) {}` — هنا الـ reference ديال list هي اللي final، ولكن نقدر نزيد items لداخل بـ `.add()`.
*تصحيح:* خاصك تستعمل `List.copyOf()` في الـ constructor باش تضمن أن حتى الـ list ما تبدلش.

## تمرين تطبيقي
صاوب class immuable سميتها `UserSession` فيها `userId` و `token`. كيفاش تقدر "تحدث" (update) الـ token ديال شي session كاين دابا؟

**الجواب:** حيت الـ object immuable، ما تقدرش تبدل الـ token. خاصك تكريي instance جديدة ديال `UserSession` وتعطيها الـ `userId` القديم والـ `token` الجديد.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
