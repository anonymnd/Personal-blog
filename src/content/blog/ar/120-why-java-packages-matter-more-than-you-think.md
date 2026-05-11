---
title: "علاش الـ Packages فـ Java مهمين كتر ملي كتصحاب"
description: "تعرف كيفاش الـ packages كيمنعوا تضارب السميات وكيظموا الكود ديالك فـ تطبيقات كبيرة."
pubDate: 2026-10-11T15:48:00.000Z
translationKey: 120-why-java-packages-matter-more-than-you-think
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement system). صاوبتي واحد الـ class سميتها `Request` باش تسير الطلبات ديال المستخدمين. من بعد، بغيتي تزيد واحد المكتبة (library) ديال الشحن اللي حتى هي فيها class سميتها `Request`. هنا غادي يتلف الـ compiler وغادي يوقع ليك مشكل فـ الـ imports. هنا فين كيبان الدور ديال الـ Java packages، حيت ماشي غير دوسيات، بل هي وسيلة باش تنظم الخدمة.

## كيفاش كيخدم الـ Namespacing
فـ Java، الـ package كيعطيك واحد الـ namespace فريد. الـ class ما كتعرفش غير بسميتها (مثلا `Request`) ولكن بـالسمية الكاملة ديالها (Fully Qualified Class Name - FQCN)، بحال `com.company.procurement.Request`. هادشي كيخلي جوج ديال الـ classes عندهم نفس السمية يخدموا فـ نفس المشروع بلا مشاكل، حيت Java كتعبرهم أنواع (types) مختلفة تماماً مادام كل وحدة فـ package بوحدها.

## تنظيم الخدمة فـ تطبيق الشراء
باش ما ترونش الكود، خاصك تجمع الـ classes على حساب الخدمة ديالهم. مثلاً فـ تطبيق الشراء:

- `com.app.request`: فيها `PurchaseRequest` و `Requester`.
- `com.app.approval`: فيها `ApprovalManager` و `ApprovalStatus`.
- `com.app.ordering`: فيها `Buyer` و `OrderDetails`.

## مثال تطبيقي: تفادي تضارب السميات
شوف هاد المثال كيفاش نفرقو بين الـ request ديالنا والـ request ديال مكتبة خارجية:

```java
package com.app.procurement;

public class RequestManager {
    public void process() {
        // الـ request ديالنا الداخلية
        com.app.procurement.Request internalReq = new com.app.procurement.Request();
        
        // الـ request ديال المكتبة الخارجية
        com.external.shipping.Request externalReq = new com.external.shipping.Request();
        
        System.out.println("بجوجهم خدامين بلا مشاكل.");
    }
}
```
ملي كنستعملو الـ FQCN، الـ JVM كتعرف بالضبط أما code خاصها تخدم.

## غلط شائع: الـ Default Package
بزاف ديال المبتدئين كيحطو الـ classes كاملين بلا package (default package). هادشي يقدر يدوز فـ تمارين صغار، ولكن فـ تطبيق حقيقي راه غلط كبير. حيت الـ classes اللي فـ default package ما يمكنش تـ importيهم فـ packages خرين، وهادشي كيخلي الكود ديالك ما صالحش للاستعمال فـ مشاريع أخرى.

## تمرين تطبيقي
إلا كانت عندك class سميتها `User` فـ `com.app.auth` و وحدة أخرى سميتها `User` فـ `com.app.profile` واش تقدر تخدم بيهم بجوج فـ نفس الـ method بلا ما تكتب المسار الكامل (full path) ديال وحدة فيهم على الأقل؟

**الجواب:** لا. تقدر دير import لوحدة فيهم مثلاً `import com.app.auth.User;` ولكن الثانية ضروري تكتب ليها المسار الكامل `com.app.profile.User` باش ما يوقعش تضارب.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
