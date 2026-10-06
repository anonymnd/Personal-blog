---
title: "علاش جوج ديال لي كلاس فـ Java عندهم نفس السمية ولكن كيتعتبرو أنواع مختلفة"
description: "فهم كيفاش الـ packages و الـ class loaders كيمنعو تداخل السميات و كيديرو أنواع مختلفة فـ JVM."
pubDate: 2026-10-11T14:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (procurement app). عندك كلاس سميتها `Request` فـ package سميتو `com.app.requester` وكلاس أخرى بنفس السمية `Request` فـ package سميتو `com.app.manager`. جيتي تصيفط الـ request ديال requester لواحد الـ method ديال manager، ولكن الـ compiler عطاك error ديال Type Mismatch. واخا بجوجهم سميتهم `Request` ولكن Java كتشوفهم بحال جوج حوايج مختلفين تماماً.

## الدور ديال Fully Qualified Names
فـ Java، السمية ديال الكلاس ماشي هي غير داك الاسم اللي كتشوف فـ الملف. الهوية الحقيقية هي الـ Fully Qualified Name (FQN)، اللي هي عبارة على الطريق ديال الـ package متبوعة بسمية الكلاس. يعني `com.app.requester.Request` و `com.app.manager.Request` مختلفين بحال `String` و `Integer`. الـ package كايخدم بحال واحد الـ namespace باش كل موديل يقدر يستعمل سميات عادية بلا ما يتصادمو.

## الـ Class Loaders والهوية فـ Runtime
من غير الـ packages، الـ JVM كتستعمل Class Loaders باش تطلع الـ bytecode. أي كلاس كتعرف بـ FQN ديالها ومع الـ Class Loader اللي طلعها. إلا كانو جوج ديال class loaders مختلفين طلعو نفس الملف `.class` من بلايص مختلفين، الـ JVM كتعبرهم جوج أنواع مختلفة. هادشي كيوقع بزاف فـ الـ plugins ولا السيرفورات ديال التطبيقات.

## مثال تطبيقي: مشكل فـ طلبات الشراء
شوف هاد المثال فين كنحاولو نسيرو طلب شراء:

```java
package com.app.requester;
public class Request { public String item = "Laptop"; }

package com.app.manager;
public class Request { public boolean approved = false; }

public class ProcurementService {
    public void process(com.app.manager.Request mgrReq) {
        System.out.println("Processing...");
    }

    public void run() {
        com.app.requester.Request req = new com.app.requester.Request();
        // process(req); // هنا غادي يوقع error فـ الـ compilation
    }
}
```
النتيجة: الـ method اللي سميتها `process` كتسنى `manager.Request`. إلا عطيتيها `requester.Request` ما غاديش تخدم حيت الـ FQN مختلف، وهكا Java كتضمن أن المنطق ديال manager ما يغلطش ويخدم بـ data ديال requester.

## غلط شائع: تداخل الـ Imports
بزاف ديال المبرمجين كيديرو `import com.app.requester.*;` و `import com.app.manager.*;` فـ نفس الملف. إلا كانو بجوج فيهم كلاس سميتها `Request` واستعملتي كلمة `Request` بوحدها، الـ Java ما غاديش تعرف شكون فيهم وكيعطيك ambiguity error.

**التصحيح:** استعمل الـ FQN كامل وسط الكود (مثلاً `com.app.requester.Request req = new ...`) أو دير import لواحد منهم والآخر استعمل ليه الـ FQN.

## تمرين تطبيقي
إلا كان عندك `package a.User` و `package b.User` واش تقدر دير cast لـ instance ديال `a.User` باش تولي `b.User` باستعمال `(b.User) myUser`؟

**الجواب:** لا، غادي يوقع `ClassCastException` فـ الـ runtime حيت هما أنواع مختلفة واخا عندهم نفس السمية.


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
