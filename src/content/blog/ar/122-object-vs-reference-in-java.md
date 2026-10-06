---
title: "الفرق بين Object و Reference في Java"
description: "فهم الفرق بين الـ Object والـ Reference في جافا باش تفادى المشاكل ديال NullPointerException والأخطاء في المنطق ديال الكود."
pubDate: 2026-10-11T17:48:00.000Z
translationKey: 122-object-vs-reference-in-java
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). صاوبتي Object سميتو `PurchaseRequest` وبغيتي تبدل الحالة (status) ديالو فواحد الـ method، ولكن لاحظتي أن التغيير ما بقاش، أولا طلع ليك `NullPointerException`. هادشي كيوقع حيت بزاف ديال المبرمجين كيخلطو بين الـ Object (اللي هو الداتا فالميموار) والـ Reference (اللي هو غير العنوان فين كاين ديك الداتا).

## Object والقيم اللي كتشير ليه
Object عندو حالة وهوية؛ reference value كتخلي كود Java يوصل ليه. References ماشي غير فـ local variables: field ديال object ولا عنصر فـ array حتى هو يقدر يحمل reference. JVM عندها memory model وكتقدر تدير optimizations ففين كيتخزن object فعليا. ما خاصكش تعرف عنوان رقمي فالميموار باش تفهم aliasing: جوج ديال المتغيرات يقدرو يشيرو لنفس object.
## قضية Pass-by-Value
كاين غلط شائع كيقول بلي جافا كتدوز الـ Objects بـ reference. ولكن الحقيقة هي أن جافا ديما كتدوز بـ value. ملي كتدوز Object لشي method، راك كتدوز نسخة من العنوان (reference value) ماشي الـ Object راسو.

شوف هاد المثال:
```java
public void processRequest(PurchaseRequest request) {
    request.setStatus("APPROVED"); // هنا كنبدلو الـ Object اللي فـ Heap
    request = new PurchaseRequest(); // هنا بدلنا غير النسخة ديال العنوان اللي فـ method
}
```
ف هاد الكود، تبديل الـ status خدام حيت العنوان الأصلي والنسخة بجوج كيشيرو لنفس الـ Object. ولكن ملي درنا `request = new...` بدلنا غير العنوان المحلي، أما الـ variable اللي برا الـ method بقى كيشير للـ Object الأول.

## Null ماشي بحال local variable ما تهيأتش
Reference تقدر تكون `null`، يعني ما كتشير حتى لـ object. إلا عيطتي على method ديالها، غالبا غتاخد NullPointerException. Field ديال object من نوع reference كيكون null افتراضيا إلا ما تهيأش. ولكن local variable بحال `PurchaseRequest req;` مختلفة: Java ما كيخليكش تستعملها قبل ما تعطيها قيمة، وكيوقع compile error. إلا درتي `PurchaseRequest req = null;` راه عطيتها قيمة، ولكن العيطة لـ `req.setStatus(...)` غتفشل فوقت التشغيل.
## الهوية وequals اللي كتحددها class
بالنسبة لـ references، `a == b` كيسول واش بجوج كيشيرو لنفس object، وحتى إلا كانو بجوج null. `a.equals(b)` كيطلق تعريف المساواة اللي دايراه class. Equals الموروثة من Object حتى هي كتعتمد على الهوية؛ خاص class تبدلها باش تقارن القيم. String والـ records عندهم مقارنة بالقيمة مفيدة. `Objects.equals(a, b)` كتتعامل حتى مع null. اختار الهوية ولا مقارنة القيم على حساب الدومين، ماشي تبدل أي == بلا ما تفكر.
## تمرين تطبيقي
إلا كان عندك `PurchaseRequest a = new PurchaseRequest("Laptop");` و درتي `PurchaseRequest b = a;` ، شنو غادي يوقع لـ `a` إلا عيطتي لـ `b.setAmount(1000);` ؟

**الجواب:** `a` حتى هي غادي يولي فيها 1000، حيت `a` و `b` بجوجهم غير عناوين كيشيرو لنفس الـ Object اللي كاين فـ Heap.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
