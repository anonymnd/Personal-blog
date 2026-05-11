---
title: "شنو كيدير بالضبط mvn spring-boot:run؟"
description: "شرح مفصل كيفاش كيخدم plugin ديال Spring Boot Maven والفرق بينو وبين المراحل العادية ديال Maven."
pubDate: 2026-10-14T02:48:00.000Z
translationKey: 179-what-does-mvn-spring-boot-run-actually-do
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك يلاه درتي clone لواحد المشروع، كتبتي `mvn spring-boot:run` فـ terminal، والتطبيق خدم. ولكن يلا شفتي logs، غادي تسول راسك: واش Maven غير compile الكود؟ واش صاوب شي fichier JAR؟ وعلاش هادشي ماشي هو نفس الشيء بحال `java -jar`؟

## Plugin Goal مقابل Lifecycle Phase
عكس `mvn clean` ولا `mvn install` ، هاد `spring-boot:run` ماشي phase عادية من مراحل Maven (lifecycle phase). هو عبارة عن goal خاص كيعطيه لينا `spring-boot-maven-plugin`. ملي كتخدم هاد command، Maven مكيتبعش الترتيب العادي ديال validate -> compile -> test -> package، ولكن كيدير عملية خاصة مصممة باش تسهل الخدمة على developer.

## كيفاش كيخدم هادشي؟
ملي كيدوز هاد goal، plugin كيتأكد أولا أن الكود ديالك compile. ولكن، مكيصاوبش JAR ولا WAR فـ dossier `target`. فبلاصة هادشي، كيصاوب واحد الـ classpath مؤقت فيه كاع classes لي تـcompilaو و dependencies ديال المشروع. من بعد، كيخدم التطبيق فـ JVM process بوحدو. هاد الطريقة كتخلينا نربحو الوقت حيت مكنحتاجوش نصاوبو archive كل مرة بغينا نجربو تغيير بسيط.

## مثال تطبيقي: تطبيق ديال المشتريات (Procurement)
تخايل عندك سيستيم ديال المشتريات فين `Requester` كيصيفط طلب شراء. زدتي واحد القاعدة جديدة ديال validation فـ class سميتها `RequestService`.

```java
// طرف من الكود للتوضيح
@Service
public class RequestService {
    public void submitRequest(PurchaseRequest req) {
        if (req.getAmount() <= 0) throw new IllegalArgumentException("Amount must be positive");
        // logic باش تسجل الطلب
    }
}
```

يلا درتي `mvn spring-boot:run` غادي يـcompile هاد التغيير ويخدم app ديريكت. يلا وقع شي crash، غادي يبان ليك stack trace. باش تعرف فين كاين المشكل، قلب على أول سطر فيه السمية ديال package ديالك (مثلا `com.procurement.RequestService`) ماشي السطور ديال Spring framework.

## غلط شائع: التخلاط مع Package
بزاف ديال developers كيسحاب ليهم بلي `mvn spring-boot:run` كيحدث الـ JAR لي كاين فـ `target`. هادشي غلط. يلا خديتي الـ JAR من `target/myapp-0.0.1-SNAPSHOT.jar` باش تـdeployih مورا ما خدمتي run، غادي تـdeployi نسخة قديمة حيت phase ديال packaging مـدوزاتش.

**التصحيح:** خدم `mvn package` ولا `mvn install` يلا كنتي محتاج fichier JAR حقيقي باش تـdeployih.

## تمرين تطبيقي
سؤال: يلا خدمتي `mvn spring-boot:run` ومسحتي dossier `target/classes` والتطبيق باقي خدام، واش غادي يوقع crash فالبلاصة؟

الجواب: لا. حيت JVM ديجا شارجي كاع classes لي محتاج فـ memory ملي بدا التطبيق.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
