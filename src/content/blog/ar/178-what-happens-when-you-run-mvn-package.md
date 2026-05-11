---
title: "شنو كيوقع ملي كانديرو mvn package؟"
description: "شرح مفصل للمراحل اللي كيدوز منها Maven باش يجمع الكود ديال Java فـ fichier JAR ولا WAR."
pubDate: 2026-10-14T01:48:00.000Z
translationKey: 178-what-happens-when-you-run-mvn-package
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك ساليتي واحد الـ feature فـ application ديال الشرا (procurement app) فين manager كيوافق على الطلبات. بغيتي تصيفط هاد الـ app للسيرفور، ولكن ماعارفش واش الكود كيـ compile مزيان ولا واش tests دازو. هنا فين كنحتاجو `mvn package`. هادي ماشي غير command وحدة، بل هي سلسلة ديال المراحل (Lifecycle) اللي كيدوز منها المشروع.

## التسلسل ديال المراحل
ملي كتكتب `mvn package` في terminal، Maven ماكيمشيش نيشان لـ package. كيدوز على كاع المراحل اللي قبل منها: أولا `validate` باش يشوف واش المشروع مقاد، من بعد `compile` اللي كيحول الملفات `.java` لـ `.class`. موراها كتجي `test` فين كيدوز Maven Surefire Plugin كاع الـ unit tests. إلا كان شي test ما دازش، Maven كيوقف كلشي باش ما يخرجش لينا JAR فيه أخطاء.

## كيفاش كيتم الـ Packaging
إلا دازو الـ tests كاملين، Maven كيوصل لمرحلة `package`. كياخد الكود اللي تـ compila فـ `target/classes` وكيجمعو فـ format اللي محدد فـ `pom.xml` (غالبا `<packaging>jar</packaging>`). بالنسبة للـ app ديالنا، غادي يخرج لينا ملف سميتو `procurement-app-1.0.jar` وسط dossier `target`. JAR عادي ديال Maven فيه classes و resources ديال المشروع، ولكن ما كيضمش dependencies أوتوماتيكيا وما كيوليش executable بوحدو. Spring Boot repackage إلا كان مقاد يقدر يصاوب archive كتخدم وفيها dependencies.

## مثال تطبيقي: Build ديال App الشرا
نشوفو هاد الطرف ديال `pom.xml`:
```xml
<groupId>com.app</groupId>
<artifactId>procurement-system</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```
ملي كانديرو `mvn package` كيوقع هادشي:
1. **Compile**: `ProcurementRequest.java` كيرجع `ProcurementRequest.class`.
2. **Test**: `ApprovalTest.java` كيدوز، والنتائج كيكونوا فـ `target/surefire-reports`.
3. **Package**: كاع الـ classes كيتجمعوا فـ `target/procurement-system-1.0-SNAPSHOT.jar`.

## غلط شائع: بقايا قديمة
بزاف ديال الناس كيديرو `mvn package` وكيستغربو علاش كاينين classes قدام (اللي ديجا مسحناهم) باقيين فـ JAR. هادشي حيت `package` ماكيمسحش dossier `target`. باش تفادى هاد المشكل، خاصك تخدم بـ `mvn clean package`. الـ `clean` كيمسح `target` كامل باش تبدا من الزيرو.

## تمرين تطبيقي
إلا درتي `mvn package` ووقع مشكل (fail) فـ المرحلة ديال `test` ، واش غادي يتكريا الملف `.jar` فـ dossier `target` ؟

**الجواب**: لا. Maven كيوقف العملية كاملة غير يلقى أول غلط، باش يضمن أن الكود اللي تـ packaga هو كود خدام ومجرب.

إلا test فشل، هاد التشغيل ما كيصاوبش JAR جديد؛ ولكن JAR قديم يقدر يبقى فـ target. نجاح tests ما كيعنيش ما كاين حتى bug.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
